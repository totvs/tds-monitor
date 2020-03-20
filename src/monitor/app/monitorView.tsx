import React from "react";
import { MonitorViewAction } from "../actions";
import MonitorPanel from "./monitorPanel";
import ErrorBoundary from "../../helper/errorBoundary";


let listener = undefined;

interface IMonitorView {
  vscode: any;
}

export default function MonitorView(props: IMonitorView) {
  const [targetServer, setTargetServer] = React.useState();
  const [titles, setTitles] = React.useState<string[]>([]);

  if (listener === undefined) {
    listener = (event: MessageEvent) => {
      const message = event.data; // The JSON data our extension sent

      switch (message.command) {
        case MonitorViewAction.ToggleServer: {
          setTargetServer(message.current);
          setTitles([
            message.server.name,
            message.server.address + ":" + message.server.port
          ]);

          break;
        }
      }
    };

    window.addEventListener("message", listener);
  }

  return (
    <React.Fragment>
      <ErrorBoundary>
        <MonitorPanel
          targetServer={targetServer}
          vscode={props.vscode}
          titles={titles}
        />
      </ErrorBoundary>
    </React.Fragment>
  );
}
