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

ReactDOM.render(
  <WelcomePage  vscode={vscode} showWelcomePage={showWelcomePage}
   serverJsonLocation={serverJsonLocation}
   optionsLocation={optionsLocation}
   />,
  document.getElementById("root")
);
