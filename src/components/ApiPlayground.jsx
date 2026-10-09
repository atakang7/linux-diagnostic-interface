import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { api } from '../services/api';

const operations = [
  { id: 'files', method: 'GET', path: '/api/files', label: 'File tree' },
  { id: 'logs', method: 'GET', path: '/api/logs', label: 'Recent logs' },
  { id: 'search', method: 'POST', path: '/api/logs/search', label: 'Log search' },
  { id: 'network', method: 'GET', path: '/api/network/metrics', label: 'Network statistics' },
  { id: 'ready', method: 'GET', path: '/readyz', label: 'Readiness' }
];

export default function ApiPlayground() {
  const [mode, setMode] = useState('files');
  const [path, setPath] = useState('/');
  const [file, setFile] = useState('/var/log/syslog');
  const [query, setQuery] = useState('error');
  const [response, setResponse] = useState(null);
  const [busy, setBusy] = useState(false);

  async function run(event) {
    event.preventDefault();
    setBusy(true);
    setResponse(null);
    try {
      let data;
      switch (mode) {
        case 'files': data = await api.getFileTree(path, 2); break;
        case 'logs': data = await api.getLogs(file); break;
        case 'search': data = await api.searchLogs(query, file ? [file] : []); break;
        case 'network': data = await api.getNetworkMetrics(); break;
        case 'ready': data = { ready: await api.getReady() }; break;
        default: throw new Error('Unknown request type');
      }
      setResponse({ ok: true, data });
    } catch (error) {
      setResponse({ ok: false, data: error.response?.data || error.message || 'Request failed' });
    } finally {
      setBusy(false);
    }
  }

  const operation = operations.find(item => item.id === mode);
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">API explorer</h2>
        <p className="mt-1 text-sm text-slate-500">Issue supported requests to the diagnostic client</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <nav aria-label="API requests" className="h-fit space-y-1 rounded-lg border border-slate-200 bg-white p-3">
          {operations.map(item => (
            <button key={item.id} onClick={() => { setMode(item.id); setResponse(null); }}
              className={'w-full rounded-md px-3 py-3 text-left text-sm ' +
                (mode === item.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100')}>
              <span className="mr-2 text-xs font-semibold">{item.method}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0 space-y-4">
          <form onSubmit={run} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mb-5 border-b border-slate-100 pb-4">
              <p className="font-mono text-sm"><span className="mr-3 font-bold text-blue-700">{operation.method}</span>{operation.path}</p>
            </div>
            {mode === 'files' && (
              <label className="mb-4 block text-sm">Directory path
                <input value={path} onChange={e => setPath(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-slate-200 p-2 font-mono text-sm" />
              </label>
            )}
            {(mode === 'logs' || mode === 'search') && (
              <label className="mb-4 block text-sm">File path
                <input value={file} onChange={e => setFile(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-slate-200 p-2 font-mono text-sm" />
              </label>
            )}
            {mode === 'search' && (
              <label className="mb-4 block text-sm">Search terms
                <input value={query} onChange={e => setQuery(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-slate-200 p-2 text-sm" />
              </label>
            )}
            <button disabled={busy} type="submit"
              className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              <Play size={14} /> {busy ? 'Running…' : 'Send request'}
            </button>
          </form>
          {response && (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className={'border-b p-4 text-sm font-medium ' + (response.ok ? 'text-emerald-700' : 'text-red-700')}>
                {response.ok ? 'Response received' : 'Request failed'}
              </div>
              <pre aria-label="API response" className="max-h-[500px] overflow-auto p-5 text-xs leading-6 text-slate-700">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
