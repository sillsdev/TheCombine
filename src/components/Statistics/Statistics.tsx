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
import { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Project } from "api/models";
import {
  getLineChartRootData,
  getProgressEstimationLineChartRoot,
  getProject,
} from "backend";
import LineChartComponent from "components/Statistics/Chart/LineChartComponent";
import SemanticDomainStatistics from "components/Statistics/DomainStatistics/SemanticDomainStatistics";
import ProgressBarComponent from "components/Statistics/ProgressBar/ProgressBarComponent";
import DomainUserStatistics from "components/Statistics/UserStatistics/DomainUserStatistics";
import { defaultWritingSystem } from "types/writingSystem";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    maxWidth: "auto",
    backgroundColor: theme.palette.background.paper,
  },
}));

// The strings should match the keys for statistics.view in translation.json
enum viewEnum {
  User = "user",
  Domain = "domain",
  Day = "day",
  Workshop = "workshop",
}

export default function Statistics(): ReactElement {
  const { t } = useTranslation();
  const classes = useStyles();
  const [currentProject, setCurrentProject] = useState<Project>();
  const [lang] = useState<string>(defaultWritingSystem.bcp47);
  const [viewName, setViewName] = useState<string>(viewEnum.User);

  useEffect(() => {
    getProject().then(setCurrentProject);
  }, []);

  function componentToDisplay(view: viewEnum) {
    switch (view) {
      case viewEnum.User:
        return <DomainUserStatistics lang={lang} />;
      case viewEnum.Domain:
        return <SemanticDomainStatistics lang={lang} />;
      case viewEnum.Day:
        return (
          <LineChartComponent
            fetchData={() => getLineChartRootData(currentProject!.id)}
          />
        );
      case viewEnum.Workshop:
        return (
          <LineChartComponent
            isFilterZero
            fetchData={() =>
              getProgressEstimationLineChartRoot(currentProject!.id)
            }
          />
        );
      default:
        return <div />;
    }
  }

  function handleDisplay() {
    return [
      <Grid item key={"statistics-title"}>
        <Typography variant="h4" align="center">
          {t("statistics.title", { val: currentProject?.name })}
        </Typography>
      </Grid>,
      <Grid item key={"statistics-subtitle"}>
        <Typography variant="h5" align="center">
          {t(`statistics.view.${viewName}`)}
        </Typography>
      </Grid>,
      <Grid item key={"statistics-view"}>
        {componentToDisplay(viewName as viewEnum)}
      </Grid>,
    ];
  }

  function handleButton() {
    return (
      <List className={classes.root}>
        <ListItemButton
          onClick={() => setViewName(viewEnum.User)}
          selected={viewName === viewEnum.User}
        >
          <ListItemText primary={t("statistics.view.user")} />
        </ListItemButton>
        <Divider />
        <ListItemButton
          onClick={() => setViewName(viewEnum.Domain)}
          selected={viewName === viewEnum.Domain}
        >
          <ListItemText primary={t("statistics.view.domain")} />
        </ListItemButton>
        <Divider />
        <ListItemButton
          onClick={() => setViewName(viewEnum.Day)}
          selected={viewName === viewEnum.Day}
        >
          <ListItemText primary={t("statistics.view.day")} />
        </ListItemButton>
        <Divider />
        <ListItemButton
          onClick={() => setViewName(viewEnum.Workshop)}
          selected={viewName === viewEnum.Workshop}
        >
          <ListItemText primary={t("statistics.view.workshop")} />
        </ListItemButton>
      </List>
    );
  }

  return (
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
  );
}
