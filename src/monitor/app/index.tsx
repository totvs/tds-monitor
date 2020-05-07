import * as React from "react";
import * as ReactDOM from "react-dom";
import { IMonitorItem } from "../../monitorInterfaces";
import MonitorPanel from "./monitorPanel";

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    initialData: any;
  }
}

const vscode = window.acquireVsCodeApi();
const serverItems = window.initialData.serverList as IMonitorItem[];
const speed = window.initialData.speed;

ReactDOM.render(
  <MonitorPanel vscode={vscode} targetServer={serverItems} speed={speed}/>,
  document.getElementById("root")
);
