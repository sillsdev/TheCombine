import React from "react";
import {
  Paper,
  Typography,
  Container,
  TextField,
  Grid
} from "@material-ui/core";
import { ReactReduxContext } from "react-redux";
import theme from "../../types/theme";
import { LocalizeContextProps } from "react-localize-redux";

interface AddWordsProps {
  domain: string;
}

interface AddWordsState {}

export default class AddWords extends React.Component<
  AddWordsProps & LocalizeContextProps,
  AddWordsState
> {
  render() {
    let rows = [];
    for (let i = 0; i < 60; i++) {
      rows.push(
        <React.Fragment>
          <Grid
            item
            xs={6}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2)
            }}
          >
            <TextField fullWidth />
          </Grid>
        </React.Fragment>
      );
    }

    return (
      <Container>
        <Paper style={{ padding: theme.spacing(2) }}>
          <Typography
            variant="h4"
            align="center"
            style={{ marginBottom: theme.spacing(2) }}
          >
            Domain: Sky
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="h5" align="center">
                Vernacular
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5" align="center">
                Gloss
              </Typography>
            </Grid>
            {rows}
          </Grid>
        </Paper>
      </Container>
    );
  }
}
