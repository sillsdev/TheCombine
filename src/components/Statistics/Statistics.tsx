import {
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import CircularProgressWithLabel from "./ProgressBar/CircularProgressBar";
import SemanticDomainStatistics from "./DomainStatistics/SemanticDomainStatistics";
import LinearProgressWithLabel from "./ProgressBar/LinearProgressBar";
import DomainUserStatistics from "./UserStatistics/DomainUserStatistics";
import { Project } from "api/models";
import {
  getFrontierWords,
  getProject,
  getSemanticDomainCounts,
  GetSemanticDomainTimestampCounts,
} from "backend";
import * as LocalStorage from "backend/localStorage";
import { defaultWritingSystem } from "types/writingSystem";
import PerDayStatisticView from "./Chart/PerDayStatisticView";
import ChartComponent, { chartTypeEnum } from "./Chart/ChartComponent";

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
  const [progressRatio, setProgressRatio] = useState<number>(0);
  const [totalDomainCount, setTotalDomainCount] = useState<number>(0);
  const [totalWordCount, setTotalWordCount] = useState<number>(0);

  useEffect(() => {
    const updateCurrentProject = async () => {
      await getProject(LocalStorage.getProjectId()).then(setCurrentProject);
    };

    const updateProgress = async () => {
      const statisticsList = await getSemanticDomainCounts(
        LocalStorage.getProjectId(),
        lang
      );
      var domainCount = 0;
      var wordCount = 0;
      statisticsList?.forEach((element) => {
        if (element.count > 0) {
          domainCount++;
          wordCount += element.count;
        }
      });
      setTotalDomainCount(domainCount);
      setTotalWordCount(wordCount);
      statisticsList
        ? setProgressRatio(
            Math.ceil((domainCount * 100) / statisticsList!.length)
          )
        : null;
    };

    updateCurrentProject();
    updateProgress();
  }, [lang]);

  console.log(GetSemanticDomainTimestampCounts(LocalStorage.getProjectId()));
  console.log(getFrontierWords());

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
            chartType={chartTypeEnum.BarChart}
          />
        </Grid>,
        <Grid item key={viewEnum.Time + "PerDayStatisticView"}>
          <PerDayStatisticView />
        </Grid>,
      ],
    ];
  }

  function handleButton() {
    return (
      <List className={classes.root}>
        <ListItem
          button
          onClick={() => setViewName(viewEnum.User)}
          selected={viewName === viewEnum.User}
        >
          <ListItemText primary={t("statistics.userView")} />
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={() => setViewName(viewEnum.Domain)}
          selected={viewName === viewEnum.Domain}
        >
          <ListItemText primary={t("statistics.domainView")} />
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={() => setViewName(viewEnum.Time)}
          selected={viewName === viewEnum.Time}
        >
          <ListItemText primary={"Words per Day"} />
        </ListItem>
      </List>
    );
  }

  function handleStatisticGoal() {
    return (
      <List className={classes.root}>
        <ListItem>
          <ListItemText primary={t("statistics.domainProgress")} />
          <CircularProgressWithLabel value={progressRatio} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary={t("statistics.domainProgress")} />
          <LinearProgressWithLabel value={progressRatio} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary={t("statistics.domainsCollected")} />
          <Typography>{totalDomainCount}</Typography>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary={t("statistics.wordsCollected")} />
          <Typography>{totalWordCount}</Typography>
        </ListItem>
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
          {handleStatisticGoal()}
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
