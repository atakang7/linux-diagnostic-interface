export interface FileUpdate {
  path: string;
  parent_path: string;
  name: string;
  is_directory: boolean;
  size: number;
  mod_time: string;
  is_gzipped: boolean;
  is_scraped: boolean;
}

export interface LogEntry {
  filename: string;
  line: string;
  line_num: number;
  timestamp: string;
  level: string;
}

export interface NetworkPacket {
  timestamp: string;
  protocol: string;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  length: number;
  payload_size: number;
  tcp_flags?: string;
}

export interface NetworkMetricsResponse {
  packet_count: number;
  total_bytes: number;
  avg_packet_size: number;
  unique_sources: number;
  unique_destinations: number;
  protocol_count: number;
  protocol_stats: Record<string, number>;
  packets: NetworkPacket[];
}
