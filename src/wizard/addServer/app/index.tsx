import * as React from "react";
import * as ReactDOM from "react-dom";

import "./index.css";
import CreateServer from "./addServerWizard";
import { WizardAction } from "../../action";

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    initialData: any;
  }
}

const vscode = window.acquireVsCodeApi();

ReactDOM.render(
  <CreateServer vscode={vscode} initialData={window.initialData} />,
  document.getElementById("root")
);

// Handle messages sent from the extension to the webview
window.addEventListener("message", event => {
  const message = event.data; // The json data that the extension sent
  switch (message.command) {
    case WizardAction.UpdateWizard:
      vscode.setState( { config: event.data });
      break;
  }
});
