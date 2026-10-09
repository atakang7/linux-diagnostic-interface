import React, { useEffect, useState } from 'react';
import { Activity, FileText, FolderTree, Menu, Network, Terminal, X } from 'lucide-react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { api } from '../services/api';
import FileExplorer from './FileExplorer';
import LogViewer from './LogViewer';
import NetworkMonitor from './NetworkMonitor';
import WebSocketTester from './WebSocketTester';
import ApiPlayground from './ApiPlayground';

const sections = [
  { path: '/', label: 'File explorer', icon: FolderTree },
  { path: '/logs', label: 'Logs', icon: FileText },
  { path: '/network', label: 'Network', icon: Network },
  { path: '/api', label: 'API explorer', icon: Terminal },
  { path: '/ws-test', label: 'WebSocket', icon: Activity }
];

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    const check = async () => {
      const state = await api.getReady();
      if (live) setReady(state);
    };
    check();
    const interval = setInterval(check, 15000);
    return () => {
      live = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ' +
        (mobileOpen ? 'translate-x-0' : '-translate-x-full')
      }>
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div>
            <div className="text-base font-semibold tracking-tight">Linux Diagnostics</div>
            <div className="text-xs text-slate-500">Operations console</div>
          </div>
          <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="md:hidden">
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-5">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <NavLink
                key={section.path}
                to={section.path}
                end={section.path === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ' +
                  (isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                }
              >
                <Icon size={18} aria-hidden />
                {section.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className={'h-2 w-2 rounded-full ' + (ready ? 'bg-emerald-500' : 'bg-amber-500')} />
            {ready ? 'Backend connected' : 'Backend unavailable'}
          </div>
          <p className="mt-2 text-xs text-slate-400">Local diagnostic environment</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="md:hidden" aria-label="Open navigation">
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Diagnostic console</h1>
              <p className="text-xs text-slate-500">Explore collected Linux telemetry</p>
            </div>
          </div>
          <span className="hidden rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-500 sm:inline-block">
            {ready ? 'API ready' : 'Offline'}
          </span>
        </header>

        <div className="mx-auto max-w-7xl p-4 md:p-8">
          <Routes>
            <Route path="/" element={<FileExplorer />} />
            <Route path="/logs" element={<LogViewer />} />
            <Route path="/network" element={<NetworkMonitor />} />
            <Route path="/api" element={<ApiPlayground />} />
            <Route path="/ws-test" element={<WebSocketTester />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
