import * as React from "react";

import { makeStyles } from "@material-ui/core/styles";

import {
  Grid,
  Theme,
  createStyles,
  Typography
} from "@material-ui/core";
import ErrorBoundary from "../../helper/errorBoundary";
import MonitorTheme from "../../helper/theme";
import SettingsPanel from "./settingsPanel";
import TextPanel from "./textPanel";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    control: {
      padding: theme.spacing(2)
    }
  })
);

interface IWelcomePageProps {
  vscode: any;
  showWelcomePage: boolean;
  serverJsonLocation: string;
}

export default function WelcomePage(props: IWelcomePageProps) {
  const classes = useStyles();
  console.log("******.4");

  return (
    <React.Fragment>
      <ErrorBoundary>
        <MonitorTheme>
          <Typography variant="subtitle1" component="h2">
            TDS Monitor
          </Typography>

          <Typography variant="body2">
            A extensão <strong>TOTVS Developer Studio Monitor </strong> (
            <i>TDS Monitor</i>) permite monitorar o uso e a administração básica
            de servidores <strong>Potheus</strong>.
          </Typography>

          <Grid container className={classes.root} justify="center" >
            <Grid item xs={6}>
              <TextPanel />
            </Grid>
            <Grid item xs={6}>
              <SettingsPanel
                vscode={props.vscode}
                showWelcomePage={props.showWelcomePage}
                serverJsonLocation={props.serverJsonLocation}
              />
            </Grid>
          </Grid>
        </MonitorTheme>
      </ErrorBoundary>
    </React.Fragment>
  );
}
