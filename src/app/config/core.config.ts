import { ThemeColor, ThemeMode } from '../core/models/theme.model';
import { StorageArea } from './storage.config';

export interface CoreModuleConfig {
  /**
   * REST API base URL.
   */
  apiBaseUrl: string;

  storage: {
    namespace: string;
    version?: number;
    defaultArea?: StorageArea;
  };
  theme?: {
    defaultColor?: ThemeColor;
    defaultMode?: ThemeMode;
  };

  apiRequestTimeoutMs?: number;
  connection?: {
    healthPath?: string;
    pollIntervalMs?: number;
    timeoutMs?: number;
    degradedLatencyMs?: number;
  };

}
