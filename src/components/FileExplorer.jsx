import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, File, Folder, Home, RefreshCcw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function FileExplorer() {
  const navigate = useNavigate();
  const [path, setPath] = useState('/');
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setSelected(null);
    api.getFileTree(path, 1)
      .then(files => {
        if (active) setEntries(files.filter(file => file.path !== path));
      })
      .catch(() => {
        if (active) {
          setEntries([]);
          setError('Unable to load files. Check that the diagnostic client is running.');
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path, refresh]);

  const items = useMemo(() => entries
    .filter(item => (item.name || item.path).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(b.is_directory) - Number(a.is_directory) || a.name.localeCompare(b.name)),
  [entries, query]);

  const segments = path.split('/').filter(Boolean);
  const crumbs = segments.map((name, index) => ({
    name, path: '/' + segments.slice(0, index + 1).join('/')
  }));

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">File explorer</h2>
          <p className="mt-1 text-sm text-slate-500">Discovered log paths from the collector</p>
        </div>
        <button onClick={() => setRefresh(current => current + 1)}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCcw size={15} /> Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <nav aria-label="File path" className="flex flex-wrap items-center gap-1 text-sm">
            <button onClick={() => setPath('/')} aria-label="Root directory"
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><Home size={17} /></button>
            {crumbs.map(crumb => (
              <React.Fragment key={crumb.path}>
                <ChevronRight size={14} className="text-slate-400" />
                <button className="rounded px-1.5 py-1 font-medium hover:bg-slate-100"
                  onClick={() => setPath(crumb.path)}>{crumb.name}</button>
              </React.Fragment>
            ))}
          </nav>
          <label className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input aria-label="Filter files" value={query} onChange={event => setQuery(event.target.value)}
              placeholder="Filter this folder" className="w-56 rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
          </label>
        </div>

        {error && <p role="alert" className="m-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading files…</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No files in this location.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map(item => (
              <li key={item.path}>
                <button onClick={() => item.is_directory ? setPath(item.path) : setSelected(item)}
                  className={'flex w-full items-center gap-3 px-5 py-3 text-left text-sm hover:bg-slate-50 ' +
                    (selected?.path === item.path ? 'bg-blue-50' : '')}>
                  {item.is_directory
                    ? <Folder size={18} className="shrink-0 text-blue-600" />
                    : <File size={18} className="shrink-0 text-slate-500" />}
                  <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                  <span className="hidden text-xs text-slate-400 sm:block">
                    {item.is_directory ? 'Folder' : new Intl.NumberFormat().format(item.size || 0) + ' B'}
                  </span>
                  {item.is_directory && <ChevronRight size={16} className="text-slate-400" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium">{selected.name}</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-500">{selected.path}</p>
          </div>
          <button onClick={() => navigate('/logs?file=' + encodeURIComponent(selected.path))}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            View logs
          </button>
        </div>
      )}
    </section>
  );
}
