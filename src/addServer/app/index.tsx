import * as React from "react";
import * as ReactDOM from "react-dom";
import AddServerWizard from "./addServerWizard";
import { IMonitorItem } from "../../monitorInterfaces";

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    initialData: any;
  }
}

const vscode = window.acquireVsCodeApi();
const serverItem = window.initialData as IMonitorItem;

ReactDOM.render(
  <AddServerWizard  vscode={vscode} monitorItem={serverItem}/>,
  document.getElementById("root")
);
