import { Grid, Typography, List } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import React, { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import CircularProgressWithLabel from "./CircularProgressBar";
import SemanticDomainStatistics from "./DomainStatistics/SemanticDomainStatistics";
import LinearProgressWithLabel from "./LinearProgressBar";
import DomainUserStatistics from "./UserStatistics/DomainUserStatistics";
import { Project } from "api/models";
import { getProject, getSemanticDomainCounts } from "backend";
import * as LocalStorage from "backend/localStorage";
import { defaultWritingSystem } from "types/writingSystem";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

enum viewEnum {
  User = "USER",
  Domain = "DOMAIN",
  DataStatistics = "STATISTIC",
}

export default function Statistics(): ReactElement {
  const { t } = useTranslation();
  const classes = useStyles();
  const [currentProject, setCurrentProject] = useState<Project>();
  const [lang, setLang] = useState<string>(defaultWritingSystem.bcp47);
  const [viewName, setViewName] = useState<string>(viewEnum.User);
  const [progressRatio, setProgressRatio] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const updateCurrentProject = async () => {
      await getProject(LocalStorage.getProjectId()).then(setCurrentProject);
    };

    const updateProgress = async () => {
      const statisticsList = await getSemanticDomainCounts(
        LocalStorage.getProjectId(),
        lang
      );
      var temp = 0;
      statisticsList?.forEach((element) => {
        if (element.count > 0) {
          temp++;
        }
      });
      setTotalCount(temp);
      statisticsList
        ? setProgressRatio(Math.ceil((temp * 100) / statisticsList!.length))
        : null;
    };

    updateCurrentProject();
    updateProgress();
  }, [lang]);

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
        </Typography>
      </Grid>,
      viewName === viewEnum.User && (
        <Grid item key={viewEnum.User + "DomainUserStatistics"}>
          <List>
            <DomainUserStatistics currentProject={currentProject} lang={lang} />
          </List>
        </Grid>
      ),
      viewName === viewEnum.Domain && (
        <Grid item key={viewEnum.Domain + "SemanticDomainStatistics"}>
          <List>
            <SemanticDomainStatistics
              currentProject={currentProject}
              lang={lang}
            />
          </List>
        </Grid>
      ),
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
      </List>
    );
  }

  function handleStatisticGoal() {
    return (
      <List className={classes.root}>
        <ListItem>
          <ListItemText primary={t("statistics.ratioGoal")} />
          <CircularProgressWithLabel value={progressRatio} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary={t("statistics.ratioGoal")} />
          <LinearProgressWithLabel value={progressRatio} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary={t("statistics.totalGoal")} />
          <Typography>{totalCount}</Typography>
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
