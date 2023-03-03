import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import LinearProgressWithLabel from "./LinearProgressBar";
import { getSemanticDomainCounts } from "backend";
import * as LocalStorage from "backend/localStorage";
import { defaultWritingSystem } from "types/writingSystem";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    maxWidth: "auto",
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function ProgressBarComponent() {
  const { t } = useTranslation();
  const classes = useStyles();
  const [progressRatio, setProgressRatio] = useState<number>(0);
  const [totalDomainCount, setTotalDomainCount] = useState<number>(0);
  const [totalWordCount, setTotalWordCount] = useState<number>(0);

  useEffect(() => {
    const updateProgress = async () => {
      const statisticsList = await getSemanticDomainCounts(
        LocalStorage.getProjectId(),
        defaultWritingSystem.bcp47
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

    updateProgress();
  }, []);

  return (
    <List className={classes.root}>
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
