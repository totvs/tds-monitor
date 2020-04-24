import * as React from "react";
import * as ReactDOM from "react-dom";
import MonitorPanel from "./monitorPanel";

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    initialData: any;
  }
}

const vscode = window.acquireVsCodeApi();
const targetServer = window.initialData;

ReactDOM.render(
  <MonitorPanel vscode={vscode} targetServer={targetServer} />,
  document.getElementById("root")
);

