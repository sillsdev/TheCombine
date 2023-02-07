import { Grid, Typography } from "@material-ui/core";
import React, { ReactElement } from "react";

import { SemanticDomainUserCount } from "api/models";

interface StatisticsProps {
  semanticDomainUserCount: SemanticDomainUserCount;
}

export default function StatisticsTable(props: StatisticsProps): ReactElement {
  return (
    <React.Fragment>
      <Grid container wrap="nowrap" justifyContent="space-around">
        <Grid
          item
          xs={5}
          key={"id_" + props.semanticDomainUserCount.id}
          style={{
            borderBottomStyle: "dotted",
            borderBottomWidth: 1,
            position: "relative",
          }}
        >
          <Typography variant="body1">
            {props.semanticDomainUserCount.username}
          </Typography>
        </Grid>
        <Grid
          item
          xs={5}
          key={"domain_" + props.semanticDomainUserCount.id}
          style={{
            borderBottomStyle: "dotted",
            borderBottomWidth: 1,
            position: "relative",
          }}
        >
          <Typography variant="body1">
            {props.semanticDomainUserCount.domainCount}
          </Typography>
        </Grid>
        <Grid
          item
          xs={5}
          key={"statistics_" + props.semanticDomainUserCount.id}
          style={{
            borderBottomStyle: "dotted",
            borderBottomWidth: 1,
            position: "relative",
          }}
        >
          <Typography variant="body1">
            {props.semanticDomainUserCount.wordCount}
          </Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
