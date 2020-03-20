import React from "react";

import Wizard from "./wizard";
import ErrorBoundary from "../../../helper/errorBoundary";
import { IMonitorItem } from '../../../monitorInterfaces';

interface IConfigProps {
  vscode: any;
  initialData: IMonitorItem;
}

export interface IConfigState {
  config: IMonitorItem;
}

export let myVscode: any;

export default class CreateServer extends React.Component<
  IConfigProps,
  IConfigState
> {
  constructor(props: any) {
    super(props);

    myVscode = props.vscode; //TODO: rever código. QB

    let oldState = this.props.vscode.getState();
    if (oldState) {
      this.state = oldState;
    } else {
      let initialData = this.props.initialData;
      this.state = { config: initialData };
      this.props.vscode.setState(this.state);
    }
  }

  render() {
    return (
      <React.Fragment>
        <ErrorBoundary>
          <Wizard props={this.state.config}/>
        </ErrorBoundary>
      </React.Fragment>
    );
  }
}
