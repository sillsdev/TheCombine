import { Card, Grid, Typography, ListItem, List } from "@material-ui/core";
import React, { ReactElement, useState, useEffect } from "react";

import { Project, SemanticDomain, SemanticDomainTreeNode } from "api/models";
import {
  getAllProjects,
  getAllSemanticDomainTreeNode,
  getAllStatisticsPair,
  getAllWords,
  getProjectName,
} from "backend";
import * as LocalStorage from "backend/localStorage";
import theme from "types/theme";
import { defaultWritingSystem } from "types/writingSystem";

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
