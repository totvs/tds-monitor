export interface IMonitorPanelAction {
  action: MonitorPanelAction;
  content: any;
}

export enum MonitorPanelAction {
  _SetSpeedUpdate,
  UpdateUsers,
  ToggleAGroup,
  LockServer,
  SendMessage,
  KillConnection,
  StopServer,
  ToggleWriteLogServer
}
