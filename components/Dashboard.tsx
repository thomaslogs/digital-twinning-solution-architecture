"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Paper, useMediaQuery, useTheme } from "@mui/material";
import SceneViewport from "@/components/scene/SceneViewport";
import BreadcrumbNav from "@/components/ui/BreadcrumbNav";
import DetailsPanel from "@/components/ui/DetailsPanel";
import HeaderBar from "@/components/ui/HeaderBar";
import Legend from "@/components/ui/Legend";
import MiniMap from "@/components/ui/MiniMap";
import OrientationControls from "@/components/ui/OrientationControls";
import { getSelectedDevice, getSelectedSite } from "@/lib/twinSelectors";
import { buildSearchOptions, useTwinStore } from "@/store/useTwinStore";
import type { SearchOption } from "@/types/twin";

export default function Dashboard() {
  const [panelOpen, setPanelOpen] = useState(true);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const sites = useTwinStore((state) => state.sites);
  const selection = useTwinStore((state) => state.selection);
  const statusFilter = useTwinStore((state) => state.statusFilter);
  const searchQuery = useTwinStore((state) => state.searchQuery);

  const setStatusFilter = useTwinStore((state) => state.setStatusFilter);
  const setSearchQuery = useTwinStore((state) => state.setSearchQuery);
  const selectFromSearch = useTwinStore((state) => state.selectFromSearch);
  const selectSitesLevel = useTwinStore((state) => state.selectSitesLevel);
  const selectSite = useTwinStore((state) => state.selectSite);
  const selectDevice = useTwinStore((state) => state.selectDevice);
  const selectComponent = useTwinStore((state) => state.selectComponent);
  const back = useTwinStore((state) => state.back);
  const requestRefocus = useTwinStore((state) => state.requestRefocus);
  const toggleMiniMap = useTwinStore((state) => state.toggleMiniMap);
  const showMiniMap = useTwinStore((state) => state.showMiniMap);
  const tickMetrics = useTwinStore((state) => state.tickMetrics);

  useEffect(() => {
    const timer = window.setInterval(() => {
      tickMetrics();
    }, 2400);

    return () => window.clearInterval(timer);
  }, [tickMetrics]);

  useEffect(() => {
    setPanelOpen(isDesktop);
  }, [isDesktop]);

  const searchOptions = useMemo(() => buildSearchOptions(sites, statusFilter), [sites, statusFilter]);

  const handleSearchSelect = (option: SearchOption | null) => {
    if (!option) {
      return;
    }
    selectFromSearch(option);
  };

  useEffect(() => {
    const isTextInput = (target: EventTarget | null): boolean => {
      const element = target as HTMLElement | null;
      if (!element) return false;
      const tag = element.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        element.isContentEditable
      );
    };

    const pickCircular = <T extends { id: string }>(items: T[], currentId: string | undefined, direction: 1 | -1): T | undefined => {
      if (items.length === 0) return undefined;
      const currentIndex = currentId ? items.findIndex((item) => item.id === currentId) : -1;
      const from = currentIndex < 0 ? 0 : currentIndex;
      const nextIndex = (from + direction + items.length) % items.length;
      return items[nextIndex];
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isTextInput(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();

      if (event.key === "Escape") {
        back();
        event.preventDefault();
        return;
      }

      if (key === "r") {
        requestRefocus();
        event.preventDefault();
        return;
      }

      if (key === "m") {
        toggleMiniMap();
        event.preventDefault();
        return;
      }

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      const direction: 1 | -1 = event.key === "ArrowRight" ? 1 : -1;

      if (selection.level === "sites") {
        const nextSite = pickCircular(sites, selection.siteId, direction);
        if (nextSite) {
          selectSite(nextSite.id);
        }
        event.preventDefault();
        return;
      }

      const selectedSite = getSelectedSite(sites, selection);
      if (!selectedSite) {
        return;
      }

      if (selection.level === "site" || selection.level === "device") {
        const nextDevice = pickCircular(selectedSite.devices, selection.deviceId, direction);
        if (nextDevice) {
          selectDevice(selectedSite.id, nextDevice.id);
        }
        event.preventDefault();
        return;
      }

      const selectedDevice = getSelectedDevice(sites, selection);
      if (selection.level === "component" && selectedDevice) {
        const nextComponent = pickCircular(selectedDevice.components, selection.componentId, direction);
        if (nextComponent) {
          selectComponent(selectedSite.id, selectedDevice.id, nextComponent.id);
        }
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    back,
    requestRefocus,
    selection,
    selectComponent,
    selectDevice,
    selectSite,
    sites,
    toggleMiniMap
  ]);

  return (
    <Box
      sx={{
        height: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default"
      }}
    >
      <HeaderBar
        options={searchOptions}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchQueryChange={setSearchQuery}
        onSearchSelect={handleSearchSelect}
        onStatusFilterChange={setStatusFilter}
      />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          minHeight: 0,
          overflow: "hidden",
          position: "relative"
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            borderRight: { md: "1px solid" },
            borderBottom: { xs: "1px solid", md: 0 },
            borderColor: "divider"
          }}
        >
          <Paper sx={{ borderRadius: 0, border: 0, borderBottom: "1px solid", borderColor: "divider" }}>
            <BreadcrumbNav
              sites={sites}
              selection={selection}
              onBack={back}
              onGoSites={selectSitesLevel}
              onGoSite={(siteId) => selectSite(siteId)}
              onGoDevice={(siteId, deviceId) => selectDevice(siteId, deviceId)}
            />
          </Paper>

          <Box sx={{ position: "relative", flex: 1, minHeight: { xs: 260, sm: 320, md: 0 } }}>
            <SceneViewport />
            <Legend />
            {showMiniMap && (
              <MiniMap
                sites={sites}
                selection={selection}
                onSelectSite={(siteId) => {
                  selectSite(siteId);
                  requestRefocus();
                }}
              />
            )}
            <OrientationControls
              showMiniMap={showMiniMap}
              onResetView={requestRefocus}
              onToggleMiniMap={toggleMiniMap}
            />
            <Box component="p" className="sr-only">
              Keyboard shortcuts: Escape goes back, R resets camera view, M toggles minimap,
              and left or right arrow keys cycle entities at the current level.
            </Box>
          </Box>
        </Box>

        <DetailsPanel open={panelOpen} onToggle={() => setPanelOpen((prev) => !prev)} />
      </Box>
    </Box>
  );
}
