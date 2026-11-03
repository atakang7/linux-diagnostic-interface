import axios from 'axios';
import { FileUpdate, LogEntry, NetworkMetricsResponse } from '../types/api';

// The UI and API share an origin. CRA proxies /api and /ws in development;
// production hosts must proxy both paths to diagnostic-client.
const client = axios.create({ baseURL: process.env.REACT_APP_API_BASE_URL || '' });

export const api = {
  async getFileTree(path = '/', depth = 1): Promise<FileUpdate[]> {
    const { data } = await client.get<FileUpdate[]>('/api/files', { params: { path, depth } });
    return Array.isArray(data) ? data : [];
  },
  async getLogs(file: string, before?: string): Promise<LogEntry[]> {
    const { data } = await client.get<LogEntry[]>('/api/logs', { params: { file, before } });
    return Array.isArray(data) ? data : [];
  },
  async searchLogs(query: string, files: string[] = []): Promise<LogEntry[]> {
    const { data } = await client.post<LogEntry[]>('/api/logs/search', { query, files });
    return Array.isArray(data) ? data : [];
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
