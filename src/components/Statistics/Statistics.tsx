import { Card, Grid, Typography, ListItem, List } from "@material-ui/core";
import React, { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import StatisticsTable from "./StatisticsTable";
import { Project, SemanticDomainCount } from "api/models";
import { getProject, getSemanticDomainCounts } from "backend";
import * as LocalStorage from "backend/localStorage";
import { defaultWritingSystem } from "types/writingSystem";

export default function Statistics(): ReactElement {
  const [currentProject, setCurrentProject] = useState<Project>();
  const [lang, setLang] = useState<string>(defaultWritingSystem.bcp47);
  const [statisticsList, setStatisticsList] = useState<SemanticDomainCount[]>(
    []
  );
  const { t } = useTranslation();

  useEffect(() => {
    const updateCurrentProject = async () => {
      await getProject(LocalStorage.getProjectId()).then(setCurrentProject);
    };

    const updateStatisticList = async () => {
      const counts = await getStatisticsCounts(
        LocalStorage.getProjectId(),
        lang
      );
      if (counts != undefined) {
        return setStatisticsList(counts);
      }
    };

    updateCurrentProject();
    updateStatisticList();
  }, [lang]);

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
            <Typography variant="h5" align="center">
              {t("statistics.dataStatistics") + currentProject?.name}
            </Typography>
          </List>
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
