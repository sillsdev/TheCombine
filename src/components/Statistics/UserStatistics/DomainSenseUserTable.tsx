import { Grid, Typography } from "@material-ui/core";
import React, { ReactElement } from "react";

import { DomainSenseUserCount } from "api/models";

interface StatisticsProps {
  domainSenseUserCount: DomainSenseUserCount;
}

export default function StatisticsTable(props: StatisticsProps): ReactElement {
  return (
    <React.Fragment>
      <Grid container wrap="nowrap" justifyContent="space-around">
        <Grid
          item
          xs={5}
          key={"id_" + props.domainSenseUserCount.id}
          style={{
            borderBottomStyle: "dotted",
            borderBottomWidth: 1,
            position: "relative",
          }}
        >
          <Typography variant="body1">
            {props.domainSenseUserCount.username}
          </Typography>
        </Grid>
        <Grid
          item
          xs={5}
          key={"domain_" + props.domainSenseUserCount.id}
          style={{
            borderBottomStyle: "dotted",
            borderBottomWidth: 1,
            position: "relative",
          }}
        >
          <Typography variant="body1">
            {props.domainSenseUserCount.domainCount}
          </Typography>
        </Grid>
        <Grid
          item
          xs={5}
          key={"statistics_" + props.domainSenseUserCount.id}
          style={{
            borderBottomStyle: "dotted",
            borderBottomWidth: 1,
            position: "relative",
          }}
        >
          <Typography variant="body1">
            {props.domainSenseUserCount.senseCount}
          </Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
