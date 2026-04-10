"use client";

import { Box, Paper, Tooltip, Typography } from "@mui/material";
import { statusColor, statusSymbol } from "@/lib/status";
import type { SiteNode, TwinSelection } from "@/types/twin";

interface MiniMapProps {
  sites: SiteNode[];
  selection: TwinSelection;
  onSelectSite: (siteId: string) => void;
}

function normalize(
  x: number,
  z: number,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number
): { left: number; top: number } {
  const width = maxX - minX || 1;
  const depth = maxZ - minZ || 1;

  return {
    left: ((x - minX) / width) * 100,
    top: ((z - minZ) / depth) * 100
  };
}

export default function MiniMap({ sites, selection, onSelectSite }: MiniMapProps) {
  const xs = sites.map((site) => site.position[0]);
  const zs = sites.map((site) => site.position[2]);

  const minX = Math.min(...xs, -1);
  const maxX = Math.max(...xs, 1);
  const minZ = Math.min(...zs, -1);
  const maxZ = Math.max(...zs, 1);

  return (
    <Paper
      sx={{
        position: "absolute",
        right: { xs: 8, md: 16 },
        top: { xs: 18, md: 16 },
        p: { xs: 0.8, md: 1 },
        width: { xs: 146, sm: 168, md: 190 },
        borderRadius: 1,
        bgcolor: "rgba(18, 24, 29, 0.88)",
        backdropFilter: "blur(3px)",
        zIndex: 2
      }}
      aria-label="Site minimap"
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.6 }}>
        Minimap
      </Typography>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "1",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          background:
            "linear-gradient(0deg, rgba(19,27,33,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(19,27,33,0.7) 1px, transparent 1px)",
          backgroundSize: "18px 18px"
        }}
      >
        {sites.map((site) => {
          const { left, top } = normalize(site.position[0], site.position[2], minX, maxX, minZ, maxZ);
          const selected = site.id === selection.siteId;
          const shape = site.status === "ok" ? "50%" : site.status === "warning" ? "4px" : "1px";

          return (
            <Tooltip title={`${site.name} (${statusSymbol(site.status)})`} key={site.id}>
              <button
                type="button"
                onClick={() => onSelectSite(site.id)}
                aria-label={`Focus ${site.name} site`}
                style={{
                  position: "absolute",
                  left: `calc(${left}% - 8px)`,
                  top: `calc(${top}% - 8px)`,
                  width: 16,
                  height: 16,
                  borderRadius: shape,
                  border: selected ? "2px solid #e8edf1" : "1px solid rgba(232,237,241,0.6)",
                  background: statusColor(site.status),
                  color: "#051318",
                  fontSize: 9,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: selected ? "0 0 0 3px rgba(0, 153, 153, 0.2)" : "none"
                }}
              >
                {statusSymbol(site.status)}
              </button>
            </Tooltip>
          );
        })}
      </Box>
    </Paper>
  );
}
