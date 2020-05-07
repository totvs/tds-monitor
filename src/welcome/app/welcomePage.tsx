import * as React from "react";

import { makeStyles } from "@material-ui/core/styles";

import {
  Grid,
  Theme,
  createStyles,
  Typography,
  Container,
} from "@material-ui/core";
import ErrorBoundary from "../../helper/errorBoundary";
import MonitorTheme from "../../helper/theme";
import SettingsPanel from "./settingsPanel";
import StartPanel from "./startPanel";
import { IWelcomePageAction, WelcomePageAction } from "../actions";
import InfoPanel from "./infoPanel";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      justify: "center",
      padding: theme.spacing(2),
    },
    control: {
      padding: theme.spacing(2),
    },
    logo: {
      backgroundPositionX: 0,
      backgroundPositionY: 6,
      display: "block",
      backgroundRepeat: "no-repeat",
      backgroundImage:
        "url('data:image/png;base64,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')",
    },
  })
);

interface IWelcomePageProps {
  vscode: any;
  showWelcomePage: boolean;
  serverJsonLocation: string;
  optionsLocation: any;
  serverList: string[];
}

export default function WelcomePage(props: IWelcomePageProps) {
  const classes = useStyles();

  const doNewServer = () => {
    let command: IWelcomePageAction = {
      action: WelcomePageAction.ExecuteCommand,
      content: "tds-monitor.create",
    };

    props.vscode.postMessage(command);
  };

  const doConnectServer = (arg: any) => {
    let command: IWelcomePageAction = {
      action: WelcomePageAction.ExecuteCommand,
      content: "tds-monitor.show-connect-dialog",
      arg: arg,
    };

    props.vscode.postMessage(command);
  };

  return (
    <ErrorBoundary>
      <MonitorTheme>
        <Container maxWidth="md">
          <Grid container xs={12}>
            <Grid item xs={2}></Grid>

            <Grid container xs={8}>
              <Grid item xs={1} className={classes.logo}></Grid>

              <Grid item xs={11}>
                <Typography variant="h2" component="h2">
                  TOTVS Monitor
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2">
                  A extensão <strong>TOTVS Monitor</strong> permite monitorar o
                  uso e a administração básica de servidores{" "}
                  <strong>Protheus</strong>.
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <StartPanel
                  onConnectServer={doConnectServer}
                  onNewServer={doNewServer}
                  servers={props.serverList}
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

              <Grid item xs={12}>
                <InfoPanel />
              </Grid>

            </Grid>

            <Grid item xs={2}></Grid>
          </Grid>
        </Container>
      </MonitorTheme>
    </ErrorBoundary>
  );
}