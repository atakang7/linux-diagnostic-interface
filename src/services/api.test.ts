import axios from 'axios';
import { api, createWebSocket } from './api';

jest.mock('axios', () => ({
  __esModule: true,
  default: { create: jest.fn(() => ({ get: jest.fn(), post: jest.fn() })) }
}));

const transport = (axios.create as jest.Mock).mock.results[0].value;

beforeEach(() => {
  transport.get.mockReset();
  transport.post.mockReset();
});

test('file tree requests the real /api/files contract', async () => {
  transport.get.mockResolvedValue({ data: [{ path: '/var', is_directory: true }] });
  const entries = await api.getFileTree('/', 2);
  expect(entries).toHaveLength(1);
  expect(transport.get).toHaveBeenCalledWith('/api/files', {
    params: { path: '/', depth: 2 }
  });
});

test('GET /api/logs paginates through before, not invented query keys', async () => {
  transport.get.mockResolvedValue({ data: [] });
  await api.getLogs('/var/log/app.log', '2026-10-09T10:00:00Z');
  expect(transport.get).toHaveBeenCalledWith('/api/logs', {
    params: { file: '/var/log/app.log', before: '2026-10-09T10:00:00Z' }
  });
});

test('log search is POST with the backend JSON field names', async () => {
  transport.post.mockResolvedValue({ data: [] });
  await api.searchLogs('failure', ['/var/log/app.log']);
  expect(transport.post).toHaveBeenCalledWith('/api/logs/search', {
    query: 'failure', files: ['/var/log/app.log']
  });
});

test('network metrics are a statistics envelope, not a raw packet array', async () => {
  transport.get.mockResolvedValue({ data: { packet_count: 2, packets: [{ protocol: 'TCP' }] } });
  const response = await api.getNetworkMetrics();
  expect(response.packet_count).toBe(2);
  expect(response.packets).toHaveLength(1);
  expect(transport.get).toHaveBeenCalledWith('/api/network/metrics');
});

test('readiness returns false rather than throwing for a backend outage', async () => {
  transport.get.mockRejectedValue(new Error('ECONNREFUSED'));
  await expect(api.getReady()).resolves.toBe(false);
});

test('WebSocket uses the current origin and preserves ws protocol', () => {
  const original = global.WebSocket;
  const socket = jest.fn();
  Object.defineProperty(global, 'WebSocket', { value: socket, configurable: true });
  try {
    createWebSocket();
    expect(socket).toHaveBeenCalledWith('ws://localhost/ws');
  } finally {
    Object.defineProperty(global, 'WebSocket', { value: original, configurable: true });
  }
});
