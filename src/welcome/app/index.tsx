import * as React from "react";
import * as ReactDOM from "react-dom";
import WelcomePage from "./welcomePage";

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    initialData: any;
  }
}

const vscode = window.acquireVsCodeApi();
const showWelcomePage = window.initialData.showWelcomePage;
const serverJsonLocation = window.initialData.serverJsonLocation;
const optionsLocation = window.initialData.optionsLocation;
const serverList = window.initialData.serverList;
const connectedList = window.initialData.connectedList;

ReactDOM.render(
  <WelcomePage  vscode={vscode} showWelcomePage={showWelcomePage}
   serverJsonLocation={serverJsonLocation}
   optionsLocation={optionsLocation}
   serverList={serverList}
   connectedServers={connectedList}
   />,
  document.getElementById("root")
);
