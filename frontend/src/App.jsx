import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Search, Loader2, FileText, Activity, Layers, Database, User, Globe, FileText as NotesIcon, ChevronDown, Sparkles } from 'lucide-react';
import ReportViewer from './components/ReportViewer';

const STEPS = [
  { id: 'intake', label: 'Query Intelligence', desc: 'Analyzing your research question', icon: Search },
  { id: 'research', label: 'Researching Sources', desc: 'Searching & scraping live web data', icon: Database },
  { id: 'extract', label: 'Extracting Evidence', desc: 'Identifying key data points', icon: FileText },
  { id: 'finance', label: 'Financial Analysis', desc: 'Checking financial indicators', icon: Activity },
  { id: 'synth', label: 'Synthesizing Report', desc: 'Writing your executive report', icon: Layers }
];

const ROLE_OPTIONS = ['Analyst', 'Student', 'Product Manager', 'Researcher', 'Executive', 'Investor'];
const SCALE_OPTIONS = ['Global', 'Country', 'Regional', 'Local'];
const EXAMPLE_QUERIES = [
  'Electric Vehicle Industry Analysis',
  'AI in Healthcare Market Outlook',
  'Renewable Energy Investment Trends'
];

/* ───────────────────────────── Custom Dropdown ───────────────────────────── */
function CustomDropdown({ options, value, onChange, label, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex-1 min-w-0" ref={ref}>
      <label className="flex items-center space-x-2 text-sm font-semibold text-textPrimary mb-2">
        <Icon size={16} className="text-primary" />
        <span>{label}</span>
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between bg-white border border-border rounded-xl px-4 py-3 text-sm text-textPrimary hover:border-borderDark focus:outline-none focus:border-primary transition-colors shadow-card"
        >
          <span>{value}</span>
          <ChevronDown size={16} className={`text-textSecondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        <div className={`absolute z-50 mt-1.5 w-full bg-white border border-border rounded-xl shadow-float overflow-hidden transition-all duration-200 origin-top ${open ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center space-x-2 transition-colors ${opt === value
                ? 'bg-primaryLight text-primary font-medium'
                : 'text-textPrimary hover:bg-gray-50'
                }`}
            >
              {opt === value && <span className="text-primary font-bold">✓</span>}
              <span className={opt === value ? '' : 'ml-5'}>{opt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ──────────────────────────────── Main App ──────────────────────────────── */
function App() {
  const [query, setQuery] = useState('');
  const [objective, setObjective] = useState('');
  const [role, setRole] = useState('Analyst');
  const [scale, setScale] = useState('Global');
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const buildQuery = () => {
    let combined = query.trim();
    const parts = [];
    if (objective.trim()) parts.push(`Objective: ${objective.trim()}`);
    if (role) parts.push(`Role: ${role}`);
    if (scale) parts.push(`Scale: ${scale}`);
    if (notes.trim()) parts.push(`Additional context: ${notes.trim()}`);
    if (parts.length > 0) combined += `\n\n${parts.join('\n')}`;
    return combined;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const combinedQuery = buildQuery();
    setLoading(true);
    setReport(null);
    setError(null);
    setActiveStep(0);

    const stepInterval = setInterval(() => {
      setActiveStep(prev => prev < 4 ? prev + 1 : prev);
    }, 4000);

    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://forgecrypt-overclock.onrender.com';
      const response = await axios.post(`${API_URL}/api/research`, { query: combinedQuery });
      clearInterval(stepInterval);
      setReport(response.data);
      setHistory(prev => [{ id: response.data.query_id, query: query.trim(), date: new Date().toLocaleTimeString() }, ...prev]);
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.response?.data?.detail || err.message || 'An error occurred during research.');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => setQuery(example);

  return (
    <div className="flex h-screen overflow-hidden bg-pageBg text-textPrimary">

      {/* ──────────── Sidebar ──────────── */}
      <div className="w-64 border-r border-border bg-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-extrabold text-white text-lg shadow-card">I</div>
          <h1 className="text-xl font-bold tracking-tight text-textPrimary">Insight AI</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <button
            onClick={() => { setReport(null); setError(null); setLoading(false); }}
            className="w-full mb-4 flex items-center justify-center space-x-2 bg-primary hover:bg-primaryHover text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-card"
          >
            <span>+ New Research</span>
          </button>
          <div className="text-[11px] font-bold text-textMuted uppercase tracking-[0.12em] mb-4">Query History</div>
          {history.length === 0 ? (
            <div className="text-sm text-textMuted italic">No history yet</div>
          ) : (
            <div className="space-y-2">
              {history.map(item => (
                <div key={item.id} className="p-3 bg-pageBg rounded-2xl border border-border text-sm cursor-pointer hover:border-primary hover:shadow-card transition-all duration-200 line-clamp-2 text-textSecondary">
                  {item.query}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ──────────── Main Content ──────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Top bar when report is showing */}
        {report && (
          <div className="p-4 border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-pageBg border border-border rounded-full py-2.5 pl-4 pr-12 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm text-textPrimary"
                placeholder="Ask another question..."
              />
              <button type="submit" className="absolute right-2 top-1.5 p-1.5 text-textMuted hover:text-primary transition-colors">
                <Search size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Dynamic Center Stage */}
        <div className={`flex-1 overflow-y-auto ${!report && !loading ? 'flex items-center justify-center' : ''} p-6 md:p-10`}>

          {/* ══════ Landing / Search State ══════ */}
          {!report && !loading && (
            <div className="max-w-3xl w-full text-center space-y-10 animate-fade-in-up">
              {/* Hero text */}
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-textPrimary leading-[1.15]">
                  Autonomous Research<br />Intelligence
                </h2>
                <p className="text-lg text-textSecondary max-w-2xl mx-auto leading-relaxed">
                  Institutional-grade insights constructed dynamically from live web data,
                  financial integrations, and multi-agent reasoning.
                </p>
              </div>

              {/* Search form card */}
              <form onSubmit={handleSearch} className="relative text-left">
                <div className="bg-white border border-border rounded-3xl shadow-card hover:shadow-cardHover transition-shadow duration-300 overflow-hidden">

                  {/* Main search input */}
                  <div className="flex items-center p-3">
                    <Search className="ml-3 text-textMuted flex-shrink-0" size={22} />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="E.g., Deep dive into Nvidia's competitive moat and future revenue outlook"
                      className="w-full bg-transparent border-none py-3.5 px-4 text-base focus:outline-none placeholder-textMuted text-textPrimary"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !query.trim()}
                      className="bg-primary hover:bg-primaryHover text-white font-semibold py-3 px-7 rounded-xl transition-colors shadow-card disabled:opacity-40 flex-shrink-0 mr-1 text-sm"
                    >
                      Research →
                    </button>
                  </div>

                  {/* Advanced toggle */}
                  <div className="px-5 pb-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center space-x-1.5 text-xs text-textMuted hover:text-primary transition-colors ml-auto"
                    >
                      <ChevronDown size={14} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
                      <span>{showAdvanced ? 'Hide advanced options' : 'Show advanced options'}</span>
                    </button>
                  </div>

                  {/* Advanced options panel */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showAdvanced ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">

                      {/* Objective */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-textPrimary mb-2">
                          <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          </div>
                          <span>Objective</span>
                        </label>
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) => setObjective(e.target.value)}
                          placeholder="e.g., Market analysis, feasibility study, academic insight..."
                          className="w-full bg-pageBg border border-border rounded-xl px-4 py-3.5 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>

                      {/* Two-column: Role + Scale */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <CustomDropdown options={ROLE_OPTIONS} value={role} onChange={setRole} label="Your Role" icon={User} />
                        <CustomDropdown options={SCALE_OPTIONS} value={scale} onChange={setScale} label="Scale" icon={Globe} />
                      </div>

                      {/* Additional Notes */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-textPrimary mb-2">
                          <NotesIcon size={16} className="text-primary" />
                          <span>Additional Notes</span>
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Optional: restrictions, preferred sources, focus areas..."
                          rows={3}
                          className="w-full bg-pageBg border border-border rounded-xl px-4 py-3 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>

              {/* Example query chips */}
              <div className="flex flex-wrap gap-3 justify-center text-sm mt-4">
                <span className="text-textMuted font-medium">Try:</span>
                {EXAMPLE_QUERIES.map((eq) => (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => handleExampleClick(eq)}
                    className="bg-white border border-border px-4 py-2 rounded-full hover:border-primary hover:text-primary hover:shadow-card transition-all cursor-pointer text-textSecondary text-sm"
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══════ Loading State ══════ */}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center space-y-12 max-w-lg mx-auto w-full">
              {/* Spinner */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-border rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                <Sparkles className="text-primary" size={32} />
              </div>

              {/* Steps */}
              <div className="w-full space-y-4">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = idx === activeStep;
                  const isPast = idx < activeStep;

                  return (
                    <div key={step.id} className={`flex items-center space-x-4 p-4 rounded-2xl border transition-all duration-500 ${isActive ? 'bg-primaryLight border-primary/20 scale-[1.02] shadow-card' :
                      isPast ? 'bg-green-50 border-green-200' :
                        'bg-white border-border opacity-50'
                      }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-green-100 text-success' :
                        isActive ? 'bg-primary/10 text-primary' :
                          'bg-gray-100 text-textMuted'
                        }`}>
                        {isPast ? <span className="text-sm font-bold">✓</span> : <Icon size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm ${isActive ? 'text-primary' : isPast ? 'text-textPrimary' : 'text-textMuted'}`}>{step.label}</div>
                        {isActive && <div className="text-xs text-textSecondary mt-0.5">{step.desc}</div>}
                      </div>
                      {isActive && <Loader2 className="animate-spin text-primary flex-shrink-0" size={18} />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══════ Error State ══════ */}
          {error && !loading && (
            <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center max-w-2xl mx-auto shadow-card">
              <h3 className="font-bold text-lg mb-2 text-red-700">Research Failed</h3>
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={() => setError(null)} className="mt-4 px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors text-sm font-medium">Dismiss</button>
            </div>
          )}

          {/* ══════ Report ══════ */}
          {report && !loading && (
            <div className="animate-fade-in-up pb-20">
              <ReportViewer report={report} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
