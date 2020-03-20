import * as React from "react";

import { makeStyles } from "@material-ui/core/styles";

import {
  Paper,
  Grid,
  Theme,
  createStyles,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  GridSpacing,
  Typography,
  Divider
} from "@material-ui/core";
import ErrorBoundary from "../../helper/errorBoundary";
import MonitorTheme from "../../helper/theme";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    paper: {
      height: 300
    },
    control: {
      padding: theme.spacing(2)
    }
  })
);

interface IWelcomePageProps {
  vscode: any;
  showWelcomePage: boolean;
}

export default function WelcomePage(props: IWelcomePageProps) {
  const [spacing, setSpacing] = React.useState<GridSpacing>(2);
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpacing(Number((event.target as HTMLInputElement).value) as GridSpacing);
  };

  return (
    <React.Fragment>
      <ErrorBoundary>
        <MonitorTheme>
          <Typography variant="subtitle1" component="h2">
            TDS Monitor
          </Typography>
          <Divider />
          <Grid container className={classes.root} spacing={2}>
            <Grid item xs={12}>
              <Grid container justify="center" spacing={spacing}>
                {[0, 1].map(value => (
                  <Grid key={value} item xs={6}>
                    <Paper className={classes.paper}>
                      <Typography># {value}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.control}>
                <Grid container>
                  <Grid item>
                    <FormLabel>spacing</FormLabel>
                    <RadioGroup
                      name="spacing"
                      aria-label="spacing"
                      value={spacing.toString()}
                      onChange={handleChange}
                      row
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                        <FormControlLabel
                          key={value}
                          value={value.toString()}
                          control={<Radio />}
                          label={value.toString()}
                        />
                      ))}
                    </RadioGroup>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </MonitorTheme>
      </ErrorBoundary>
    </React.Fragment>
  );
}
