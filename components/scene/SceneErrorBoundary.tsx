"use client";

import * as React from "react";
import { Alert, Box, Button, Typography } from "@mui/material";

interface SceneErrorBoundaryState {
  hasError: boolean;
}

export default class SceneErrorBoundary extends React.Component<React.PropsWithChildren, SceneErrorBoundaryState> {
  state: SceneErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2
          }}
        >
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={this.handleReset}>
                Retry
              </Button>
            }
          >
            <Typography variant="body2">Unable to render 3D scene.</Typography>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}
