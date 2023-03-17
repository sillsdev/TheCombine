import {
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import ChartComponent, { ChartTypeEnum } from "./Chart/ChartComponent";
import SemanticDomainStatistics from "./DomainStatistics/SemanticDomainStatistics";
import ProgressBarComponent from "./ProgressBar/ProgressBarComponent";
import DomainUserStatistics from "./UserStatistics/DomainUserStatistics";
import { Project } from "api/models";
import { getProject } from "backend";
import * as LocalStorage from "backend/localStorage";
import { defaultWritingSystem } from "types/writingSystem";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    maxWidth: "auto",
    backgroundColor: theme.palette.background.paper,
  },
}));

enum viewEnum {
  User = "USER",
  Domain = "DOMAIN",
  Time = "Time",
  DataStatistics = "STATISTIC",
}

export default function Statistics(): ReactElement {
  const { t } = useTranslation();
  const classes = useStyles();
  const [currentProject, setCurrentProject] = useState<Project>();
  const [lang, setLang] = useState<string>(defaultWritingSystem.bcp47);
  const [viewName, setViewName] = useState<string>(viewEnum.User);

  useEffect(() => {
    const updateCurrentProject = async () => {
      await getProject(LocalStorage.getProjectId()).then(setCurrentProject);
    };
    updateCurrentProject();
  }, []);

  function handleDisplay() {
    return [
      <Grid item key={viewEnum.DataStatistics + currentProject?.name}>
        <Typography variant="h5" align="center">
          {t("statistics.dataStatistics") + currentProject?.name}
        </Typography>
      </Grid>,
      <Grid item key={"ProjectName" + viewName}>
        <Typography variant="h5" align="center">
          {viewName === viewEnum.User && t("statistics.userView")}
          {viewName === viewEnum.Domain && t("statistics.domainView")}
          {viewName === viewEnum.Time && ""}
        </Typography>
      </Grid>,
      viewName === viewEnum.User && (
        <Grid item key={viewEnum.User + "DomainUserStatistics"}>
          <List>
            <DomainUserStatistics lang={lang} />
          </List>
        </Grid>
      ),
      viewName === viewEnum.Domain && (
        <Grid item key={viewEnum.Domain + "SemanticDomainStatistics"}>
          <List>
            <SemanticDomainStatistics lang={lang} />
          </List>
        </Grid>
      ),
      viewName === viewEnum.Time && [
        <Grid item key={viewEnum.Time + "ChartComponent"}>
          <ChartComponent
            currentProjectId={currentProject!.id}
            chartType={ChartTypeEnum.LineChart}
          />
        </Grid>,
      ],
    ];
  }

  function handleButton() {
    return (
      <List className={classes.root}>
        <ListItemButton
          onClick={() => setViewName(viewEnum.User)}
          selected={viewName === viewEnum.User}
        >
          <ListItemText primary={t("statistics.userView")} />
        </ListItemButton>
        <Divider />
        <ListItemButton
          onClick={() => setViewName(viewEnum.Domain)}
          selected={viewName === viewEnum.Domain}
        >
          <ListItemText primary={t("statistics.domainView")} />
        </ListItemButton>
        <Divider />
        <ListItemButton
          onClick={() => setViewName(viewEnum.Time)}
          selected={viewName === viewEnum.Time}
        >
          <ListItemText primary={"Words per Day"} />
        </ListItemButton>
      </List>
    );
  }

  return (
    <React.Fragment>
      <Grid container direction="row" spacing={1}>
        <Grid item xs={2}>
          {handleButton()}
        </Grid>
        <Grid
          item
          xs={8}
          container
          direction="column"
          justifyContent="center"
          spacing={2}
        >
          {handleDisplay()}
        </Grid>
        <Grid item xs={2}>
          <ProgressBarComponent />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
