import { Button, Grid, Typography } from "@material-ui/core";
import { Translate } from "react-localize-redux";

import history, { openUserGuide, Path } from "browserHistory";
import theme from "types/theme";

export default function LandingButtons() {
  return (
    <Grid
      container
      justify="space-around"
      alignItems="center"
      style={{ height: "100%", width: "100%" }}
    >
      <LandingButton
        onClick={() => history.push(Path.Register)}
        textId="login.register"
      />
      <LandingButton
        onClick={() => history.push(Path.Login)}
        textId="login.login"
      />
      <LandingButton onClick={openUserGuide} textId="userMenu.userGuide" />
    </Grid>
  );
}

interface LandingButtonProps {
  onClick: () => void;
  textId: string;
}
function LandingButton(props: LandingButtonProps) {
  return (
    <Grid
      item
      sm={12}
      style={{ textAlign: "center", paddingBottom: theme.spacing(1) }}
    >
      <Button variant="contained" color="primary" onClick={props.onClick}>
        <Typography variant="subtitle1">
          <Translate id={props.textId} />
        </Typography>
      </Button>
    </Grid>
  );
}
