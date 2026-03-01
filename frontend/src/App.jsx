import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Search, Loader2, FileText, Activity, Layers, Database, User, Globe, FileText as NotesIcon, ChevronDown } from 'lucide-react';
import ReportViewer from './components/ReportViewer';

const STEPS = [
  { id: 'intake', label: 'Query Intelligence', icon: Search },
  { id: 'research', label: 'Researching Sources', icon: Database },
  { id: 'extract', label: 'Extracting Evidence', icon: FileText },
  { id: 'finance', label: 'Financial Analysis', icon: Activity },
  { id: 'synth', label: 'Synthesizing Report', icon: Layers }
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
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-200 mb-2">
        <Icon size={16} className="text-bohriumPrimary" />
        <span>{label}</span>
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between bg-[#1E2128] border border-[#2D323B] rounded-xl px-4 py-3 text-sm text-white hover:border-[#3D424B] focus:outline-none focus:border-bohriumPrimary transition-colors"
        >
          <span>{value}</span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown panel */}
        <div
          className={`absolute z-50 mt-1 w-full bg-[#1A1D24] border border-[#2D323B] rounded-xl shadow-2xl overflow-hidden transition-all duration-200 origin-top ${open ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
            }`}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center space-x-2 transition-colors ${opt === value
                  ? 'bg-blue-600/20 text-bohriumPrimary'
                  : 'text-gray-300 hover:bg-blue-600/10 hover:text-white'
                }`}
            >
              {opt === value && <span className="text-bohriumPrimary">✓</span>}
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

  // Combine all fields into a single query string
  const buildQuery = () => {
    let combined = query.trim();
    const parts = [];
    if (objective.trim()) parts.push(`Objective: ${objective.trim()}`);
    if (role) parts.push(`Role: ${role}`);
    if (scale) parts.push(`Scale: ${scale}`);
    if (notes.trim()) parts.push(`Additional context: ${notes.trim()}`);
    if (parts.length > 0) {
      combined += `\n\n${parts.join('\n')}`;
    }
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
      const response = await axios.post('http://localhost:8000/api/research', { query: combinedQuery });
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

  const handleExampleClick = (example) => {
    setQuery(example);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bohriumBg text-bohriumText selection:bg-bohriumPrimary selection:text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-bohriumBorder bg-[#13151A] flex flex-col hidden md:flex">
        <div className="p-6 border-b border-bohriumBorder flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">I</div>
          <h1 className="text-xl font-semibold tracking-tight">Insight AI</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs font-semibold text-bohriumMuted uppercase tracking-wider mb-4">Query History</div>
          {history.length === 0 ? (
            <div className="text-sm text-bohriumMuted italic">No history yet</div>
          ) : (
            <div className="space-y-2">
              {history.map(item => (
                <div key={item.id} className="p-3 bg-bohriumCard rounded-lg border border-bohriumBorder text-sm cursor-pointer hover:border-bohriumPrimary transition-colors line-clamp-2">
                  {item.query}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header / Search Bar area if we have a report */}
        {report && (
          <div className="p-4 border-b border-bohriumBorder bg-bohriumBg/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-bohriumCard border border-bohriumBorder rounded-full py-2 pl-4 pr-12 focus:outline-none focus:border-bohriumPrimary transition-colors text-sm"
                placeholder="Ask another question..."
              />
              <button type="submit" className="absolute right-2 top-1.5 p-1 text-bohriumMuted hover:text-bohriumPrimary">
                <Search size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Dynamic Center Stage */}
        <div className={`flex-1 overflow-y-auto ${!report && !loading ? 'flex items-center justify-center' : ''} p-6 md:p-8`}>

          {!report && !loading && (
            <div className="max-w-3xl w-full text-center space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-bohriumPrimary bg-clip-text text-transparent">
                  Autonomous Research Intelligence
                </h2>
                <p className="text-lg text-bohriumMuted max-w-2xl mx-auto">
                  Institutional-grade insights constructed dynamically from live web data, financial integrations, and multi-agent reasoning.
                </p>
              </div>

              <form onSubmit={handleSearch} className="relative group text-left">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-bohriumCard border border-bohriumBorder rounded-2xl shadow-2xl transition-all duration-300 focus-within:border-bohriumPrimary focus-within:ring-1 focus-within:ring-bohriumPrimary overflow-hidden">

                  {/* Main query input */}
                  <div className="flex items-center p-2">
                    <Search className="ml-3 text-bohriumMuted flex-shrink-0" size={24} />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="E.g., Deep dive into Nvidia's competitive moat and future revenue outlook"
                      className="w-full bg-transparent border-none py-4 px-4 text-lg focus:outline-none placeholder-bohriumBorder text-white"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !query.trim()}
                      className="bg-bohriumPrimary hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50 flex-shrink-0 mr-1"
                    >
                      Research
                    </button>
                  </div>

                  {/* Advanced toggle */}
                  <div className="px-5 pb-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center space-x-1.5 text-xs text-bohriumMuted hover:text-bohriumPrimary transition-colors ml-auto"
                    >
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}
                      />
                      <span>{showAdvanced ? 'Hide advanced options' : 'Show advanced options'}</span>
                    </button>
                  </div>

                  {/* Advanced options panel */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${showAdvanced ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-bohriumBorder/40 pt-4">

                      {/* Objective */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-200 mb-2">
                          <div className="w-4 h-4 rounded-full border-2 border-bohriumPrimary flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-bohriumPrimary"></div>
                          </div>
                          <span>Objective</span>
                        </label>
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) => setObjective(e.target.value)}
                          placeholder="e.g., Market analysis, feasibility study, academic insight..."
                          className="w-full bg-[#1E2128] border border-[#2D323B] rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-bohriumPrimary transition-colors"
                        />
                      </div>

                      {/* Two-column: Role + Scale */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <CustomDropdown
                          options={ROLE_OPTIONS}
                          value={role}
                          onChange={setRole}
                          label="Your Role"
                          icon={User}
                        />
                        <CustomDropdown
                          options={SCALE_OPTIONS}
                          value={scale}
                          onChange={setScale}
                          label="Scale"
                          icon={Globe}
                        />
                      </div>

                      {/* Additional Notes */}
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-200 mb-2">
                          <NotesIcon size={16} className="text-bohriumPrimary" />
                          <span>Additional Notes</span>
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Optional: restrictions, preferred sources, focus areas..."
                          rows={3}
                          className="w-full bg-[#1E2128] border border-[#2D323B] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-bohriumPrimary transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>

              {/* Example queries */}
              <div className="flex flex-wrap gap-3 justify-center text-sm text-bohriumMuted mt-6">
                <span className="text-gray-500">Try:</span>
                {EXAMPLE_QUERIES.map((eq) => (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => handleExampleClick(eq)}
                    className="bg-bohriumCard border border-bohriumBorder px-4 py-1.5 rounded-full hover:border-bohriumPrimary hover:text-bohriumPrimary transition-colors cursor-pointer"
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center space-y-12 max-w-xl mx-auto w-full">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-bohriumPrimary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-bohriumPrimary rounded-full animate-spin"></div>
                <Search className="text-bohriumPrimary animate-pulse" size={40} />
              </div>

              <div className="w-full space-y-6">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = idx === activeStep;
                  const isPast = idx < activeStep;

                  return (
                    <div key={step.id} className={`flex items-center space-x-4 transition-all duration-500 ${isActive ? 'scale-105' : 'opacity-60'}`}>
                      <div className={`p-3 rounded-full ${isPast ? 'bg-success/20 text-success' : isActive ? 'bg-bohriumPrimary/20 text-bohriumPrimary' : 'bg-bohriumCard border border-bohriumBorder text-bohriumMuted'}`}>
                        {isPast ? <div className="w-6 h-6 flex items-center justify-center text-sm font-bold">✓</div> : <Icon size={24} />}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-lg ${isActive ? 'text-white' : isPast ? 'text-bohriumText' : 'text-bohriumMuted'}`}>{step.label}</div>
                        {isActive && <div className="text-sm text-bohriumPrimary animate-pulse">Processing...</div>}
                      </div>
                      {isActive && <Loader2 className="animate-spin text-bohriumPrimary" size={20} />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-center max-w-2xl mx-auto">
              <h3 className="font-bold text-lg mb-2">Research Failed</h3>
              <p>{error}</p>
              <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">Dismiss</button>
            </div>
          )}

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
