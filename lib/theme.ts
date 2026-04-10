import { createTheme } from "@mui/material/styles";

export const PETROL = "#009999";
export const ORANGE = "#EC6602";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: PETROL
    },
    warning: {
      main: ORANGE
    },
    background: {
      default: "#0b0f12",
      paper: "#12181d"
    },
    text: {
      primary: "#e8edf1",
      secondary: "#a5b1bb"
    },
    divider: "#2a353e"
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: "Inter, Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h5: {
      fontWeight: 600,
      letterSpacing: 0.2
    },
    subtitle1: {
      color: "#a5b1bb"
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #2a353e"
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#12181d",
          borderBottom: "1px solid #2a353e"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none"
        }
      }
    }
  }
});

export default theme;
