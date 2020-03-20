import * as React from "react";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
//import { useMediaQuery } from "@material-ui/core";
import { indigo, lightBlue, red } from "@material-ui/core/colors";

//https://material-ui.com/pt/customization/default-theme/?expand-path=$.palette

let darkTheme = createMuiTheme({
  overrides: {
    MuiDivider: {

	},
	MuiPaper: {
	}
  },
  palette: {
    //  type: "dark",
    primary: indigo,
    secondary: lightBlue
  },
  typography: {
    subtitle1: {
      color: red[500]
    }
  }
});

let lightTheme = createMuiTheme({
  palette: {
    //   type: "light",
    primary: lightBlue
  }
});

interface IMonitorThemeProps {
  children: any;
}
export default function MonitorTheme(props: IMonitorThemeProps) {
  const prefersDarkMode = true; //useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      {props.children}
    </ThemeProvider>
  );
}
