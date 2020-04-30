import * as React from "react";
import Typography from "@material-ui/core/Typography";
import { Link, ListItem, List, MenuItem, Select } from "@material-ui/core";

interface IStartPanelProps {
  onNewServer: any;
  onConnectServer: any;
  onShowMonitor: any;
  servers: string[];
  connectedServers: string[];
}

export default function StartPanel(props: IStartPanelProps) {
  const handleConnectChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    event.preventDefault();

    props.onConnectServer(event.target.value);
  };

  const handleMonitorChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    event.preventDefault();

    props.onShowMonitor(event.target.value);
  };

  return (
    <React.Fragment>
      <Typography variant="subtitle2" component="h3">
        <strong>Vamos começar?</strong>
      </Typography>
      <List>
        <ListItem>
          <Link
            href="#"
            onClick={() => {
              props.onNewServer();
            }}
          >
            Novo servidor...
          </Link>
        </ListItem>

        <ListItem disabled={props.servers.length === 0}>
          <Link href="#">
            Conectar ao servidor
            <Select value="" onChange={handleConnectChange} >
              {props.servers.map((option) => (
                <MenuItem value={option}>{option}</MenuItem>
              ))}
            </Select>
          </Link>
        </ListItem>

        <ListItem disabled={props.connectedServers.length === 0}>
          <Link href="#" >
            Monitorar servidor
            <Select value="" onChange={handleMonitorChange} >
              {props.connectedServers.map((option) => (
                <MenuItem value={option}>{option}</MenuItem>
              ))}
            </Select>
          </Link>
        </ListItem>
      </List>
    </React.Fragment>
  );
}
