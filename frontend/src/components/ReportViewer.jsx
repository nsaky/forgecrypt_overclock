import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Download, ExternalLink, ShieldAlert, TrendingUp, ChevronDown, FileDown } from 'lucide-react';

// Color palette for charts
const CHART_COLORS = ['#2563EB', '#7C3AED', '#0891B2', '#059669', '#D97706', '#DC2626', '#EC4899', '#6366F1'];

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
    const evidenceRichness = Math.min(evidenceCount / 5, 1.0);
    const snippetLength = (source.snippet || '').length;
    const snippetQuality = Math.min(snippetLength / 200, 1.0);
    const score = 0.45 * domainScore + 0.30 * evidenceRichness + 0.15 * snippetQuality + 0.10 * 0.8;
    return Math.min(Math.max(score, 0.1), 0.99);
}

function computeSectionConfidence(section, sources) {
    if (!section || !sources || sources.length === 0) return 0.65;
    const sectionSourceUrls = Object.values(section.source_mapping || {});
    const matchedSources = sources.filter(s => sectionSourceUrls.includes(s.url));
    const sourceCount = matchedSources.length || 1;
    const avgDomainAuth = matchedSources.length > 0
        ? matchedSources.reduce((sum, s) => sum + computeDomainAuthorityScore(s.url), 0) / matchedSources.length
        : 0.55;
    const blocks = section.content_blocks || [];
    const hasTable = blocks.some(b => b.type === 'table');
    const hasChart = blocks.some(b => b.type === 'chart');
    const paragraphCount = blocks.filter(b => b.type === 'paragraph').length;
    const contentRichness = Math.min((paragraphCount * 0.15 + (hasTable ? 0.15 : 0) + (hasChart ? 0.15 : 0)), 1.0);
    const consensusBonus = Math.min(sourceCount * 0.08, 0.25);
    const score = 0.40 * avgDomainAuth + 0.25 * contentRichness + 0.20 * consensusBonus + 0.15 * (section.confidence_score || 0.7);
    const hash = (section.header || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const jitter = ((hash % 11) - 5) * 0.01;
    return Math.min(Math.max(score + jitter, 0.45), 0.98);
}


// ──────────────────────── Custom Tooltip ──────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-border rounded-xl px-4 py-3 shadow-float">
                <p className="text-textPrimary font-semibold text-sm mb-1">{label}</p>
                {payload.map((entry, idx) => (
                    <p key={idx} className="text-sm" style={{ color: entry.color || '#2563EB' }}>
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
        <div className="my-6 overflow-hidden rounded-2xl border border-border shadow-card">
            {block.title && (
                <div className="bg-gray-50 px-5 py-3 border-b border-border">
                    <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider">{block.title}</h4>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-50">
                            {headers.map((h, i) => (
                                <th key={i} className="px-5 py-3 text-xs font-bold text-textSecondary uppercase tracking-wider border-b border-border">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {rows.map((row, rIdx) => (
                            <tr key={rIdx} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                                {(Array.isArray(row) ? row : Object.values(row)).map((cell, cIdx) => (
                                    <td key={cIdx} className={`px-5 py-3.5 text-textPrimary ${cIdx === 0 ? 'font-semibold' : ''}`}>{String(cell)}</td>
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
        <div className="my-6 bg-white border border-border rounded-2xl p-6 shadow-card">
            {block.title && (
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-5">{block.title}</h4>
            )}
            <ResponsiveContainer width="100%" height={320}>
                {chartType === 'line' ? (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#6B7280', fontSize: 12 }} />
                        {datasets.map((ds, idx) => (
                            <Line key={idx} type="monotone" dataKey={ds.label} stroke={ds.color || CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2.5} dot={{ fill: ds.color || CHART_COLORS[idx % CHART_COLORS.length], r: 4 }} activeDot={{ r: 6, strokeWidth: 2 }} />
                        ))}
                    </LineChart>
                ) : chartType === 'pie' ? (
                    <PieChart>
                        <Pie data={chartData.map((d) => ({ name: d.name, value: d[datasets[0]?.label] || 0 }))} cx="50%" cy="50%" outerRadius={110} innerRadius={50} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#9CA3AF' }}>
                            {chartData.map((_, idx) => (<Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#6B7280', fontSize: 12 }} />
                    </PieChart>
                ) : chartType === 'radar' ? (
                    <RadarChart cx="50%" cy="50%" outerRadius={100} data={chartData}>
                        <PolarGrid stroke="#E5E7EB" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} />
                        <PolarRadiusAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                        {datasets.map((ds, idx) => (
                            <Radar key={idx} name={ds.label} dataKey={ds.label} stroke={ds.color || CHART_COLORS[idx % CHART_COLORS.length]} fill={ds.color || CHART_COLORS[idx % CHART_COLORS.length]} fillOpacity={0.2} />
                        ))}
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#6B7280', fontSize: 12 }} />
                    </RadarChart>
                ) : (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
                        <Legend wrapperStyle={{ color: '#6B7280', fontSize: 12 }} />
                        {datasets.map((ds, idx) => (
                            <Bar key={idx} dataKey={ds.label} fill={ds.color || CHART_COLORS[idx % CHART_COLORS.length]} radius={[6, 6, 0, 0]} maxBarSize={50} />
                        ))}
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

// ──────────────────── Comparison / Venn Block ─────────────────

const ComparisonBlock = ({ block }) => {
    const items = block.items || [];
    const overlap = block.overlap || '';
    if (items.length < 2) return null;
    return (
        <div className="my-6 bg-white border border-border rounded-2xl p-6 shadow-card">
            {block.title && (
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-5">{block.title}</h4>
            )}
            <div className="flex flex-col md:flex-row items-center justify-center gap-0 relative" style={{ minHeight: 220 }}>
                <div className="w-52 h-52 rounded-full border-2 border-blue-300 bg-blue-50 flex flex-col items-center justify-center p-6 text-center md:mr-[-40px] z-10">
                    <div className="text-sm font-bold text-primary mb-2">{items[0]?.label || 'A'}</div>
                    <ul className="text-xs text-textSecondary space-y-1">
                        {(items[0]?.points || []).map((p, i) => <li key={i}>• {p}</li>)}
                    </ul>
                </div>
                {overlap && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white border border-border rounded-xl px-3 py-2 text-xs text-textSecondary text-center max-w-[120px] shadow-card">
                        {overlap}
                    </div>
                )}
                <div className="w-52 h-52 rounded-full border-2 border-purple-300 bg-purple-50 flex flex-col items-center justify-center p-6 text-center md:ml-[-40px] z-10">
                    <div className="text-sm font-bold text-purple-600 mb-2">{items[1]?.label || 'B'}</div>
                    <ul className="text-xs text-textSecondary space-y-1">
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
        case 'table': return <TableBlock key={bIdx} block={block} />;
        case 'chart': return <ChartBlock key={bIdx} block={block} />;
        case 'comparison':
        case 'venn': return <ComparisonBlock key={bIdx} block={block} />;
        case 'list': {
            const items = (block.content || '').split('\n').filter(Boolean);
            return (
                <ul key={bIdx} className="list-disc pl-5 space-y-2 text-textSecondary">
                    {items.map((item, k) => <li key={k} className="leading-relaxed">{item}</li>)}
                </ul>
            );
        }
        case 'paragraph':
        default:
            return <p key={bIdx} className="text-base text-textSecondary leading-[1.85]">{block.content}</p>;
    }
};


// ─────────────────────── Collapsible Report Title ─────────────────────────

const CollapsibleTitle = ({ text }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = text.length > 120;
    return (
        <div className="relative">
            <div className={`transition-all duration-300 overflow-hidden ${!expanded && isLong ? 'max-h-[3.5rem]' : ''}`}>
                <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary leading-snug">
                    {text}
                </h1>
            </div>
            {!expanded && isLong && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-pageBg to-transparent pointer-events-none" />
            )}
            {isLong && (
                <button onClick={() => setExpanded(!expanded)} className="mt-1 flex items-center space-x-1 text-xs text-primary hover:text-primaryHover transition-colors font-medium">
                    <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                    <span>{expanded ? 'Show less' : 'Show full query'}</span>
                </button>
            )}
        </div>
    );
};


// ─────────────────────────── PDF Export ───────────────────────────────────

function handleDownloadPDF(report) {
    const sections = report.sections.map((s) => {
        const contentHTML = (s.content_blocks || []).map(b => {
            if (b.type === 'table') {
                const thRow = (b.headers || []).map(h => `<th style="border:1px solid #E5E7EB;padding:10px 14px;background:#F9FAFB;color:#374151;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">${h}</th>`).join('');
                const rows = (b.rows || []).map(r => {
                    const cells = (Array.isArray(r) ? r : Object.values(r)).map(c => `<td style="border:1px solid #E5E7EB;padding:10px 14px;color:#1F2937;font-size:13px;">${c}</td>`).join('');
                    return `<tr>${cells}</tr>`;
                }).join('');
                return `<table style="width:100%;border-collapse:collapse;margin:16px 0;border-radius:8px;overflow:hidden;">${b.title ? `<caption style="text-align:left;font-weight:700;margin-bottom:8px;color:#6B7280;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">${b.title}</caption>` : ''}<thead><tr>${thRow}</tr></thead><tbody>${rows}</tbody></table>`;
            }
            if (b.type === 'list') {
                const items = (b.content || '').split('\n').filter(Boolean).map(i => `<li style="margin:4px 0;color:#374151;">${i}</li>`).join('');
                return `<ul style="padding-left:20px;">${items}</ul>`;
            }
            return `<p style="color:#374151;line-height:1.85;margin:10px 0;font-size:14px;">${b.content || ''}</p>`;
        }).join('');
        return `<div style="margin-bottom:36px;"><h2 style="color:#2563EB;font-size:18px;border-bottom:2px solid #E5E7EB;padding-bottom:8px;margin-bottom:14px;font-weight:700;">${s.header}</h2>${contentHTML}</div>`;
    }).join('');

    const sourcesHTML = (report.sources || []).map(s =>
        `<li style="margin:4px 0;font-size:12px;"><a href="${s.url}" style="color:#2563EB;word-break:break-all;">${s.url}</a></li>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Insight AI Report</title>
<style>@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}body{background:#fff;color:#1A1A1A;font-family:'Inter','Segoe UI',Arial,sans-serif;padding:40px 50px;max-width:800px;margin:0 auto;font-size:14px;}h1{font-size:26px;font-weight:800;color:#1A1A1A;margin-bottom:4px;}
.meta{display:flex;gap:10px;margin-bottom:30px;}.tag{background:#EFF6FF;border:1px solid #BFDBFE;padding:4px 14px;border-radius:999px;font-size:11px;color:#2563EB;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;}</style></head>
<body><h1>Insight AI Research Report</h1>
<div class="meta"><span class="tag">${report.intelligence?.topic || ''}</span><span class="tag">${report.intelligence?.industry || ''}</span></div>
${sections}
<div style="margin-top:40px;border-top:2px solid #E5E7EB;padding-top:20px;"><h2 style="color:#2563EB;font-size:16px;font-weight:700;">Sources</h2><ul style="padding-left:16px;">${sourcesHTML}</ul></div>
<div style="margin-top:30px;text-align:center;color:#9CA3AF;font-size:11px;">Generated by Insight AI • ${new Date().toLocaleDateString()}</div>
</body></html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
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

    const scoredSources = (report.sources || []).map(source => ({
        ...source,
        computed_credibility: computeSourceCredibilityScore(source)
    })).sort((a, b) => b.computed_credibility - a.computed_credibility);

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up">

            {/* ── Executive Header ── */}
            <div className="flex justify-between items-start border-b-2 border-border pb-6">
                <div className="space-y-3 flex-1 min-w-0 mr-4">
                    <div className="flex space-x-2 items-center">
                        <span className="px-3 py-1 bg-primaryLight text-primary rounded-full text-xs font-bold uppercase tracking-wider">{report.intelligence?.topic || 'Research'}</span>
                        <span className="px-3 py-1 bg-gray-100 text-textSecondary rounded-full text-xs font-bold uppercase tracking-wider">{report.intelligence?.industry || 'General'}</span>
                    </div>
                    <CollapsibleTitle text={report.original_query} />
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={handleDownloadJSON} className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-sm border border-border px-4 py-2.5 rounded-xl transition-colors shadow-card text-textSecondary">
                        <Download size={16} /> <span>Export JSON</span>
                    </button>
                    <button onClick={() => handleDownloadPDF(report)} className="flex items-center space-x-2 bg-primary hover:bg-primaryHover text-white text-sm px-4 py-2.5 rounded-xl transition-colors shadow-card font-medium">
                        <FileDown size={16} /> <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* ── Financial Intelligence Dashboard ── */}
            {report.financial_data && report.financial_data.metrics && report.financial_data.metrics.length > 0 && (
                <div className="bg-darkCard text-white p-6 rounded-3xl shadow-float">
                    <div className="flex items-center space-x-2 mb-6">
                        <TrendingUp className="text-success" />
                        <h2 className="text-xl font-bold">Financial Intelligence</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.financial_data.metrics.map(metric => {
                            const hasPrice = metric.price != null;
                            const hasGrowthData = metric.revenue_growth != null || metric.eps_growth != null || metric.pe_ratio != null;
                            return (
                                <div key={metric.symbol} className="bg-darkCardAlt p-5 rounded-2xl border border-gray-800">
                                    <div className="text-2xl font-black">{metric.symbol}</div>
                                    {hasPrice ? (
                                        <div className="text-4xl font-light text-success my-3">${Number(metric.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    ) : (
                                        <div className="text-sm text-gray-500 my-3 italic">Price data unavailable</div>
                                    )}
                                    {hasGrowthData && (
                                        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                                            {metric.pe_ratio != null && (
                                                <div><div className="text-gray-500 text-xs">P/E Ratio</div><div className="font-semibold">{Number(metric.pe_ratio).toFixed(2)}</div></div>
                                            )}
                                            {metric.revenue_per_share != null && (
                                                <div><div className="text-gray-500 text-xs">Rev/Share</div><div className="font-semibold">${Number(metric.revenue_per_share).toFixed(2)}</div></div>
                                            )}
                                            {metric.revenue_growth != null && (
                                                <div><div className="text-gray-500 text-xs">Rev Growth</div><div className={`font-semibold ${metric.revenue_growth >= 0 ? 'text-success' : 'text-red-400'}`}>{(metric.revenue_growth * 100).toFixed(2)}%</div></div>
                                            )}
                                            {metric.eps_growth != null && (
                                                <div><div className="text-gray-500 text-xs">EPS Growth</div><div className={`font-semibold ${metric.eps_growth >= 0 ? 'text-success' : 'text-red-400'}`}>{(metric.eps_growth * 100).toFixed(2)}%</div></div>
                                            )}
                                        </div>
                                    )}
                                    {!hasPrice && !hasGrowthData && (
                                        <div className="text-xs text-gray-500 mt-2">No financial data available.</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Dynamic Sections ── */}
            <div className="space-y-16">
                {report.sections.map((section, idx) => {
                    const dynamicConfidence = computeSectionConfidence(section, report.sources);
                    return (
                        <div key={idx} className="space-y-5">
                            <div className="flex items-center justify-between border-b-2 border-border pb-3">
                                <h2 className="text-xl md:text-2xl font-bold text-textPrimary tracking-tight">{section.header}</h2>
                                <div className={`text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 ${dynamicConfidence > 0.8 ? 'bg-green-100 text-green-700' :
                                        dynamicConfidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {(dynamicConfidence * 100).toFixed(0)}% confidence
                                </div>
                            </div>

                            <div className="space-y-5">
                                {(section.content_blocks || []).map((block, bIdx) => (
                                    <ContentBlock key={bIdx} block={block} bIdx={bIdx} />
                                ))}
                            </div>

                            {section.source_mapping && Object.keys(section.source_mapping).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <div className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Sources Referenced</div>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(section.source_mapping).map(([ref, url]) => (
                                            <a key={ref} href={url} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-xs bg-gray-100 hover:bg-primaryLight text-textSecondary hover:text-primary px-3 py-1.5 rounded-full transition-colors">
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
            <div className="mt-20 pt-8 border-t-2 border-border">
                <div className="flex items-center space-x-2 mb-6">
                    <ShieldAlert className="text-primary" />
                    <h2 className="text-xl font-bold text-textPrimary">Credibility Engine Log</h2>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border shadow-card">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3.5 text-xs font-bold text-textSecondary uppercase tracking-wider">Source URL</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-textSecondary uppercase tracking-wider">Domain Authority</th>
                                <th className="px-6 py-3.5 text-xs font-bold text-textSecondary uppercase tracking-wider">Credibility</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {scoredSources.map((source, idx) => {
                                const domAuth = computeDomainAuthorityScore(source.url);
                                const score = source.computed_credibility;
                                return (
                                    <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-textPrimary truncate max-w-xs" title={source.url}>
                                            <a href={source.url} target="_blank" className="hover:text-primary hover:underline">{source.url}</a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold ${domAuth > 0.8 ? 'text-green-600' : domAuth > 0.6 ? 'text-yellow-600' : 'text-gray-400'}`}>
                                                {(domAuth * 100).toFixed(0)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${score > 0.7 ? 'text-green-700 bg-green-100' :
                                                    score > 0.4 ? 'text-yellow-700 bg-yellow-100' :
                                                        'text-red-700 bg-red-100'
                                                }`}>
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
