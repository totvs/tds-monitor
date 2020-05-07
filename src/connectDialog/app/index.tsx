import * as React from "react";
import * as ReactDOM from "react-dom";
import { IMonitorItem } from "../../monitorInterfaces";
import ConnectDialog from "./connectDialog";

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    initialData: any;
  }
}

const vscode = window.acquireVsCodeApi();
const serverItem = window.initialData as IMonitorItem;

ReactDOM.render(
  <ConnectDialog vscode={vscode} monitorItem={serverItem} />,
  document.getElementById("root")
);
