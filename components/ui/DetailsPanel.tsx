"use client";

import { useEffect, useState } from "react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { statusLabel } from "@/lib/status";
import { gatherAlerts, getSelectedComponent, getSelectedDevice, getSelectedSite } from "@/lib/twinSelectors";
import { useTwinStore } from "@/store/useTwinStore";
import type { Status } from "@/types/twin";

interface MetricRow {
  label: string;
  value: string;
}

interface ChartRow {
  label: string;
  value: number;
}

interface DetailsPanelProps {
  open: boolean;
  onToggle: () => void;
}

function MetricList({ rows }: { rows: MetricRow[] }) {
  return (
    <Stack spacing={1}>
      {rows.map((row) => (
        <Box key={row.label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            {row.label}
          </Typography>
          <Typography variant="body2">{row.value}</Typography>
        </Box>
      ))}
    </Stack>
  );
}

function MetricChart({ rows }: { rows: ChartRow[] }) {
  return (
    <Stack spacing={1.2}>
      {rows.map((row) => (
        <Box key={row.label}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {row.label}
            </Typography>
            <Typography variant="caption">{row.value.toFixed(1)}%</Typography>
          </Box>
          <Box sx={{ height: 8, bgcolor: "#1a232a", borderRadius: 2, overflow: "hidden" }}>
            <Box
              sx={{
                height: "100%",
                width: `${Math.min(100, Math.max(0, row.value))}%`,
                bgcolor: "primary.main",
                transition: "width 0.5s ease"
              }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

export default function DetailsPanel({ open, onToggle }: DetailsPanelProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const sites = useTwinStore((state) => state.sites);
  const selection = useTwinStore((state) => state.selection);
  const statusFilter = useTwinStore((state) => state.statusFilter);
  const lastUpdated = useTwinStore((state) => state.lastUpdated);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const selectedSite = getSelectedSite(sites, selection);
  const selectedDevice = getSelectedDevice(sites, selection);
  const selectedComponent = getSelectedComponent(sites, selection);
  const alerts = gatherAlerts(sites, statusFilter);

  let title = "Fleet Overview";
  let status: Status = "ok";
  let metrics: MetricRow[] = [];
  let chartData: ChartRow[] = [];
  const lastUpdatedLabel =
    isHydrated && lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "--:--:--";

  if (selectedComponent) {
    title = selectedComponent.name;
    status = selectedComponent.status;
    metrics = [
      { label: "Vibration", value: `${selectedComponent.metrics.vibration.toFixed(2)} mm/s` },
      { label: "Error Rate", value: `${selectedComponent.metrics.errorRate.toFixed(2)}%` },
      { label: "Latency", value: `${selectedComponent.metrics.latency.toFixed(1)} ms` },
      { label: "Predicted Failure", value: `${selectedComponent.metrics.predictedFailureScore.toFixed(1)}%` }
    ];
    chartData = [
      { label: "Predicted Failure", value: selectedComponent.metrics.predictedFailureScore },
      { label: "Error Rate x20", value: selectedComponent.metrics.errorRate * 20 },
      { label: "Latency x2", value: selectedComponent.metrics.latency * 2 }
    ];
  } else if (selectedDevice) {
    title = selectedDevice.name;
    status = selectedDevice.status;
    metrics = [
      { label: "Power", value: selectedDevice.metrics.isOn ? "On" : "Off" },
      { label: "Cycle Rate", value: `${selectedDevice.metrics.cycleRate.toFixed(1)} cyc/min` },
      { label: "Temperature", value: `${selectedDevice.metrics.temperature.toFixed(1)} C` },
      { label: "Utilization", value: `${selectedDevice.metrics.utilization.toFixed(1)}%` },
      { label: "Last Heartbeat", value: new Date(selectedDevice.metrics.lastHeartbeat).toLocaleTimeString() }
    ];
    chartData = [
      { label: "Utilization", value: selectedDevice.metrics.utilization },
      { label: "Temperature", value: selectedDevice.metrics.temperature },
      { label: "Cycle Rate", value: selectedDevice.metrics.cycleRate }
    ];
  } else if (selectedSite) {
    title = selectedSite.name;
    status = selectedSite.status;
    metrics = [
      { label: "Uptime", value: `${selectedSite.metrics.uptime.toFixed(1)}%` },
      { label: "Total Devices", value: String(selectedSite.metrics.totalDevices) },
      { label: "Active Alerts", value: String(selectedSite.metrics.activeAlerts) },
      { label: "Utilization", value: `${selectedSite.metrics.utilization.toFixed(1)}%` }
    ];
    chartData = selectedSite.devices.slice(0, 5).map((device) => ({
      label: device.name,
      value: device.metrics.utilization
    }));
  } else {
    const deviceCount = sites.reduce((acc, site) => acc + site.devices.length, 0);
    const componentCount = sites.reduce(
      (acc, site) => acc + site.devices.reduce((sum, device) => sum + device.components.length, 0),
      0
    );
    const avgUtilization =
      sites.reduce((acc, site) => acc + site.metrics.utilization, 0) / (sites.length || 1);

    metrics = [
      { label: "Sites", value: String(sites.length) },
      { label: "Devices", value: String(deviceCount) },
      { label: "Components", value: String(componentCount) },
      { label: "Active Alerts", value: String(alerts.length) },
      { label: "Avg Utilization", value: `${avgUtilization.toFixed(1)}%` }
    ];
    chartData = sites.map((site) => ({ label: site.name, value: site.metrics.utilization }));
  }

  return (
    <Box
      sx={{
        height: { xs: open ? "45vh" : 56, md: "100%" },
        maxHeight: { xs: "58vh", md: "100%" },
        minHeight: { xs: open ? 230 : 56, md: "100%" },
        width: { xs: "100%", md: open ? 360 : 52 },
        transition: "width 0.24s ease, height 0.24s ease",
        borderLeft: { xs: 0, md: "1px solid" },
        borderTop: { xs: "1px solid", md: 0 },
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
        position: { xs: "absolute", md: "relative" },
        left: { xs: 0, md: "auto" },
        right: { xs: 0, md: "auto" },
        bottom: { xs: 0, md: "auto" },
        zIndex: { xs: 40, md: "auto" },
        flexShrink: 0,
        boxShadow: { xs: "0 -8px 24px rgba(0, 0, 0, 0.28)", md: "none" }
      }}
    >
      <IconButton
        size="small"
        onClick={onToggle}
        sx={{ position: "absolute", top: 10, right: 8, zIndex: 2, border: "1px solid", borderColor: "divider" }}
      >
        {open ? (
          isDesktop ? (
            <ChevronRightRoundedIcon fontSize="small" />
          ) : (
            <KeyboardArrowDownRoundedIcon fontSize="small" />
          )
        ) : isDesktop ? (
          <ChevronLeftRoundedIcon fontSize="small" />
        ) : (
          <KeyboardArrowUpRoundedIcon fontSize="small" />
        )}
      </IconButton>

      {open ? (
        <Box
          sx={{
            p: { xs: 1.5, md: 2 },
            pt: { xs: 5, md: 5 },
            pb: { xs: "calc(12px + env(safe-area-inset-bottom))", md: 2 },
            height: "100%",
            overflowY: "auto"
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.8 }}>
            Details
          </Typography>
          <Paper sx={{ p: 1.5, mb: 1.5 }}>
            <Typography variant="h6" sx={{ mb: 0.8, fontSize: "1.05rem" }}>
              {title}
            </Typography>
            <Chip
              size="small"
              label={statusLabel(status)}
              color={status === "ok" ? "primary" : "warning"}
              sx={{ mb: 1.2 }}
            />
            <MetricList rows={metrics} />
          </Paper>

          <Paper sx={{ p: 1.5, mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Utilization Snapshot
            </Typography>
            <MetricChart rows={chartData.slice(0, 6)} />
          </Paper>

          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.8 }}>
              <WarningAmberRoundedIcon fontSize="small" color="warning" />
              Alerts
            </Typography>
            {alerts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No active alerts for current filter.
              </Typography>
            ) : (
              <Stack spacing={0.6}>
                {alerts.map((alert) => (
                  <Box key={alert.id}>
                    <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                      {alert.label}
                    </Typography>
                    <Divider sx={{ mt: 0.5 }} />
                  </Box>
                ))}
              </Stack>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.2 }}>
              Last updated {lastUpdatedLabel}
            </Typography>
          </Paper>
        </Box>
      ) : (
        <Box sx={{ p: 1.2, pt: 2.3, pb: { xs: "calc(8px + env(safe-area-inset-bottom))", md: 1.2 } }}>
          <Typography variant="caption" color="text.secondary">
            Panel
          </Typography>
        </Box>
      )}
    </Box>
  );
}
