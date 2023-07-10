import { Divider, List, ListItem, ListItemText, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { getSemanticDomainCounts } from "backend";
import * as LocalStorage from "backend/localStorage";
import LinearProgressWithLabel from "components/Statistics/ProgressBar/LinearProgressBar";
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
      const statList = await getSemanticDomainCounts(
        LocalStorage.getProjectId(),
        defaultWritingSystem.bcp47
      );
      let domainCount = 0;
      let wordCount = 0;
      if (statList?.length) {
        statList.forEach((s) => {
          if (s.count) {
            domainCount++;
            wordCount += s.count;
          }
        });
        setProgressRatio(Math.ceil((domainCount * 100) / statList.length));
      }
      setTotalDomainCount(domainCount);
      setTotalWordCount(wordCount);
    };

    updateProgress();
  }, []);

  return (
    <List className={classes.root}>
      <ListItem>
        <ListItemText primary={t("statistics.domainProgress")} />
        <LinearProgressWithLabel value={progressRatio} />
      </ListItem>
      <Divider />
      <ListItem>
        <ListItemText
          primary={t("statistics.domainsCollected", { val: totalDomainCount })}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <ListItemText
          primary={t("statistics.wordsCollected", { val: totalWordCount })}
        />
      </ListItem>
    </List>
  );
}
