import { themeTokens } from "./theme-tokens.js";
import { alpha, createTheme } from "@mui/material/styles";

const colors = {
  navyPrimary: "#252DB8",
  navyDeep: "#0A0F3D",
  navySurface: "#202884",
  navyHeader: "#262FC2",
  navyAccent: "#2E35E8",
  lavenderText: "#E6E7FF",
  lavenderSoft: "rgba(230,231,255,0.88)",
  lavenderFaded: "rgba(230,231,255,0.58)",
  border: "rgba(120,147,255,0.42)",
  success: "#3DDC97",
  warning: "#FFD166",
  error: "#FF5A7A",
  white: "#FFFFFF",
  black: "#000000",
};

export const createEezEventTheme = (mode = "light") => {
const light = mode === "light";
return createTheme({
  palette: {
    mode,
    primary: {
      main: colors.navyAccent,
      dark: colors.navyPrimary,
      light: "#9AA8FF",
      contrastText: colors.white,
    },
    secondary: {
      main: light ? "#334db5" : colors.white,
      contrastText: light ? colors.white : colors.navyDeep,
    },
    background: {
      default: light ? "#f6f8fc" : colors.navyDeep,
      paper: light ? "#ffffff" : colors.navySurface,
    },
    text: {
      primary: light ? "#18243b" : colors.lavenderText,
      secondary: light ? "#526078" : colors.lavenderSoft,
    },
    success: { main: light ? "#168353" : colors.success },
    warning: { main: light ? "#946200" : colors.warning },
    error: { main: light ? "#c42b4b" : colors.error },
    divider: light ? "#dbe2ee" : colors.border,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Source Sans 3", system-ui, sans-serif',
    h1: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h3: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 600,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
      letterSpacing: "0.01em",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": { ...themeTokens[mode], colorScheme: mode },
        body: {
          backgroundColor: light ? "#f6f8fc" : colors.navyDeep,
          backgroundImage: light ? "none" : `
            radial-gradient(circle at top left, rgba(46,53,232,0.22), transparent 30%),
            radial-gradient(circle at 80% 10%, rgba(38,47,194,0.18), transparent 26%),
            linear-gradient(180deg, #1A2397 0%, #111861 14%, ${colors.navyDeep} 36%, #090D32 100%)
          `,
          backgroundAttachment: "fixed",
        },
        "#root": {
          minHeight: "100vh",
        },
        a: {
          color: "inherit",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 20,
          paddingBlock: 10,
          boxShadow: "none",
        },
        containedPrimary: {
          backgroundImage: "linear-gradient(180deg, #3740F4 0%, #2E35E8 100%)",
        },
        outlinedSecondary: {
          borderColor: light ? "#aebbd7" : "rgba(230,231,255,0.5)",
          color: light ? "#334db5" : colors.lavenderText,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          const color = theme.palette[ownerState.color];
          const filledColor = ownerState.color !== "default" &&
            ownerState.variant !== "outlined" && color?.main;
          return {
            borderRadius: 12,
            border: `1px solid ${filledColor || (light ? "#dbe2ee" : colors.border)}`,
            backgroundColor: filledColor || (light ? "#eef2fa" : alpha(colors.white, 0.09)),
            ...(filledColor && {
              color: color.contrastText,
              "& .MuiChip-icon, & .MuiChip-deleteIcon": { color: "inherit" },
              "&.MuiChip-clickable:hover": { backgroundColor: color.dark },
            }),
          };
        },
        label: {
          fontWeight: 700,
        },
      },
    },
  },
});
};

export const eezEventTheme = createEezEventTheme("dark");
