import { Card, Grid, Typography, ListItem, List } from "@mui/material";
import React, { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { SemanticDomainCount } from "api/models";
import { getSemanticDomainCounts } from "backend";
import * as LocalStorage from "backend/localStorage";
import StatisticsTable from "components/Statistics/DomainStatistics/SemanticDomainStatisticsTable";

interface SemanticDomainStatisticsProps {
  lang: string;
}

export default function SemanticDomainStatistics(
  props: SemanticDomainStatisticsProps
): ReactElement {
  const [statisticsList, setStatisticsList] = useState<SemanticDomainCount[]>(
    []
  );
  const { t } = useTranslation();

  useEffect(() => {
    const updateStatisticList = async () => {
      const counts = await getStatisticsCounts(
        LocalStorage.getProjectId(),
        props.lang
      );
      if (counts != undefined) {
        return setStatisticsList(counts);
      }
    };
    updateStatisticList();
  }, [props.lang]);

  async function getStatisticsCounts(
    projectId: string,
    lang?: string
  ): Promise<SemanticDomainCount[] | undefined> {
    return await getSemanticDomainCounts(projectId, lang);
  }

  function getStatisticsList(statisticsList: SemanticDomainCount[]) {
    return statisticsList.map((t) => (
      <ListItem
        style={{ minWidth: "600px" }}
        key={`${t.semanticDomainTreeNode.id}`}
      >
        <StatisticsTable
          key={`${t.semanticDomainTreeNode.id}`}
          domain={t.semanticDomainTreeNode!}
          count={t.count!}
        />
      </ListItem>
    ));
  }

  return (
    <React.Fragment>
      <Grid container justifyContent="center">
        <Card style={{ width: 600 }}>
          <List>
            <Grid container wrap="nowrap" justifyContent="space-around">
              <Grid
                item
                xs={5}
                style={{
                  borderBottomStyle: "dotted",
                  borderBottomWidth: 1,
                  position: "relative",
                }}
              >
                <Typography variant="subtitle1">
                  {t("statistics.domainNumber")}
                </Typography>
              </Grid>
              <Grid
                item
                xs={5}
                style={{
                  borderBottomStyle: "dotted",
                  borderBottomWidth: 1,
                  position: "relative",
                }}
              >
                <Typography variant="subtitle1">
                  {t("statistics.domainName")}
                </Typography>
              </Grid>
              <Grid
                item
                xs={5}
                style={{
                  borderBottomStyle: "dotted",
                  borderBottomWidth: 1,
                  position: "relative",
                }}
              >
                <Typography variant="subtitle1">
                  {t("statistics.countSenses")}
                </Typography>
              </Grid>
            </Grid>
          </List>
          <List>{getStatisticsList(statisticsList)}</List>
        </Card>
      </Grid>
    </React.Fragment>
  );
}
