import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createWebSocket } from '../services/api';

export default function WebSocketTester() {
  const socket = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState('/var/log/syslog');
  const [error, setError] = useState('');

  const record = useCallback((kind, payload) => {
    setMessages(previous => [{ kind, payload, at: new Date().toISOString() }, ...previous].slice(0, 100));
  }, []);

  const disconnect = useCallback(() => {
    if (socket.current) {
      socket.current.close();
      socket.current = null;
    }
    setConnected(false);
  }, []);

  const connect = useCallback(() => {
    disconnect();
    setError('');
    try {
      const ws = createWebSocket();
      socket.current = ws;
      ws.onopen = () => {
        setConnected(true);
        record('system', 'Connected');
      };
      ws.onmessage = event => {
        try {
          record('received', JSON.parse(event.data));
        } catch {
          record('received', event.data);
        }
      };
      ws.onclose = () => {
        if (socket.current === ws) socket.current = null;
        setConnected(false);
        record('system', 'Connection closed');
      };
      ws.onerror = () => setError('WebSocket connection failed.');
    } catch (err) {
      setError(err.message || 'Invalid WebSocket URL.');
    }
  }, [disconnect, record]);

  useEffect(() => () => {
    if (socket.current) socket.current.close();
  }, []);

  const subscribe = event => {
    event.preventDefault();
    if (!connected || !socket.current || !file.trim()) return;
    const message = { type: 'view_file', payload: file.trim() };
    socket.current.send(JSON.stringify(message));
    record('sent', message);
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">WebSocket inspector</h2>
        <p className="mt-1 text-sm text-slate-500">Inspect real-time frames from the same-origin /ws endpoint</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={'rounded-full px-3 py-1 text-xs font-medium ' +
            (connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
          <div className="flex gap-2">
            <button onClick={connect} disabled={connected}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">Connect</button>
            <button onClick={disconnect} disabled={!connected}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm disabled:opacity-40">Disconnect</button>
          </div>
        </div>
        <form onSubmit={subscribe} className="mt-5 flex flex-wrap gap-2">
          <input aria-label="Subscribed log path" value={file} onChange={e => setFile(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 font-mono text-sm" />
          <button type="submit" disabled={!connected || !file.trim()}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm disabled:opacity-40">Subscribe to log</button>
        </form>
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex justify-between border-b border-slate-100 p-4 text-sm font-semibold">
          <span>Event log</span><span className="font-normal text-slate-500">{messages.length} recent frames</span>
        </div>
        {messages.length === 0 && <p className="p-10 text-center text-sm text-slate-500">Connect to inspect incoming frames.</p>}
        <ul className="max-h-[600px] divide-y divide-slate-100 overflow-auto">
          {messages.map((item, index) => (
            <li key={item.at + index} className="p-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wide text-slate-600">{item.kind}</span>
                <time className="text-slate-400">{new Date(item.at).toLocaleTimeString()}</time>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-slate-700">
                {typeof item.payload === 'string' ? item.payload : JSON.stringify(item.payload, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
