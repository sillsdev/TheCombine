import { Grid, Typography, List, ListSubheader } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import React, { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import SemanticDomainStatistics from "./DomainStatistics/SemanticDomainStatistics";
import DomainUserStatistics from "./UserStatistics/DomainUserStatistics";
import { Project } from "api/models";
import { getProject } from "backend";
import * as LocalStorage from "backend/localStorage";
import { defaultWritingSystem } from "types/writingSystem";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function Statistics(): ReactElement {
  const { t } = useTranslation();
  const classes = useStyles();
  const [currentProject, setCurrentProject] = useState<Project>();
  const [lang, setLang] = useState<string>(defaultWritingSystem.bcp47);
  const [shown, setShown] = useState<string>(t("statistics.userView"));

  useEffect(() => {
    const updateCurrentProject = async () => {
      await getProject(LocalStorage.getProjectId()).then(setCurrentProject);
    };

    updateCurrentProject();
  }, [lang]);

  function handleDisplay(viewName: string) {
    return [
      <Grid item key={t("statistics.dataStatistics") + currentProject?.name}>
        <Typography variant="h5" align="center">
          {t("statistics.dataStatistics") + currentProject?.name}
        </Typography>
      </Grid>,
      <Grid item key={"key" + viewName}>
        <Typography variant="h5" align="center">
          {viewName}
        </Typography>
      </Grid>,
      (function () {
        switch (viewName) {
          case t("statistics.userView"):
            return (
              <Grid
                item
                key={t("statistics.userView") + "DomainUserStatistics"}
              >
                <List>
                  <DomainUserStatistics
                    currentProject={currentProject}
                    lang={lang}
                  />
                </List>
              </Grid>
            );
          case t("statistics.domainView"):
            return (
              <Grid
                item
                key={t("statistics.domainView") + "SemanticDomainStatistics"}
              >
                <List>
                  <SemanticDomainStatistics
                    currentProject={currentProject}
                    lang={lang}
                  />
                </List>
              </Grid>
            );
          default:
            null;
        }
      })(),
    ];
  }

  return (
    <React.Fragment>
      <Grid container direction="row" spacing={1}>
        <Grid item xs={2}>
          <List
            subheader={
              <ListSubheader component="div" id="Optional Views">
                Optional Views
              </ListSubheader>
            }
            className={classes.root}
          >
            <ListItem button onClick={() => setShown(t("statistics.userView"))}>
              <ListItemText primary={t("statistics.userView")} />
            </ListItem>
            <Divider />
            <ListItem
              button
              onClick={() => setShown(t("statistics.domainView"))}
            >
              <ListItemText primary={t("statistics.domainView")} />
            </ListItem>
          </List>
        </Grid>

        <Grid
          item
          xs={8}
          container
          direction="column"
          justifyContent="center"
          spacing={2}
        >
          {handleDisplay(shown)}
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
