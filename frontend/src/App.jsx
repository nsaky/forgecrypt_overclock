import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, FileText, Activity, Layers, Database } from 'lucide-react';
import ReportViewer from './components/ReportViewer';

const STEPS = [
  { id: 'intake', label: 'Query Intelligence', icon: Search },
  { id: 'research', label: 'Researching Sources', icon: Database },
  { id: 'extract', label: 'Extracting Evidence', icon: FileText },
  { id: 'finance', label: 'Financial Analysis', icon: Activity },
  { id: 'synth', label: 'Synthesizing Report', icon: Layers }
];

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setReport(null);
    setError(null);
    setActiveStep(0);

    // Simulate steps for UI feel while waiting for long polling
    const stepInterval = setInterval(() => {
      setActiveStep(prev => prev < 4 ? prev + 1 : prev);
    }, 4000);

    try {
      const response = await axios.post('http://localhost:8000/api/research', { query });
      clearInterval(stepInterval);
      setReport(response.data);
      setHistory(prev => [{ id: response.data.query_id, query, date: new Date().toLocaleTimeString() }, ...prev]);
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.response?.data?.detail || err.message || 'An error occurred during research.');
    } finally {
      setLoading(false);
    }
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

              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-bohriumCard border border-bohriumBorder rounded-xl p-2 shadow-2xl transition-all duration-300 focus-within:border-bohriumPrimary focus-within:ring-1 focus-within:ring-bohriumPrimary">
                  <Search className="ml-3 text-bohriumMuted" size={24} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="E.g., Deep dive into Nvidia's competitive moat and future revenue outlook"
                    className="w-full bg-transparent border-none py-4 px-4 text-lg focus:outline-none placeholder-bohriumBorder text-white rounded-xl"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="bg-bohriumPrimary hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50"
                  >
                    Research
                  </button>
                </div>
              </form>

              <div className="flex gap-4 justify-center text-sm text-bohriumMuted mt-8">
                <span className="bg-bohriumCard border border-bohriumBorder px-3 py-1 rounded-full">Bloomberg Terminal UX</span>
                <span className="bg-bohriumCard border border-bohriumBorder px-3 py-1 rounded-full">Perplexity Architecture</span>
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

                  let displayClass = "text-bohriumBorder";
                  if (isActive) displayClass = "text-white glow-focus";
                  if (isPast) displayClass = "text-success";

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
