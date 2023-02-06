import { Card, Grid, Typography, ListItem, List } from "@material-ui/core";
import React, { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import DomainSenseUserTable from "./DomainSenseUserTable";
import { DomainSenseUserCount, Project } from "api/models";
import { getDomainSenseUserCounts } from "backend";
import * as LocalStorage from "backend/localStorage";

interface DomainSenseUserStatisticsProps {
  currentProject?: Project;
  lang: string;
}

export default function DomainSenseUserStatistics(
  props: DomainSenseUserStatisticsProps
): ReactElement {
  const [domainSenseUserList, setDomainSenseUser] = useState<
    DomainSenseUserCount[]
  >([]);
  const { t } = useTranslation();

  useEffect(() => {
    const updateDomainSenseUserCount = async () => {
      const counts = await getDomainSenseUserStatistics(
        LocalStorage.getProjectId(),
        props.lang
      );
      if (counts != undefined) {
        return setDomainSenseUser(counts);
      }
    };
    updateDomainSenseUserCount();
  }, [props.lang]);

  async function getDomainSenseUserStatistics(
    projectId: string,
    lang?: string
  ): Promise<DomainSenseUserCount[] | undefined> {
    return await getDomainSenseUserCounts(projectId, lang);
  }

  function getDomainSenseUserList(domainSenseUser: DomainSenseUserCount[]) {
    return domainSenseUser.map((t) => (
      <ListItem style={{ minWidth: "600px" }} key={`${t.id}`}>
        <DomainSenseUserTable key={`${t.id}`} domainSenseUserCount={t!} />
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
          <List>{getDomainSenseUserList(domainSenseUserList)}</List>
        </Card>
      </Grid>
    </React.Fragment>
  );
}
