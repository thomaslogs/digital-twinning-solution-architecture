export type Status = "ok" | "warning" | "critical" | "offline";

export type StatusFilter = "all" | "warnings" | "critical";

export type TwinLevel = "sites" | "site" | "device" | "component";

export interface SiteMetrics {
  uptime: number;
  totalDevices: number;
  activeAlerts: number;
  utilization: number;
}

export interface DeviceMetrics {
  isOn: boolean;
  cycleRate: number;
  temperature: number;
  lastHeartbeat: string;
  utilization: number;
}

export interface ComponentMetrics {
  vibration: number;
  errorRate: number;
  latency: number;
  predictedFailureScore: number;
}

export interface ComponentNode {
  id: string;
  name: string;
  position: [number, number, number];
  status: Status;
  metrics: ComponentMetrics;
}

export interface DeviceNode {
  id: string;
  name: string;
  position: [number, number, number];
  status: Status;
  metrics: DeviceMetrics;
  components: ComponentNode[];
}

export interface SiteNode {
  id: string;
  name: string;
  position: [number, number, number];
  status: Status;
  metrics: SiteMetrics;
  devices: DeviceNode[];
}

export interface TwinSelection {
  level: TwinLevel;
  siteId?: string;
  deviceId?: string;
  componentId?: string;
}

export interface SearchOption {
  id: string;
  label: string;
  type: "site" | "device" | "component";
  status: Status;
  siteId: string;
  deviceId?: string;
  componentId?: string;
}
