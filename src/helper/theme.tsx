import * as React from "react";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

//TODO: Ocorre erro de loader
//import 'typeface-roboto';
//https://material-ui.com/pt/customization/default-theme/

let appTheme = createMuiTheme({
  props: {
    MuiTextField: { variant: "filled", margin: "normal" },
    MuiToolbar: { variant: "dense" }
  },
});

interface IMonitorThemeProps {
  children: any;
}

export default function MonitorTheme(props: IMonitorThemeProps) {
  return <ThemeProvider theme={appTheme}>{props.children}</ThemeProvider>;
}
