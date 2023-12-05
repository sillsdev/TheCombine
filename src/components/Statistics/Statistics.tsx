import {
  Divider,
  Grid,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Project } from "api/models";
import {
  getLineChartRootData,
  getProgressEstimationLineChartRoot,
  getProject,
} from "backend";
import SemanticDomainStatistics from "components/Statistics/DomainStatistics";
import LineChartComponent from "components/Statistics/LineChartComponent";
import ProgressBarComponent from "components/Statistics/ProgressBar/ProgressBarComponent";
import StyledList from "components/Statistics/StyledList";
import DomainUserStatistics from "components/Statistics/UserStatistics";
import { defaultWritingSystem } from "types/writingSystem";

// The strings should match the keys for statistics.view in translation.json
enum viewEnum {
  User = "user",
  Domain = "domain",
  Day = "day",
  Workshop = "workshop",
}

export default function Statistics(): ReactElement {
  const { t } = useTranslation();
  const [currentProject, setCurrentProject] = useState<Project>();
  const [lang] = useState<string>(defaultWritingSystem.bcp47);
  const [viewName, setViewName] = useState<string>(viewEnum.User);

  useEffect(() => {
    getProject().then(setCurrentProject);
  }, []);

  function componentToDisplay(view: viewEnum): ReactElement {
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

  function handleDisplay(): ReactElement[] {
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

  function handleButton(): ReactElement {
    return (
      <StyledList>
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
      </StyledList>
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
