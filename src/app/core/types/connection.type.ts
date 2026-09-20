export type NetworkStatus = 'unknown' | 'online' | 'offline';

export type BackendStatus = 'unknown' | 'checking' | 'reachable' | 'unreachable' | 'degraded';

export type ConnectionStatus =
  'checking' | 'online' | 'offline' | 'server-unreachable' | 'degraded';

export interface BackendHealthResponse {
  status: 'ok' | 'degraded';
  timestamp?: string;
}
