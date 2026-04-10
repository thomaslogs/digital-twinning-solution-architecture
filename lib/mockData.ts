import { aggregateStatus } from "@/lib/status";
import type { ComponentNode, DeviceNode, SiteNode, Status } from "@/types/twin";

const SITE_COUNT = 6;
const DEVICES_PER_SITE = 10;
const COMPONENTS_PER_DEVICE = 6;

const SITE_NAMES = [
  "Berlin Campus",
  "Boston Lab",
  "Munich Factory",
  "Singapore Hub",
  "Chicago Center",
  "Austin Plant"
];

const DEVICE_NAMES = [
  "MRI Controller",
  "CT Scanner",
  "X-Ray Arm",
  "Ultrasound Core",
  "Ventilation Unit",
  "Injector Module",
  "Thermal Pump",
  "Power Cabinet",
  "Cooling Rack",
  "Network Edge"
];

const COMPONENT_NAMES = [
  "Motor Driver",
  "Sensor Array",
  "Cooling Loop",
  "I/O Board",
  "Signal Module",
  "Power Bus"
];

const INITIAL_SEED = 726331;

export interface SimulationState {
  seed: number;
  tick: number;
}

function seededRandom(seed: number): { value: number; nextSeed: number } {
  const nextSeed = (seed * 1664525 + 1013904223) >>> 0;
  return { value: nextSeed / 4294967296, nextSeed };
}

function pickStatus(random: number): Status {
  if (random > 0.98) return "offline";
  if (random > 0.94) return "critical";
  if (random > 0.86) return "warning";
  return "ok";
}

function toPct(value: number): number {
  return Math.max(0, Math.min(100, Number(value.toFixed(1))));
}

function isoNowWithOffset(secondsAgo = 0): string {
  return new Date(Date.now() - secondsAgo * 1000).toISOString();
}

function createComponent(siteIndex: number, deviceIndex: number, componentIndex: number, seedRef: { seed: number }): ComponentNode {
  const randomA = seededRandom(seedRef.seed);
  seedRef.seed = randomA.nextSeed;
  const randomB = seededRandom(seedRef.seed);
  seedRef.seed = randomB.nextSeed;
  const randomC = seededRandom(seedRef.seed);
  seedRef.seed = randomC.nextSeed;

  return {
    id: `s${siteIndex}-d${deviceIndex}-c${componentIndex}`,
    name: COMPONENT_NAMES[componentIndex % COMPONENT_NAMES.length],
    position: [
      Math.cos((componentIndex / COMPONENTS_PER_DEVICE) * Math.PI * 2) * 1.2,
      0.7 + (componentIndex % 2) * 0.35,
      Math.sin((componentIndex / COMPONENTS_PER_DEVICE) * Math.PI * 2) * 1.2
    ],
    status: pickStatus(randomA.value),
    metrics: {
      vibration: Number((1.5 + randomB.value * 3.6).toFixed(2)),
      errorRate: Number((randomC.value * 1.8).toFixed(2)),
      latency: Number((6 + randomA.value * 22).toFixed(1)),
      predictedFailureScore: toPct(10 + randomB.value * 40)
    }
  };
}

function createDevice(siteIndex: number, deviceIndex: number, seedRef: { seed: number }): DeviceNode {
  const components = Array.from({ length: COMPONENTS_PER_DEVICE }, (_, componentIndex) =>
    createComponent(siteIndex, deviceIndex, componentIndex, seedRef)
  );

  const status = aggregateStatus(components.map((component) => component.status));
  const utilization = toPct(
    components.reduce((acc, component) => acc + component.metrics.predictedFailureScore * 0.45, 18) /
      components.length
  );

  return {
    id: `s${siteIndex}-d${deviceIndex}`,
    name: DEVICE_NAMES[deviceIndex % DEVICE_NAMES.length],
    position: [
      ((deviceIndex % 5) - 2) * 1.8,
      0.55,
      (Math.floor(deviceIndex / 5) - 0.5) * 2.5
    ],
    status,
    metrics: {
      isOn: status !== "offline",
      cycleRate: Number((16 + utilization * 0.6).toFixed(1)),
      temperature: Number((22 + utilization * 0.35).toFixed(1)),
      lastHeartbeat: isoNowWithOffset(Math.round(deviceIndex * 7)),
      utilization
    },
    components
  };
}

function createSite(siteIndex: number, seedRef: { seed: number }): SiteNode {
  const devices = Array.from({ length: DEVICES_PER_SITE }, (_, deviceIndex) => createDevice(siteIndex, deviceIndex, seedRef));

  const status = aggregateStatus(devices.map((device) => device.status));
  const activeAlerts = devices.filter((device) => device.status !== "ok").length;

  return {
    id: `s${siteIndex}`,
    name: SITE_NAMES[siteIndex % SITE_NAMES.length],
    position: [((siteIndex % 3) - 1) * 14, 0, (Math.floor(siteIndex / 3) - 0.5) * 12],
    status,
    metrics: {
      uptime: toPct(96 + (siteIndex % 3) * 1.1 - activeAlerts * 0.4),
      totalDevices: devices.length,
      activeAlerts,
      utilization: toPct(devices.reduce((acc, device) => acc + device.metrics.utilization, 0) / devices.length)
    },
    devices
  };
}

export function createInitialSites(): SiteNode[] {
  const seedRef = { seed: INITIAL_SEED };
  return Array.from({ length: SITE_COUNT }, (_, siteIndex) => createSite(siteIndex, seedRef));
}

function clampMetric(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function jitter(value: number, amount: number, random: number): number {
  const delta = (random - 0.5) * amount;
  return value + delta;
}

function evolveComponent(component: ComponentNode, seedRef: { seed: number }, tick: number): ComponentNode {
  let seed = seedRef.seed;
  const a = seededRandom(seed);
  seed = a.nextSeed;
  const b = seededRandom(seed);
  seed = b.nextSeed;
  const c = seededRandom(seed);
  seed = c.nextSeed;

  const shouldEscalate = c.value > 0.992;
  const nextStatus: Status = shouldEscalate
    ? c.value > 0.998
      ? "critical"
      : "warning"
    : component.status === "critical" && c.value < 0.1
      ? "warning"
      : component.status === "warning" && c.value < 0.06
        ? "ok"
        : component.status;

  const predictedBase = jitter(component.metrics.predictedFailureScore, 8, a.value);

  seedRef.seed = seed;
  return {
    ...component,
    status: nextStatus,
    metrics: {
      vibration: Number(clampMetric(jitter(component.metrics.vibration, 0.4, a.value), 0.2, 9).toFixed(2)),
      errorRate: Number(clampMetric(jitter(component.metrics.errorRate, 0.35, b.value), 0, 5).toFixed(2)),
      latency: Number(clampMetric(jitter(component.metrics.latency, 2.6, c.value), 2, 60).toFixed(1)),
      predictedFailureScore: Number(clampMetric(predictedBase + (nextStatus !== "ok" ? 5 : -1), 0, 100).toFixed(1))
    },
    position: component.position.map((axis, idx) => {
      if (idx === 1) {
        return Number((axis + Math.sin((tick + idx) * 0.12) * 0.005).toFixed(3));
      }
      return axis;
    }) as [number, number, number]
  };
}

function evolveDevice(device: DeviceNode, seedRef: { seed: number }, tick: number): DeviceNode {
  const components = device.components.map((component) => evolveComponent(component, seedRef, tick));
  const status = aggregateStatus(components.map((component) => component.status));

  const utilization = clampMetric(
    components.reduce((acc, component) => acc + component.metrics.predictedFailureScore * 0.55, 0) / components.length,
    5,
    100
  );

  return {
    ...device,
    status,
    metrics: {
      isOn: status !== "offline",
      cycleRate: Number(clampMetric(jitter(device.metrics.cycleRate, 2.4, (tick % 12) / 12), 4, 100).toFixed(1)),
      temperature: Number(clampMetric(20 + utilization * 0.45, 15, 95).toFixed(1)),
      lastHeartbeat: isoNowWithOffset(Math.round((tick % 5) * 3)),
      utilization: Number(utilization.toFixed(1))
    },
    components
  };
}

function evolveSite(site: SiteNode, seedRef: { seed: number }, tick: number): SiteNode {
  const devices = site.devices.map((device) => evolveDevice(device, seedRef, tick));
  const status = aggregateStatus(devices.map((device) => device.status));
  const activeAlerts = devices.filter((device) => device.status !== "ok").length;
  const utilization = devices.reduce((acc, device) => acc + device.metrics.utilization, 0) / devices.length;

  return {
    ...site,
    status,
    metrics: {
      uptime: Number(clampMetric(jitter(site.metrics.uptime, 0.4, (tick % 10) / 10), 88, 100).toFixed(1)),
      totalDevices: devices.length,
      activeAlerts,
      utilization: Number(clampMetric(utilization, 0, 100).toFixed(1))
    },
    devices
  };
}

export function evolveSites(sites: SiteNode[], sim: SimulationState): { sites: SiteNode[]; sim: SimulationState } {
  const seedRef = { seed: sim.seed };
  const tick = sim.tick + 1;
  const nextSites = sites.map((site) => evolveSite(site, seedRef, tick));
  return {
    sites: nextSites,
    sim: {
      seed: seedRef.seed,
      tick
    }
  };
}

export function initialSimulationState(): SimulationState {
  return {
    seed: INITIAL_SEED,
    tick: 0
  };
}
