"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress, Typography } from "@mui/material";
import SceneErrorBoundary from "@/components/scene/SceneErrorBoundary";

const TwinScene = dynamic(() => import("@/components/scene/TwinScene"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        color: "text.secondary"
      }}
    >
      <CircularProgress size={20} color="primary" />
      <Typography variant="caption">Loading 3D viewport...</Typography>
    </Box>
  )
});

export default function SceneViewport() {
  return (
    <SceneErrorBoundary>
      <TwinScene />
    </SceneErrorBoundary>
  );
}
