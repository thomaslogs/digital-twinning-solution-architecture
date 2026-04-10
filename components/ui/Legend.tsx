"use client";

import { Box, Paper, Typography } from "@mui/material";
import { ORANGE, PETROL } from "@/lib/theme";

export default function Legend() {
  return (
    <Paper
      sx={{
        position: "absolute",
        left: { xs: 8, md: 16 },
        bottom: { xs: "calc(68px + env(safe-area-inset-bottom))", md: 16 },
        px: { xs: 1, md: 1.5 },
        py: { xs: 0.8, md: 1 },
        maxWidth: { xs: 190, md: 260 },
        borderRadius: 1,
        bgcolor: "rgba(18, 24, 29, 0.9)",
        backdropFilter: "blur(3px)",
        zIndex: 2
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.6 }}>
        Legend
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.5 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: PETROL }} />
        <Typography variant="caption">Selected / Active (✓)</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: ORANGE }} />
        <Typography variant="caption">Warning / Critical (! / !! / ×)</Typography>
      </Box>
    </Paper>
  );
}
