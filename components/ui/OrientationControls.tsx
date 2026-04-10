"use client";

import CenterFocusStrongRoundedIcon from "@mui/icons-material/CenterFocusStrongRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";

interface OrientationControlsProps {
  showMiniMap: boolean;
  onResetView: () => void;
  onToggleMiniMap: () => void;
}

export default function OrientationControls({
  showMiniMap,
  onResetView,
  onToggleMiniMap
}: OrientationControlsProps) {
  return (
    <Paper
      sx={{
        position: "absolute",
        right: { xs: 8, md: 16 },
        bottom: { xs: "calc(68px + env(safe-area-inset-bottom))", md: 16 },
        px: { xs: 0.7, md: 1 },
        py: { xs: 0.6, md: 0.8 },
        borderRadius: 1,
        bgcolor: "rgba(18, 24, 29, 0.9)",
        backdropFilter: "blur(3px)",
        zIndex: 2
      }}
      aria-label="Orientation controls"
    >
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Reset view (R)">
          <IconButton aria-label="Reset camera view" size="small" onClick={onResetView}>
            <CenterFocusStrongRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Toggle minimap (M)">
          <IconButton
            aria-label="Toggle minimap"
            size="small"
            color={showMiniMap ? "primary" : "default"}
            onClick={onToggleMiniMap}
          >
            <MapRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          R reset | M map
        </Typography>
      </Box>
    </Paper>
  );
}
