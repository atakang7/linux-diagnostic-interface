import axios from 'axios';
import { FileUpdate, LogEntry, NetworkMetricsResponse } from '../types/api';

// The UI and API share an origin. CRA proxies /api and /ws in development;
// production hosts must proxy both paths to diagnostic-client.
const timeoutMs = Number(process.env.REACT_APP_API_TIMEOUT_MS || 10000);
if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
  throw new Error('REACT_APP_API_TIMEOUT_MS must be a positive number');
}

const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
  timeout: timeoutMs
});

function expectList<T>(data: unknown, endpoint: string): T[] {
  if (!Array.isArray(data)) {
    throw new Error(`Unexpected ${endpoint} response: expected an array`);
  }
  return data as T[];
}

export const api = {
  async getFileTree(path = '/', depth = 1): Promise<FileUpdate[]> {
    const { data } = await client.get<FileUpdate[]>('/api/files', { params: { path, depth } });
    return expectList<FileUpdate>(data, '/api/files');
  },
  async getLogs(file: string, before?: string): Promise<LogEntry[]> {
    const { data } = await client.get<LogEntry[]>('/api/logs', { params: { file, before } });
    return expectList<LogEntry>(data, '/api/logs');
  },
  async searchLogs(query: string, files: string[] = []): Promise<LogEntry[]> {
    const { data } = await client.post<LogEntry[]>('/api/logs/search', { query, files });
    return expectList<LogEntry>(data, '/api/logs/search');
  },
  async getNetworkMetrics(): Promise<NetworkMetricsResponse> {
    const { data } = await client.get<NetworkMetricsResponse>('/api/network/metrics');
    return data;
  },
  async getReady(): Promise<boolean> {
    try {
      await client.get('/readyz');
      return true;
    } catch {
      return false;
    }
  }
};

export function createWebSocket(): WebSocket {
  const base = process.env.REACT_APP_API_BASE_URL || window.location.origin;
  const uri = new URL('/ws', base);
  uri.protocol = uri.protocol === 'https:' ? 'wss:' : 'ws:';
  return new WebSocket(uri.toString());
}
