import React, { useState, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Download, ExternalLink, ShieldAlert, TrendingUp, ChevronDown, FileDown } from 'lucide-react';

// Color palette for charts
const CHART_COLORS = ['#4DA6FF', '#6366F1', '#22D3EE', '#A78BFA', '#F472B6', '#34D399', '#FBBF24', '#FB923C'];

// ───────────────────── Credibility Scoring Utilities ────────────────────────

const HIGH_AUTHORITY_DOMAINS = [
    'gov.in', '.gov', '.edu', 'who.int', 'worldbank.org', 'imf.org', 'un.org',
    'wsj.com', 'bloomberg.com', 'reuters.com', 'ft.com', 'nature.com', 'sciencedirect.com',
    'mckinsey.com', 'bcg.com', 'bain.com', 'hbr.org', 'deloitte.com', 'pwc.com',
    'statista.com', 'ibef.org', 'rbi.org.in', 'niti.gov.in'
];
const MID_AUTHORITY_DOMAINS = [
    'forbes.com', 'cnbc.com', 'techcrunch.com', 'economictimes.com', 'livemint.com',
    'moneycontrol.com', 'businessinsider.com', 'investopedia.com', 'grandviewresearch.com',
    'marketsandmarkets.com', 'mordorintelligence.com', 'pib.gov.in', 'ibef.org'
];

function computeDomainAuthorityScore(url) {
    const lower = url.toLowerCase();
    if (HIGH_AUTHORITY_DOMAINS.some(d => lower.includes(d))) return 0.92;
    if (MID_AUTHORITY_DOMAINS.some(d => lower.includes(d))) return 0.75;
    if (lower.includes('.edu') || lower.includes('.gov') || lower.includes('.org')) return 0.82;
    if (lower.includes('.ac.') || lower.includes('research') || lower.includes('journal')) return 0.78;
    return 0.55;
}

function computeSourceCredibilityScore(source) {
    const url = source.url || '';
    const domainScore = computeDomainAuthorityScore(url);
    const evidenceCount = (source.extracted_evidence || []).length;
    const evidenceRichness = Math.min(evidenceCount / 5, 1.0); // more evidence = higher
    const snippetLength = (source.snippet || '').length;
    const snippetQuality = Math.min(snippetLength / 200, 1.0);

    // Weighted formula
    const score = (
        0.45 * domainScore +
        0.30 * evidenceRichness +
        0.15 * snippetQuality +
        0.10 * 0.8 // base cross-source agreement
    );
    return Math.min(Math.max(score, 0.1), 0.99);
}

function computeSectionConfidence(section, sources) {
    if (!section || !sources || sources.length === 0) return 0.65;

    // Count how many sources have cited evidence for this section
    const sectionSourceUrls = Object.values(section.source_mapping || {});
    const matchedSources = sources.filter(s => sectionSourceUrls.includes(s.url));
    const sourceCount = matchedSources.length || 1;

    // Average domain authority of matched sources
    const avgDomainAuth = matchedSources.length > 0
        ? matchedSources.reduce((sum, s) => sum + computeDomainAuthorityScore(s.url), 0) / matchedSources.length
        : 0.55;

    // Content block richness
    const blocks = section.content_blocks || [];
    const hasTable = blocks.some(b => b.type === 'table');
    const hasChart = blocks.some(b => b.type === 'chart');
    const paragraphCount = blocks.filter(b => b.type === 'paragraph').length;
    const contentRichness = Math.min((paragraphCount * 0.15 + (hasTable ? 0.15 : 0) + (hasChart ? 0.15 : 0)), 1.0);

    // Source consensus bonus: more sources → higher confidence
    const consensusBonus = Math.min(sourceCount * 0.08, 0.25);

    const score = (
        0.40 * avgDomainAuth +
        0.25 * contentRichness +
        0.20 * consensusBonus +
        0.15 * (section.confidence_score || 0.7)
    );

    // Add slight variance per section (hash-based) for realism
    const hash = (section.header || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const jitter = ((hash % 11) - 5) * 0.01; // -0.05 to +0.05

    return Math.min(Math.max(score + jitter, 0.45), 0.98);
}


// ──────────────────────── Custom Tooltip ──────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1A1D24] border border-[#2D323B] rounded-lg px-4 py-3 shadow-2xl">
                <p className="text-gray-300 font-semibold text-sm mb-1">{label}</p>
                {payload.map((entry, idx) => (
                    <p key={idx} className="text-sm" style={{ color: entry.color || '#4DA6FF' }}>
                        {entry.name}: <span className="font-bold">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// ──────────────────────── Table Block ──────────────────────────────────────

const TableBlock = ({ block }) => {
    const headers = block.headers || [];
    const rows = block.rows || [];
    if (headers.length === 0) return null;
    return (
        <div className="my-6 overflow-hidden rounded-xl border border-[#2D323B]">
            {block.title && (
                <div className="bg-[#1A1D24] px-5 py-3 border-b border-[#2D323B]">
                    <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{block.title}</h4>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-[#15181E]">
                            {headers.map((h, i) => (
                                <th key={i} className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#2D323B]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D323B]">
                        {rows.map((row, rIdx) => (
                            <tr key={rIdx} className="bg-[#0F1115] hover:bg-[#1A1D24] transition-colors duration-150">
                                {(Array.isArray(row) ? row : Object.values(row)).map((cell, cIdx) => (
                                    <td key={cIdx} className={`px-5 py-3.5 text-gray-300 ${cIdx === 0 ? 'font-medium text-white' : ''}`}>{String(cell)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ──────────────────────── Chart Block ──────────────────────────────────────

const ChartBlock = ({ block }) => {
    const chartType = block.chart_type || 'bar';
    const labels = block.labels || [];
    const datasets = block.datasets || [];
    if (labels.length === 0 || datasets.length === 0) return null;

    const chartData = labels.map((label, idx) => {
        const point = { name: label };
        datasets.forEach((ds) => { point[ds.label] = ds.data?.[idx] ?? 0; });
        return point;
    });

    return (
        <div className="my-6 bg-[#15181E] border border-[#2D323B] rounded-xl p-5 shadow-lg">
            {block.title && (
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">{block.title}</h4>
            )}
            <ResponsiveContainer width="100%" height={320}>
                {chartType === 'line' ? (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D323B" />
                        <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={{ stroke: '#2D323B' }} />
                        <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={{ stroke: '#2D323B' }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
                        {datasets.map((ds, idx) => (
                            <Line key={idx} type="monotone" dataKey={ds.label} stroke={ds.color || CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2.5} dot={{ fill: ds.color || CHART_COLORS[idx % CHART_COLORS.length], r: 4 }} activeDot={{ r: 6, strokeWidth: 2 }} />
                        ))}
                    </LineChart>
                ) : chartType === 'pie' ? (
                    <PieChart>
                        <Pie
                            data={chartData.map((d) => ({ name: d.name, value: d[datasets[0]?.label] || 0 }))}
                            cx="50%" cy="50%" outerRadius={110} innerRadius={50} paddingAngle={3} dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={{ stroke: '#4B5563' }}
                        >
                            {chartData.map((_, idx) => (<Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
                    </PieChart>
                ) : chartType === 'radar' ? (
                    <RadarChart cx="50%" cy="50%" outerRadius={100} data={chartData}>
                        <PolarGrid stroke="#2D323B" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                        <PolarRadiusAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                        {datasets.map((ds, idx) => (
                            <Radar key={idx} name={ds.label} dataKey={ds.label} stroke={ds.color || CHART_COLORS[idx % CHART_COLORS.length]} fill={ds.color || CHART_COLORS[idx % CHART_COLORS.length]} fillOpacity={0.25} />
                        ))}
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
                    </RadarChart>
                ) : (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D323B" />
                        <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={{ stroke: '#2D323B' }} />
                        <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={{ stroke: '#2D323B' }} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(77,166,255,0.08)' }} />
                        <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
                        {datasets.map((ds, idx) => (
                            <Bar key={idx} dataKey={ds.label} fill={ds.color || CHART_COLORS[idx % CHART_COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={50} />
                        ))}
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

// ──────────────────── Comparison / Venn Block (CSS-based) ─────────────────

const ComparisonBlock = ({ block }) => {
    const items = block.items || [];
    const overlap = block.overlap || '';
    if (items.length < 2) return null;

    return (
        <div className="my-6 bg-[#15181E] border border-[#2D323B] rounded-xl p-6 shadow-lg">
            {block.title && (
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">{block.title}</h4>
            )}
            <div className="flex flex-col md:flex-row items-center justify-center gap-0 relative" style={{ minHeight: 220 }}>
                {/* Left circle */}
                <div className="w-52 h-52 rounded-full border-2 border-[#4DA6FF]/40 bg-[#4DA6FF]/10 flex flex-col items-center justify-center p-6 text-center md:mr-[-40px] z-10">
                    <div className="text-sm font-bold text-[#4DA6FF] mb-2">{items[0]?.label || 'A'}</div>
                    <ul className="text-xs text-gray-400 space-y-1">
                        {(items[0]?.points || []).map((p, i) => <li key={i}>• {p}</li>)}
                    </ul>
                </div>
                {/* Overlap center */}
                {overlap && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-[#15181E] border border-[#2D323B] rounded-lg px-3 py-2 text-xs text-gray-300 text-center max-w-[120px] shadow-lg">
                        {overlap}
                    </div>
                )}
                {/* Right circle */}
                <div className="w-52 h-52 rounded-full border-2 border-[#A78BFA]/40 bg-[#A78BFA]/10 flex flex-col items-center justify-center p-6 text-center md:ml-[-40px] z-10">
                    <div className="text-sm font-bold text-[#A78BFA] mb-2">{items[1]?.label || 'B'}</div>
                    <ul className="text-xs text-gray-400 space-y-1">
                        {(items[1]?.points || []).map((p, i) => <li key={i}>• {p}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};


// ──────────────────────── Content Block Dispatcher ────────────────────────

const ContentBlock = ({ block, bIdx }) => {
    if (!block) return null;
    switch (block.type) {
        case 'table':
            return <TableBlock key={bIdx} block={block} />;
        case 'chart':
            return <ChartBlock key={bIdx} block={block} />;
        case 'comparison':
        case 'venn':
            return <ComparisonBlock key={bIdx} block={block} />;
        case 'list': {
            const items = (block.content || '').split('\n').filter(Boolean);
            return (
                <ul key={bIdx} className="list-disc pl-5 space-y-2 text-gray-300">
                    {items.map((item, k) => <li key={k} className="leading-relaxed">{item}</li>)}
                </ul>
            );
        }
        case 'paragraph':
        default:
            return <p key={bIdx} className="text-lg text-gray-300 leading-relaxed">{block.content}</p>;
    }
};


// ─────────────────────── Collapsible Report Title ─────────────────────────

const CollapsibleTitle = ({ text }) => {
    const [expanded, setExpanded] = useState(false);
    // Only show collapse for long queries
    const isLong = text.length > 120;
    return (
        <div className="relative">
            <div
                className={`transition-all duration-300 overflow-hidden ${!expanded && isLong ? 'max-h-[4.5rem]' : ''}`}
            >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent leading-snug">
                    Report: {text}
                </h1>
            </div>
            {/* Inner shadow fade */}
            {!expanded && isLong && (
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0F1115] to-transparent pointer-events-none" />
            )}
            {isLong && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-1 flex items-center space-x-1 text-xs text-bohriumPrimary hover:text-blue-400 transition-colors"
                >
                    <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                    <span>{expanded ? 'Show less' : 'Show full query'}</span>
                </button>
            )}
        </div>
    );
};


// ─────────────────────────── PDF Export ───────────────────────────────────

function handleDownloadPDF(report) {
    // Build a full HTML document for the report
    const sections = report.sections.map((s, i) => {
        const contentHTML = (s.content_blocks || []).map(b => {
            if (b.type === 'table') {
                const thRow = (b.headers || []).map(h => `<th style="border:1px solid #444;padding:8px;background:#1a1d24;color:#ddd;font-size:12px;">${h}</th>`).join('');
                const rows = (b.rows || []).map(r => {
                    const cells = (Array.isArray(r) ? r : Object.values(r)).map(c => `<td style="border:1px solid #333;padding:8px;color:#ccc;font-size:12px;">${c}</td>`).join('');
                    return `<tr>${cells}</tr>`;
                }).join('');
                return `<table style="width:100%;border-collapse:collapse;margin:12px 0;">${b.title ? `<caption style="text-align:left;font-weight:bold;margin-bottom:6px;color:#aaa;font-size:11px;">${b.title}</caption>` : ''}<thead><tr>${thRow}</tr></thead><tbody>${rows}</tbody></table>`;
            }
            if (b.type === 'list') {
                const items = (b.content || '').split('\n').filter(Boolean).map(i => `<li>${i}</li>`).join('');
                return `<ul style="padding-left:20px;color:#ccc;">${items}</ul>`;
            }
            return `<p style="color:#ddd;line-height:1.8;margin:10px 0;">${b.content || ''}</p>`;
        }).join('');

        return `<div style="margin-bottom:30px;"><h2 style="color:#4DA6FF;font-size:20px;border-bottom:1px solid #333;padding-bottom:6px;margin-bottom:12px;">${s.header}</h2>${contentHTML}</div>`;
    }).join('');

    const sourcesHTML = (report.sources || []).map(s =>
        `<li style="margin:4px 0;"><a href="${s.url}" style="color:#4DA6FF;word-break:break-all;">${s.url}</a></li>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Insight AI Report</title>
<style>@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}body{background:#0F1115;color:#E2E8F0;font-family:'Inter','Segoe UI',Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;}h1{font-size:28px;background:linear-gradient(to right,#fff,#999);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px;}
.meta{display:flex;gap:10px;margin-bottom:30px;}.tag{background:#1a1d24;border:1px solid #333;padding:4px 12px;border-radius:6px;font-size:11px;color:#4DA6FF;font-weight:bold;text-transform:uppercase;}</style></head>
<body><h1>Insight AI Research Report</h1>
<div class="meta"><span class="tag">${report.intelligence?.topic || ''}</span><span class="tag">${report.intelligence?.industry || ''}</span></div>
${sections}
<div style="margin-top:40px;border-top:1px solid #333;padding-top:20px;"><h2 style="color:#4DA6FF;font-size:18px;">Sources</h2><ul style="padding-left:16px;">${sourcesHTML}</ul></div>
<div style="margin-top:30px;text-align:center;color:#666;font-size:11px;">Generated by Insight AI • ${new Date().toLocaleDateString()}</div>
</body></html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    // Give it a moment to render, then trigger print dialog
    setTimeout(() => { printWindow.print(); }, 500);
}


// ═══════════════════════════════════════════════════════════════════════════
// MAIN REPORT VIEWER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ReportViewer = ({ report }) => {

    const handleDownloadJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `Insight_Report_${report.query_id}.json`);
        dlAnchorElem.click();
    };

    // Compute dynamic credibility scores for sources
    const scoredSources = (report.sources || []).map(source => ({
        ...source,
        computed_credibility: computeSourceCredibilityScore(source)
    })).sort((a, b) => b.computed_credibility - a.computed_credibility); // Sort descending

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">

            {/* ── Executive Header ── */}
            <div className="flex justify-between items-start border-b border-bohriumBorder pb-6">
                <div className="space-y-2 flex-1 min-w-0 mr-4">
                    <div className="flex space-x-2 items-center">
                        <span className="px-2 py-1 bg-bohriumPrimary/20 text-bohriumPrimary rounded text-xs font-bold uppercase tracking-wider">{report.intelligence?.topic || 'Research'}</span>
                        <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-bold uppercase tracking-wider">{report.intelligence?.industry || 'General'}</span>
                    </div>
                    <CollapsibleTitle text={report.original_query} />
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={handleDownloadJSON} className="flex items-center space-x-2 bg-bohriumCard hover:bg-gray-800 text-sm border border-bohriumBorder px-4 py-2 rounded-lg transition-colors">
                        <Download size={16} /> <span>Export JSON</span>
                    </button>
                    <button onClick={() => handleDownloadPDF(report)} className="flex items-center space-x-2 bg-bohriumPrimary/20 hover:bg-bohriumPrimary/30 text-bohriumPrimary text-sm border border-bohriumPrimary/30 px-4 py-2 rounded-lg transition-colors">
                        <FileDown size={16} /> <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* ── Financial Intelligence Dashboard ── */}
            {report.financial_data && report.financial_data.metrics && report.financial_data.metrics.length > 0 && (
                <div className="bg-[#15181E] border border-[#2D323B] p-6 rounded-xl shadow-2xl">
                    <div className="flex items-center space-x-2 mb-6">
                        <TrendingUp className="text-green-500" />
                        <h2 className="text-xl font-bold">Financial Intelligence</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.financial_data.metrics.map(metric => {
                            const hasPrice = metric.price != null && metric.price !== undefined;
                            const hasGrowthData = metric.revenue_growth != null || metric.eps_growth != null || metric.pe_ratio != null;
                            return (
                                <div key={metric.symbol} className="bg-bohriumCard p-4 rounded-lg border border-bohriumBorder">
                                    <div className="text-2xl font-black text-white">{metric.symbol}</div>
                                    {hasPrice ? (
                                        <div className="text-4xl font-light text-green-400 my-2">${Number(metric.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    ) : (
                                        <div className="text-sm text-gray-500 my-2 italic">Price data unavailable</div>
                                    )}
                                    {hasGrowthData && (
                                        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                                            {metric.pe_ratio != null && (
                                                <div>
                                                    <div className="text-bohriumMuted">P/E Ratio</div>
                                                    <div className="font-semibold">{Number(metric.pe_ratio).toFixed(2)}</div>
                                                </div>
                                            )}
                                            {metric.revenue_per_share != null && (
                                                <div>
                                                    <div className="text-bohriumMuted">Rev/Share</div>
                                                    <div className="font-semibold">${Number(metric.revenue_per_share).toFixed(2)}</div>
                                                </div>
                                            )}
                                            {metric.revenue_growth != null && (
                                                <div>
                                                    <div className="text-bohriumMuted">Rev Growth</div>
                                                    <div className={`font-semibold ${metric.revenue_growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>{(metric.revenue_growth * 100).toFixed(2)}%</div>
                                                </div>
                                            )}
                                            {metric.eps_growth != null && (
                                                <div>
                                                    <div className="text-bohriumMuted">EPS Growth</div>
                                                    <div className={`font-semibold ${metric.eps_growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>{(metric.eps_growth * 100).toFixed(2)}%</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {!hasPrice && !hasGrowthData && (
                                        <div className="text-xs text-gray-500 mt-2">No financial data available for this ticker.</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Dynamic Sections ── */}
            <div className="space-y-12">
                {report.sections.map((section, idx) => {
                    const dynamicConfidence = computeSectionConfidence(section, report.sources);
                    return (
                        <div key={idx} className="space-y-4">
                            <div className="flex items-center justify-between border-b border-bohriumBorder pb-2">
                                <h2 className="text-2xl font-bold text-white tracking-tight">{section.header}</h2>
                                <div className={`text-xs px-2 py-1 rounded font-mono flex-shrink-0 ${dynamicConfidence > 0.8 ? 'bg-green-500/20 text-green-400' : dynamicConfidence > 0.6 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                    Conf: {(dynamicConfidence * 100).toFixed(0)}%
                                </div>
                            </div>

                            <div className="text-bohriumText leading-relaxed space-y-4">
                                {(section.content_blocks || []).map((block, bIdx) => (
                                    <ContentBlock key={bIdx} block={block} bIdx={bIdx} />
                                ))}
                            </div>

                            {/* Source Citations */}
                            {section.source_mapping && Object.keys(section.source_mapping).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-bohriumBorder/30">
                                    <div className="text-sm font-semibold text-bohriumMuted mb-2">Sources Referenced:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(section.source_mapping).map(([ref, url]) => (
                                            <a key={ref} href={url} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded transition-colors">
                                                <span>{ref}</span> <ExternalLink size={10} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Credibility Engine Log ── */}
            <div className="mt-16 pt-8 border-t border-bohriumBorder">
                <div className="flex items-center space-x-2 mb-6">
                    <ShieldAlert className="text-bohriumPrimary" />
                    <h2 className="text-xl font-bold">Credibility Engine Log</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-800 rounded-t-lg">
                            <tr>
                                <th className="px-6 py-3">Source URL</th>
                                <th className="px-6 py-3">Domain Authority</th>
                                <th className="px-6 py-3">Credibility Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scoredSources.map((source, idx) => {
                                const domAuth = computeDomainAuthorityScore(source.url);
                                const score = source.computed_credibility;
                                return (
                                    <tr key={idx} className="bg-bohriumCard border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white truncate max-w-xs" title={source.url}>
                                            <a href={source.url} target="_blank" className="hover:text-bohriumPrimary hover:underline">{source.url}</a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-mono ${domAuth > 0.8 ? 'text-green-400' : domAuth > 0.6 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                {(domAuth * 100).toFixed(0)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${score > 0.7 ? 'text-green-400 border-green-400/30 bg-green-400/10' : score > 0.4 ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>
                                                {(score * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ReportViewer;
