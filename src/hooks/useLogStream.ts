import { useEffect, useState } from 'react';
import { createWebSocket } from '../services/api';
import { LogEntry } from '../types/api';

export function useLogStream(file: string) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!file) return;
    let active = true;
    let socket: WebSocket | null = null;
    let reconnect: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      if (!active) return;
      socket = createWebSocket();
      socket.onopen = () => {
        if (!active) return;
        setConnected(true);
        socket?.send(JSON.stringify({ type: 'view_file', payload: file }));
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type !== 'log' || message.payload?.filename !== file) return;
          setLogs(previous => [message.payload as LogEntry, ...previous].slice(0, 1000));
        } catch {
          // Ignore malformed telemetry without tearing down the stream.
        }
      };
      socket.onclose = () => {
        if (!active) return;
        setConnected(false);
        reconnect = setTimeout(connect, 3000);
      };
      socket.onerror = () => socket?.close();
    };
    setLogs([]);
    setConnected(false);
    connect();

    return () => {
      active = false;
      if (reconnect) clearTimeout(reconnect);
      socket?.close();
    };
  }, [file]);

  return { logs, connected };
}
