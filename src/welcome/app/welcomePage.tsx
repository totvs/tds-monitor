import * as React from "react";

import { makeStyles } from "@material-ui/core/styles";

import { Grid, Theme, createStyles, Typography } from "@material-ui/core";
import ErrorBoundary from "../../helper/errorBoundary";
import MonitorTheme from "../../helper/theme";
import SettingsPanel from "./settingsPanel";
import TextPanel from "./textPanel";
import { IWelcomePageAction, WelcomePageAction } from "../actions";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    control: {
      padding: theme.spacing(2),
    },
  })
);

interface IWelcomePageProps {
  vscode: any;
  showWelcomePage: boolean;
  serverJsonLocation: string;
  optionsLocation: any;
}

export default function WelcomePage(props: IWelcomePageProps) {
  const classes = useStyles();

  const doShowMonitor = () => {
    let command: IWelcomePageAction = {
      action: WelcomePageAction.ExecuteCommand,
      content: "tds-monitor.add-server-monitor",
    };

    props.vscode.postMessage(command);
  };

  const doNewServer = () => {
    let command: IWelcomePageAction = {
      action: WelcomePageAction.ExecuteCommand,
      content: "tds-monitor.create",
    };

    props.vscode.postMessage(command);
  };

  const doConnectServer = () => {
    let command: IWelcomePageAction = {
      action: WelcomePageAction.ExecuteCommand,
      content: "tds-monitor.show-connect-dialog",
    };

    props.vscode.postMessage(command);
  };

  return (
    <ErrorBoundary>
      <MonitorTheme>
        <Grid
          container
          className={classes.root}
          justify="center"
          xs={10}
          style={{ padding: 12 }}
        >
          <Grid item xs={8}>
            <Typography variant="h2" component="h2">
              TOTVS Monitor
            </Typography>
          </Grid>

          <Grid item xs={4}></Grid>

          <Grid item xs={12}>
            <Typography variant="body2">
              A extensão <strong>TOTVS Monitor</strong> permite monitorar o uso
              e a administração básica de servidores <strong>Protheus</strong>.
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <TextPanel
              onConnectServer={doConnectServer}
              onNewServer={doNewServer}
              onShowMonitor={doShowMonitor}
            />
          </Grid>
          <Grid item xs={6}>
            <SettingsPanel
              vscode={props.vscode}
              showWelcomePage={props.showWelcomePage}
              serverJsonLocation={props.serverJsonLocation}
              optionsLocation={props.optionsLocation}
            />
          </Grid>
        </Grid>
      </MonitorTheme>
    </ErrorBoundary>
  );
}
