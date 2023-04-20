import { Grid, Typography } from "@mui/material";
import React, { ReactElement } from "react";

import { SemanticDomainTreeNode } from "api/models";

interface StatisticsProps {
  domain: SemanticDomainTreeNode;
  count: number;
}

export default function StatisticsTable(props: StatisticsProps): ReactElement {
  return (
    <React.Fragment>
      <Grid container wrap="nowrap" justifyContent="space-around">
        <Grid
          item
          xs={5}
          key={"id_" + props.domain.id}
          style={{
            borderBottomStyle: "dotted",
            borderBottomWidth: 1,
            position: "relative",
          }}
        >
          <Typography variant="body1">{props.domain.id}</Typography>
        </Grid>
        <Grid
          item
          xs={5}
          key={"domain_" + props.domain.id}
          style={{
            borderBottomStyle: "dotted",
            borderBottomWidth: 1,
            position: "relative",
          }}
        >
          <Typography variant="body1">{props.domain.name}</Typography>
        </Grid>
        <Grid
          item
          xs={5}
          key={"statistics_" + props.domain.id}
          style={{
            borderBottomStyle: "dotted",
            borderBottomWidth: 1,
            position: "relative",
          }}
        >
          <Typography variant="body1">{props.count}</Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
