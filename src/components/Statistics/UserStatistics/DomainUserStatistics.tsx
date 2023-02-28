import { Card, Grid, Typography, ListItem, List } from "@mui/material";
import React, { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import DomainSenseUserTable from "./DomainUserTable";
import { SemanticDomainUserCount, Project } from "api/models";
import { getSemanticDomainUserCount, getFrontierWords } from "backend";
import * as LocalStorage from "backend/localStorage";

interface DomainSenseUserStatisticsProps {
  currentProject?: Project;
  lang: string;
}

export default function DomainSenseUserStatistics(
  props: DomainSenseUserStatisticsProps
): ReactElement {
  const [domainUserCountList, setDomainUserCountList] = useState<
    SemanticDomainUserCount[]
  >([]);
  const { t } = useTranslation();

  useEffect(() => {
    const updateSemanticDomainUserCounts = async () => {
      const counts = await getUserStatistics(
        LocalStorage.getProjectId(),
        props.lang
      );
      if (counts != undefined) {
        return setDomainUserCountList(counts);
      }
    };
    updateSemanticDomainUserCounts();
  }, [props.lang]);

  async function getUserStatistics(
    projectId: string,
    lang?: string
  ): Promise<SemanticDomainUserCount[] | undefined> {
    return await getSemanticDomainUserCount(projectId, lang);
  }

  function getDomainSenseUserList(
    semanticDomainUserCount: SemanticDomainUserCount[]
  ) {
    return semanticDomainUserCount.map((t) => (
      <ListItem style={{ minWidth: "600px" }} key={`${t.id}`}>
        <DomainSenseUserTable key={`${t.id}`} semanticDomainUserCount={t!} />
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
                  {t("statistics.userName")}
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
                  {t("statistics.domainCount")}
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
                  {t("statistics.senseCount")}
                </Typography>
              </Grid>
            </Grid>
          </List>
          <List>{getDomainSenseUserList(domainUserCountList)}</List>
        </Card>
      </Grid>
    </React.Fragment>
  );
}
