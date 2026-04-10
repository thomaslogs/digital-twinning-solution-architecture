"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { Box, Breadcrumbs, Button, Link, Typography } from "@mui/material";
import { getSelectedComponent, getSelectedDevice, getSelectedSite } from "@/lib/twinSelectors";
import type { SiteNode, TwinSelection } from "@/types/twin";

interface BreadcrumbNavProps {
  sites: SiteNode[];
  selection: TwinSelection;
  onBack: () => void;
  onGoSites: () => void;
  onGoSite: (siteId: string) => void;
  onGoDevice: (siteId: string, deviceId: string) => void;
}

export default function BreadcrumbNav({
  sites,
  selection,
  onBack,
  onGoSites,
  onGoSite,
  onGoDevice
}: BreadcrumbNavProps) {
  const site = getSelectedSite(sites, selection);
  const device = getSelectedDevice(sites, selection);
  const component = getSelectedComponent(sites, selection);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        px: { xs: 1.25, md: 2 },
        py: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        minWidth: 0
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1, overflowX: "auto", scrollbarWidth: "thin" }}>
        <Breadcrumbs
          separator={<NavigateNextRoundedIcon fontSize="small" />}
          sx={{
            color: "text.secondary",
            minWidth: "max-content",
            "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" }
          }}
        >
          <Link
            component="button"
            underline="hover"
            color={selection.level === "sites" ? "text.primary" : "inherit"}
            onClick={onGoSites}
            sx={{ whiteSpace: "nowrap" }}
          >
            All Sites
          </Link>

          {site && (
            <Link
              component="button"
              underline="hover"
              color={selection.level === "site" ? "text.primary" : "inherit"}
              onClick={() => onGoSite(site.id)}
              sx={{ whiteSpace: "nowrap" }}
            >
              {site.name}
            </Link>
          )}

          {device && (
            <Link
              component="button"
              underline="hover"
              color={selection.level === "device" ? "text.primary" : "inherit"}
              onClick={() => onGoDevice(site!.id, device.id)}
              sx={{ whiteSpace: "nowrap" }}
            >
              {device.name}
            </Link>
          )}

          {component && (
            <Typography color="text.primary" sx={{ whiteSpace: "nowrap" }}>
              {component.name}
            </Typography>
          )}
        </Breadcrumbs>
      </Box>

      <Button
        onClick={onBack}
        startIcon={<ArrowBackRoundedIcon />}
        size="small"
        disabled={selection.level === "sites"}
        sx={{ flexShrink: 0 }}
      >
        Back
      </Button>
    </Box>
  );
}
