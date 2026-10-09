import React, { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCcw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useLogStream } from '../hooks/useLogStream';

const levelClass = {
  error: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
  info: 'bg-blue-50 text-blue-700'
};

export default function LogViewer() {
  const [params, setParams] = useSearchParams();
  const selected = params.get('file') || '';
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const { logs: live, connected } = useLogStream(selected);

  useEffect(() => {
    let active = true;
    api.getFileTree('/', 10)
      .then(tree => {
        if (!active) return;
        const discovered = tree.filter(file => !file.is_directory).map(file => file.path).sort();
        setFiles(discovered);
        if (!selected && discovered.length) setParams({ file: discovered[0] }, { replace: true });
      })
      .catch(() => { if (active) setError('Unable to load the log inventory.'); });
    return () => { active = false; };
  }, []); // The file inventory is loaded once on mount.

  useEffect(() => {
    if (!selected) {
      setHistory([]);
      return;
    }
    let active = true;
    setResults(null);
    setError('');
    setLoading(true);
    api.getLogs(selected)
      .then(rows => {
        if (!active) return;
        setHistory(rows);
        setHasMore(rows.length === 100);
      })
      .catch(() => { if (active) setError('Unable to load logs for this file.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selected]);

  const logs = useMemo(() => {
    const combined = [...live, ...history].filter(row => row.filename === selected);
    const unique = new Map();
    for (const row of combined) unique.set(row.timestamp + ':' + row.line_num + ':' + row.line, row);
    return [...unique.values()].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 1000);
  }, [live, history, selected]);
  const visible = results === null ? logs : results;

  async function runSearch(event) {
    event.preventDefault();
    if (!selected || !search.trim()) return;
    setLoading(true);
    setError('');
    try {
      setResults(await api.searchLogs(search.trim(), [selected]));
    } catch {
      setError('Unable to search logs. Check the API connection.');
    } finally {
      setLoading(false);
    }
  }

  async function older() {
    const oldest = history[history.length - 1];
    if (!selected || !oldest) return;
    setLoading(true);
    try {
      const next = await api.getLogs(selected, oldest.timestamp);
      setHistory(previous => [...previous, ...next]);
      setHasMore(next.length === 100);
    } catch {
      setError('Unable to load earlier entries.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Log viewer</h2>
          <p className="mt-1 text-sm text-slate-500">Historical records and live updates for a selected file</p>
        </div>
        <span className={'rounded-full px-3 py-1 text-xs font-medium ' +
          (connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
          {connected ? 'Live stream connected' : 'Live stream offline'}
        </span>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label htmlFor="log-file" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Log file</label>
        <select id="log-file" value={selected} onChange={e => setParams({ file: e.target.value })}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
          {!selected && <option value="">Select a file</option>}
          {selected && !files.includes(selected) && <option value={selected}>{selected}</option>}
          {files.map(file => <option value={file} key={file}>{file}</option>)}
        </select>
        <form onSubmit={runSearch} className="mt-4 flex flex-wrap gap-2">
          <div className="relative min-w-0 flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input aria-label="Search logs" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search within this file" className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
          </div>
          <button type="submit" disabled={!selected || !search.trim() || loading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
            Search
          </button>
          {results !== null && (
            <button type="button" onClick={() => { setResults(null); setSearch(''); }}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm">Clear</button>
          )}
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold">{results === null ? 'Entries' : 'Search results'}</h3>
          <span className="text-xs text-slate-500">{visible.length} shown</span>
        </div>
        {error && <p role="alert" className="m-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading && <p className="px-5 py-3 text-sm text-slate-500">Loading…</p>}
        {visible.length === 0 && !loading ? (
          <p className="p-10 text-center text-sm text-slate-500">
            {selected ? 'No matching log entries.' : 'Select a file to inspect its logs.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((row, index) => (
              <li key={row.timestamp + ':' + row.line_num + ':' + index} className="grid gap-2 px-5 py-3 text-sm md:grid-cols-[170px_80px_1fr]">
                <time className="text-xs text-slate-500">{new Date(row.timestamp).toLocaleString()}</time>
                <span className={'h-fit w-fit rounded px-2 py-0.5 text-xs font-medium ' +
                  (levelClass[(row.level || '').toLowerCase()] || 'bg-slate-100 text-slate-600')}>
                  {row.level || 'log'}
                </span>
                <p className="break-words font-mono text-xs leading-6 text-slate-800">{row.line}</p>
              </li>
            ))}
          </ul>
        )}
        {results === null && hasMore && (
          <button onClick={older} disabled={loading}
            className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-sm text-blue-700 hover:bg-slate-50">
            <RefreshCcw size={14} /> Load older entries
          </button>
        )}
      </div>
    </section>
  );
}
