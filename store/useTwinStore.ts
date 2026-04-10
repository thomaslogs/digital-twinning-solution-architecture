"use client";

import { create } from "zustand";
import { createInitialSites, evolveSites, initialSimulationState, type SimulationState } from "@/lib/mockData";
import { matchesFilter } from "@/lib/status";
import type { SearchOption, SiteNode, StatusFilter, TwinSelection } from "@/types/twin";

interface TwinStore {
  sites: SiteNode[];
  selection: TwinSelection;
  statusFilter: StatusFilter;
  searchQuery: string;
  lastUpdated: string;
  simulation: SimulationState;
  showMiniMap: boolean;
  focusToken: number;
  setStatusFilter: (filter: StatusFilter) => void;
  setSearchQuery: (query: string) => void;
  toggleMiniMap: () => void;
  requestRefocus: () => void;
  selectSitesLevel: () => void;
  selectSite: (siteId: string) => void;
  selectDevice: (siteId: string, deviceId: string) => void;
  selectComponent: (siteId: string, deviceId: string, componentId: string) => void;
  selectFromSearch: (option: SearchOption) => void;
  back: () => void;
  tickMetrics: () => void;
}

const initialSites = createInitialSites();

export const useTwinStore = create<TwinStore>((set, get) => ({
  sites: initialSites,
  selection: { level: "sites" },
  statusFilter: "all",
  searchQuery: "",
  lastUpdated: "",
  simulation: initialSimulationState(),
  showMiniMap: true,
  focusToken: 0,
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleMiniMap: () => set((state) => ({ showMiniMap: !state.showMiniMap })),
  requestRefocus: () => set((state) => ({ focusToken: state.focusToken + 1 })),
  selectSitesLevel: () => set({ selection: { level: "sites" } }),
  selectSite: (siteId) => set({ selection: { level: "site", siteId } }),
  selectDevice: (siteId, deviceId) => set({ selection: { level: "device", siteId, deviceId } }),
  selectComponent: (siteId, deviceId, componentId) =>
    set({
      selection: {
        level: "component",
        siteId,
        deviceId,
        componentId
      }
    }),
  selectFromSearch: (option) => {
    if (option.type === "site") {
      set({ selection: { level: "site", siteId: option.siteId } });
      return;
    }
    if (option.type === "device" && option.deviceId) {
      set({ selection: { level: "device", siteId: option.siteId, deviceId: option.deviceId } });
      return;
    }
    if (option.type === "component" && option.deviceId && option.componentId) {
      set({
        selection: {
          level: "component",
          siteId: option.siteId,
          deviceId: option.deviceId,
          componentId: option.componentId
        }
      });
    }
  },
  back: () => {
    const { selection } = get();
    if (selection.level === "component") {
      set({
        selection: {
          level: "device",
          siteId: selection.siteId,
          deviceId: selection.deviceId
        }
      });
      return;
    }
    if (selection.level === "device") {
      set({
        selection: {
          level: "site",
          siteId: selection.siteId
        }
      });
      return;
    }
    if (selection.level === "site") {
      set({ selection: { level: "sites" } });
    }
  },
  tickMetrics: () => {
    const current = get();
    const evolved = evolveSites(current.sites, current.simulation);

    const existingSite = evolved.sites.find((site) => site.id === current.selection.siteId);
    const existingDevice = existingSite?.devices.find((device) => device.id === current.selection.deviceId);
    const existingComponent = existingDevice?.components.find((component) => component.id === current.selection.componentId);

    let nextSelection = current.selection;
    if (current.selection.level !== "sites" && !existingSite) {
      nextSelection = { level: "sites" };
    } else if (current.selection.level === "device" && !existingDevice) {
      nextSelection = { level: "site", siteId: current.selection.siteId };
    } else if (current.selection.level === "component" && !existingComponent) {
      nextSelection = {
        level: "device",
        siteId: current.selection.siteId,
        deviceId: current.selection.deviceId
      };
    }

    const adjustedSites = evolved.sites.map((site) => ({
      ...site,
      devices: site.devices.map((device) => ({
        ...device,
        components: device.components
      }))
    }));

    if (current.statusFilter !== "all") {
      const hasAny = adjustedSites.some((site) => {
        if (matchesFilter(site.status, current.statusFilter)) return true;
        return site.devices.some((device) => {
          if (matchesFilter(device.status, current.statusFilter)) return true;
          return device.components.some((component) => matchesFilter(component.status, current.statusFilter));
        });
      });

      if (!hasAny) {
        nextSelection = { level: "sites" };
      }
    }

    set({
      sites: adjustedSites,
      simulation: evolved.sim,
      selection: nextSelection,
      lastUpdated: new Date().toISOString()
    });
  }
}));

export function buildSearchOptions(sites: SiteNode[], statusFilter: StatusFilter): SearchOption[] {
  const options: SearchOption[] = [];

  for (const site of sites) {
    if (matchesFilter(site.status, statusFilter)) {
      options.push({
        id: site.id,
        label: `${site.name} (Site)`,
        type: "site",
        status: site.status,
        siteId: site.id
      });
    }

    for (const device of site.devices) {
      if (matchesFilter(device.status, statusFilter)) {
        options.push({
          id: device.id,
          label: `${device.name} (${site.name})`,
          type: "device",
          status: device.status,
          siteId: site.id,
          deviceId: device.id
        });
      }

      for (const component of device.components) {
        if (matchesFilter(component.status, statusFilter)) {
          options.push({
            id: component.id,
            label: `${component.name} (${device.name})`,
            type: "component",
            status: component.status,
            siteId: site.id,
            deviceId: device.id,
            componentId: component.id
          });
        }
      }
    }
  }

  return options;
}
