import { Grid, Typography, List, Button } from "@material-ui/core";
import React, { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import SemanticDomainStatistics from "./DomainStatistics/SemanticDomainStatistics";
import DomainUserStatistics from "./UserStatistics/DomainUserStatistics";
import { Project } from "api/models";
import { getProject } from "backend";
import * as LocalStorage from "backend/localStorage";
import { defaultWritingSystem } from "types/writingSystem";

export default function Statistics(): ReactElement {
  const [currentProject, setCurrentProject] = useState<Project>();
  const [lang, setLang] = useState<string>(defaultWritingSystem.bcp47);
  const [userView, setUserView] = useState<boolean>(true);
  const { t } = useTranslation();

  useEffect(() => {
    const updateCurrentProject = async () => {
      await getProject(LocalStorage.getProjectId()).then(setCurrentProject);
    };

    updateCurrentProject();
  }, [lang]);

  return (
    <React.Fragment>
      <Grid container direction="row" spacing={1}>
        <Grid item xs={2}>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setUserView(!userView);
            }}
            id={`statistic-button`}
          >
            <Typography variant="h4">
              {userView ? t("statistics.domainView") : t("statistics.userView")}
            </Typography>
          </Button>
        </Grid>

        <Grid
          item
          xs={8}
          container
          direction="column"
          justifyContent="center"
          spacing={2}
        >
          <Grid item>
            <Typography variant="h5" align="center">
              {t("statistics.dataStatistics") + currentProject?.name}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h5" align="center">
              {userView ? t("statistics.userView") : t("statistics.domainView")}
            </Typography>
          </Grid>
          <Grid item>
            {userView && (
              <List>
                <DomainUserStatistics
                  currentProject={currentProject}
                  lang={lang}
                />
              </List>
            )}
          </Grid>
          <Grid item>
            {!userView && (
              <List>
                <SemanticDomainStatistics
                  currentProject={currentProject}
                  lang={lang}
                />
              </List>
            )}
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
