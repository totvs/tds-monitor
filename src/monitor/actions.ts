export interface IMonitorViewAction {
  action: MonitorViewAction;
  content: any;
}

export enum MonitorViewAction {
  ToggleServer,
  SetSpeedUpdate,
  UpdateUsers,
  ToggleAGroup,
  LockServer,
  SendMessage,
  KillConnection,
  StopServer,
  ToggleWriteLogServer
}
