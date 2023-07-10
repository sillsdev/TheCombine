import { Grid, Typography } from "@mui/material";
import { ReactElement, ReactNode, useState } from "react";

import theme from "types/theme";

interface BaseSettingsProps {
  title: ReactNode;
  icon: ReactNode;
  body: ReactNode;
}

export default function BaseSettingsComponent(
  props: BaseSettingsProps
): ReactElement {
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = (): void => {
    setIsVisible((previous) => !previous);
  };

  return (
    <Grid item container xs={12} spacing={2} style={{ flexWrap: "nowrap" }}>
      <Grid
        item
        style={{ marginTop: 4, color: "grey" }}
        onClick={toggleVisibility}
      >
        {props.icon}
      </Grid>
      <Grid item>
        <Typography
          variant="h6"
          style={{ marginBottom: isVisible ? theme.spacing(2) : 0 }}
          onClick={() => toggleVisibility()}
        >
          {props.title}
        </Typography>
        {isVisible && props.body}
      </Grid>
    </Grid>
  );
}
