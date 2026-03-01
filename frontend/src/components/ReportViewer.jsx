import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, ExternalLink, ShieldAlert, TrendingUp } from 'lucide-react';

// Color palette for charts
const CHART_COLORS = ['#4DA6FF', '#6366F1', '#22D3EE', '#A78BFA', '#F472B6', '#34D399', '#FBBF24', '#FB923C'];

// Custom tooltip component for charts
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

// Renders a table content block
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
                                <th key={i} className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#2D323B]">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D323B]">
                        {rows.map((row, rIdx) => (
                            <tr key={rIdx} className="bg-[#0F1115] hover:bg-[#1A1D24] transition-colors duration-150">
                                {(Array.isArray(row) ? row : Object.values(row)).map((cell, cIdx) => (
                                    <td key={cIdx} className={`px-5 py-3.5 text-gray-300 ${cIdx === 0 ? 'font-medium text-white' : ''}`}>
                                        {String(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Renders a chart content block
const ChartBlock = ({ block }) => {
    const chartType = block.chart_type || 'bar';
    const labels = block.labels || [];
    const datasets = block.datasets || [];
    
    if (labels.length === 0 || datasets.length === 0) return null;
    
    // Transform data for recharts format
    const chartData = labels.map((label, idx) => {
        const point = { name: label };
        datasets.forEach((ds) => {
            point[ds.label] = ds.data?.[idx] ?? 0;
        });
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
                            <Line
                                key={idx}
                                type="monotone"
                                dataKey={ds.label}
                                stroke={ds.color || CHART_COLORS[idx % CHART_COLORS.length]}
                                strokeWidth={2.5}
                                dot={{ fill: ds.color || CHART_COLORS[idx % CHART_COLORS.length], r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                        ))}
                    </LineChart>
                ) : chartType === 'pie' ? (
                    <PieChart>
                        <Pie
                            data={chartData.map((d, i) => ({ name: d.name, value: d[datasets[0]?.label] || 0 }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={110}
                            innerRadius={50}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={{ stroke: '#4B5563' }}
                        >
                            {chartData.map((_, idx) => (
                                <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
                    </PieChart>
                ) : (
                    /* default: bar chart */
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D323B" />
                        <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={{ stroke: '#2D323B' }} />
                        <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={{ stroke: '#2D323B' }} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(77,166,255,0.08)' }} />
                        <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
                        {datasets.map((ds, idx) => (
                            <Bar
                                key={idx}
                                dataKey={ds.label}
                                fill={ds.color || CHART_COLORS[idx % CHART_COLORS.length]}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                            />
                        ))}
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

// Renders a single content block
const ContentBlock = ({ block, bIdx }) => {
    if (!block) return null;
    
    switch (block.type) {
        case 'table':
            return <TableBlock key={bIdx} block={block} />;
        
        case 'chart':
            return <ChartBlock key={bIdx} block={block} />;
        
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


// Main report component
const ReportViewer = ({ report }) => {

    const handleDownloadJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `Insight_Report_${report.query_id}.json`);
        dlAnchorElem.click();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">

            {/* Executive Header */}
            <div className="flex justify-between items-start border-b border-bohriumBorder pb-6">
                <div className="space-y-2">
                    <div className="flex space-x-2 items-center">
                        <span className="px-2 py-1 bg-bohriumPrimary/20 text-bohriumPrimary rounded text-xs font-bold uppercase tracking-wider">{report.intelligence.topic}</span>
                        <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-bold uppercase tracking-wider">{report.intelligence.industry}</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Report: {report.original_query}
                    </h1>
                </div>
                <button onClick={handleDownloadJSON} className="flex items-center space-x-2 bg-bohriumCard hover:bg-gray-800 text-sm border border-bohriumBorder px-4 py-2 rounded-lg transition-colors">
                    <Download size={16} /> <span>Export JSON</span>
                </button>
            </div>

            {/* Financial Intelligence Dashboard (if present) */}
            {report.financial_data && report.financial_data.metrics && report.financial_data.metrics.length > 0 && (
                <div className="bg-[#15181E] border border-[#2D323B] p-6 rounded-xl shadow-2xl">
                    <div className="flex items-center space-x-2 mb-6">
                        <TrendingUp className="text-green-500" />
                        <h2 className="text-xl font-bold">Financial Intelligence</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.financial_data.metrics.map(metric => (
                            <div key={metric.symbol} className="bg-bohriumCard p-4 rounded-lg border border-bohriumBorder">
                                <div className="text-2xl font-black text-white">{metric.symbol}</div>
                                <div className="text-4xl font-light text-green-400 my-2">${metric.price}</div>
                                <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                                    {metric.revenue_growth != null && (
                                        <div>
                                            <div className="text-bohriumMuted">Rev Growth</div>
                                            <div className="font-semibold">{(metric.revenue_growth * 100).toFixed(2)}%</div>
                                        </div>
                                    )}
                                    {metric.eps_growth != null && (
                                        <div>
                                            <div className="text-bohriumMuted">EPS Growth</div>
                                            <div className="font-semibold">{(metric.eps_growth * 100).toFixed(2)}%</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dynamic Sections */}
            <div className="space-y-12">
                {report.sections.map((section, idx) => (
                    <div key={idx} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-bohriumBorder pb-2">
                            <h2 className="text-2xl font-bold text-white tracking-tight">{section.header}</h2>
                            {section.confidence_score && (
                                <div className={`text-xs px-2 py-1 rounded font-mono ${section.confidence_score > 0.8 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    Conf: {(section.confidence_score * 100).toFixed(0)}%
                                </div>
                            )}
                        </div>

                        <div className="text-bohriumText leading-relaxed space-y-4">
                            {section.content_blocks.map((block, bIdx) => (
                                <ContentBlock key={bIdx} block={block} bIdx={bIdx} />
                            ))}
                        </div>

                        {/* Source Mapping/Citations for Section */}
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
                ))}
            </div>

            {/* Global Citations & Credibility Engine Output */}
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
                                <th className="px-6 py-3">Credibility Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.sources.map((source, idx) => (
                                <tr key={idx} className="bg-bohriumCard border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white truncate max-w-xs" title={source.url}>
                                        <a href={source.url} target="_blank" className="hover:text-bohriumPrimary hover:underline">{source.url}</a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${source.credibility_score > 0.7 ? 'text-green-400 border-green-400/30 bg-green-400/10' : source.credibility_score > 0.4 ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>
                                            {(source.credibility_score * 100).toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ReportViewer;
