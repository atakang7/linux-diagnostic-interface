import React, { useEffect, useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, createWebSocket } from '../services/api';

const readableBytes = value => {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  if (value < 1024) return value + ' B';
  if (value < 1024 * 1024) return (value / 1024).toFixed(1) + ' KB';
  return (value / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function NetworkMonitor() {
  const [packets, setPackets] = useState([]);
  const [statistics, setStatistics] = useState({ packet_count: 0, total_bytes: 0, protocol_stats: {} });
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [protocol, setProtocol] = useState('All');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getNetworkMetrics()
      .then(data => {
        if (!active) return;
        setPackets(Array.isArray(data.packets) ? data.packets : []);
        setStatistics({
          packet_count: Number(data.packet_count) || 0,
          total_bytes: Number(data.total_bytes) || 0,
          protocol_stats: data.protocol_stats || {}
        });
      })
      .catch(() => { if (active) setError('Unable to fetch network history from the API.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    let socket;
    let timeout;
    const connect = () => {
      if (!active) return;
      socket = createWebSocket();
      socket.onopen = () => { if (active) setConnected(true); };
      socket.onmessage = event => {
        try {
          const message = JSON.parse(event.data);
          if (message.type !== 'network' || !Array.isArray(message.payload)) return;
          const batch = message.payload;
          setPackets(previous => [...batch, ...previous].slice(0, 200));
          setStatistics(previous => {
            const counts = { ...previous.protocol_stats };
            for (const p of batch) counts[p.protocol || 'other'] = (counts[p.protocol || 'other'] || 0) + 1;
            return {
              packet_count: previous.packet_count + batch.length,
              total_bytes: previous.total_bytes + batch.reduce((sum, p) => sum + (Number(p.length) || 0), 0),
              protocol_stats: counts
            };
          });
        } catch {
          // Ignore malformed telemetry frames.
        }
      };
      socket.onclose = () => {
        if (!active) return;
        setConnected(false);
        timeout = setTimeout(connect, 3000);
      };
      socket.onerror = () => socket.close();
    };
    connect();
    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
      if (socket) socket.close();
    };
  }, []);

  const protocols = useMemo(() => ['All', ...new Set(packets.map(p => p.protocol).filter(Boolean))], [packets]);
  const visible = useMemo(() => packets.filter(p => protocol === 'All' || p.protocol === protocol), [packets, protocol]);
  const histogram = Object.entries(statistics.protocol_stats).map(([name, count]) => ({ name, count }));

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Network monitor</h2>
          <p className="mt-1 text-sm text-slate-500">Packet history and incoming network events</p>
        </div>
        <span className={'rounded-full px-3 py-1 text-xs font-medium ' +
          (connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
          {connected ? 'Live stream connected' : 'Live stream offline'}
        </span>
      </div>
      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Packets observed', statistics.packet_count.toLocaleString()],
          ['Traffic recorded', readableBytes(statistics.total_bytes)],
          ['Protocols', String(Object.keys(statistics.protocol_stats).length)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Activity size={16} /> Protocol distribution</h3>
          <span className="text-xs text-slate-400">Current query and stream</span>
        </div>
        {histogram.length ? (
          <div className="h-48" aria-label="Protocol packet count chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogram} margin={{ top: 5, right: 8, bottom: 5, left: 8 }}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="py-10 text-center text-sm text-slate-500">No packet data available.</p>}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold">Recent packets</h3>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Protocol
            <select value={protocol} onChange={e => setProtocol(e.target.value)}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800">
              {protocols.map(name => <option key={name}>{name}</option>)}
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Destination</th>
                <th className="px-5 py-3 font-medium">Protocol</th>
                <th className="px-5 py-3 font-medium">Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((packet, index) => (
                <tr key={packet.timestamp + ':' + index} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500">{new Date(packet.timestamp).toLocaleTimeString()}</td>
                  <td className="px-5 py-3 font-mono text-xs">{packet.src_ip}:{packet.src_port}</td>
                  <td className="px-5 py-3 font-mono text-xs">{packet.dst_ip}:{packet.dst_port}</td>
                  <td className="px-5 py-3">{packet.protocol}</td>
                  <td className="px-5 py-3 tabular-nums">{readableBytes(packet.length)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <p className="py-10 text-center text-sm text-slate-500">
            {loading ? 'Loading network data…' : 'No matching packets.'}
          </p>}
        </div>
      </div>
    </section>
  );
}
