import { Divider, ListItem, ListItemText } from "@mui/material";
import { useState, useEffect, ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { getSemanticDomainCounts } from "backend";
import * as LocalStorage from "backend/localStorage";
import LinearProgressWithLabel from "components/Statistics/ProgressBar/LinearProgressBar";
import StyledList from "components/Statistics/StyledList";
import { defaultWritingSystem } from "types/writingSystem";

export default function ProgressBarComponent(): ReactElement {
  const { t } = useTranslation();
  const [progressRatio, setProgressRatio] = useState<number>(0);
  const [totalDomainCount, setTotalDomainCount] = useState<number>(0);
  const [totalWordCount, setTotalWordCount] = useState<number>(0);

  useEffect(() => {
    const updateProgress = async (): Promise<void> => {
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
    <StyledList>
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
    </StyledList>
  );
}
