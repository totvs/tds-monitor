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

ReactDOM.render(
  <WelcomePage  vscode={vscode} showWelcomePage={showWelcomePage}/>,
  document.getElementById("root")
);
