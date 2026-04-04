import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0F172A", 
    },
    secondary: {
      main: "#F4A261", 
    },
    background: {
      default: "#ebebeb", 
      bg: "#fbfbfb", 
      paper: "#FFFFFF",
    },
    text: {
      primary: "#192235",
      secondary: "#6B7280",
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", sans-serif'
  },
});

export default theme;
