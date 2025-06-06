import {
  Divider,
  Grid2,
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
    <Grid2 container direction="row" spacing={1}>
      <Grid2 size={2}>{handleButton()}</Grid2>

      <Grid2
        alignContent="space-around"
        container
        direction="column"
        size={8}
        spacing={2}
      >
        <Typography align="center" variant="h4">
          {t("statistics.title", { val: currentProject?.name })}
        </Typography>
        <Typography align="center" variant="h5">
          {t(`statistics.view.${viewName}`)}
        </Typography>
        {componentToDisplay(viewName as viewEnum)}
      </Grid2>

      <Grid2 size={2}>
        <ProgressBarComponent />
      </Grid2>
    </Grid2>
  );
}
