import { matchesFilter } from "@/lib/status";
import type {
  ComponentNode,
  DeviceNode,
  SiteNode,
  StatusFilter,
  TwinSelection
} from "@/types/twin";

export interface AlertRow {
  id: string;
  level: "site" | "device" | "component";
  status: string;
  label: string;
}

export function getSelectedSite(sites: SiteNode[], selection: TwinSelection): SiteNode | undefined {
  if (!selection.siteId) return undefined;
  return sites.find((site) => site.id === selection.siteId);
}

export function getSelectedDevice(sites: SiteNode[], selection: TwinSelection): DeviceNode | undefined {
  const site = getSelectedSite(sites, selection);
  if (!site || !selection.deviceId) return undefined;
  return site.devices.find((device) => device.id === selection.deviceId);
}

export function getSelectedComponent(sites: SiteNode[], selection: TwinSelection): ComponentNode | undefined {
  const device = getSelectedDevice(sites, selection);
  if (!device || !selection.componentId) return undefined;
  return device.components.find((component) => component.id === selection.componentId);
}

export function getFilteredSites(sites: SiteNode[], filter: StatusFilter): SiteNode[] {
  if (filter === "all") return sites;
  return sites.filter((site) => {
    if (matchesFilter(site.status, filter)) return true;
    return site.devices.some((device) => {
      if (matchesFilter(device.status, filter)) return true;
      return device.components.some((component) => matchesFilter(component.status, filter));
    });
  });
}

export function gatherAlerts(sites: SiteNode[], filter: StatusFilter): AlertRow[] {
  const alerts: AlertRow[] = [];
  for (const site of sites) {
    if (site.status !== "ok" && matchesFilter(site.status, filter)) {
      alerts.push({
        id: site.id,
        level: "site",
        status: site.status,
        label: `${site.name} status ${site.status}`
      });
    }
    for (const device of site.devices) {
      if (device.status !== "ok" && matchesFilter(device.status, filter)) {
        alerts.push({
          id: device.id,
          level: "device",
          status: device.status,
          label: `${device.name} in ${site.name} is ${device.status}`
        });
      }
      for (const component of device.components) {
        if (component.status !== "ok" && matchesFilter(component.status, filter)) {
          alerts.push({
            id: component.id,
            level: "component",
            status: component.status,
            label: `${component.name} in ${device.name} is ${component.status}`
          });
        }
      }
    }
  }

  return alerts.slice(0, 8);
}
