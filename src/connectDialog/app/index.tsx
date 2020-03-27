import * as React from "react";
import * as ReactDOM from "react-dom";
import ConnectDialog from "./connectDialog";
import ErrorBoundary from "../../helper/errorBoundary";

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    initialData: any;
  }
}

//const vscode = window.acquireVsCodeApi();
//const serverItem = window.initialData as IMonitorItem;
//vscode={vscode} monitorItem={serverItem}
ReactDOM.render(
  <ErrorBoundary>
  <ConnectDialog />
  </ErrorBoundary>,
  document.getElementById("root")
);
