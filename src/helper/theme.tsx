import * as React from "react";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";

//TODO: Ocorre erro de loader
//import 'typeface-roboto';
//https://material-ui.com/pt/customization/default-theme/

interface IMonitorThemeProps {
  children: any;
}

export default function MonitorTheme(props: IMonitorThemeProps) {
  const darkMode = false; //useMediaQuery("(prefers-color-scheme: dark)");

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: darkMode ? "dark" : "light",
        },
        overrides: {
          MuiPaper: {
            root: {
              backgroundColor: "#FDFDFD",
              padding: 12,
            },
            outlined: {
              borderLeftStyle: "solid",
              borderLeftWidth: 5,
              borderLeftColor: "#EA9B3E",
            },
          },
          MuiDialog: {
            paper: {
              backgroundColor: "#FDFDFD",
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {props.children}
    </ThemeProvider>
  );
}

