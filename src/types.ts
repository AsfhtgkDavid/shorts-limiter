export interface Message {
  type: string;
  enabled?: boolean;
}

export interface Settings {
  maxShorts: number;
  enabled: boolean;
}

export interface GenericSettings {
  [setting: string]: string;
}

export interface ShortsCount {
  shortsCount: number;
}
