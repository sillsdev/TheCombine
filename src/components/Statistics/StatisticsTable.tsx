import { Grid, Typography } from "@material-ui/core";
import React, { ReactElement } from "react";

import { SemanticDomainTreeNode } from "api/models";

interface StatisticsProps {
  domain: SemanticDomainTreeNode;
  statistics: number;
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
          <Typography variant="body1">{props.statistics}</Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
