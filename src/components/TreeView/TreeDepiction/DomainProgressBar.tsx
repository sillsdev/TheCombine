import { Box } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

import { getDomainProgressProportion } from "backend";

interface DomainProgressBarProps {
  domainId: string;
}

/** A thin bar along the bottom of a domain tile, showing the proportion of
 * the domain and its descendants that have at least one word. */
export default function DomainProgressBar(
  props: DomainProgressBarProps
): ReactElement {
  const { domainId } = props;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    getDomainProgressProportion(domainId)
      .then(setProgress)
      .catch(() =>
        console.warn(`Failed to get progress for domain ${domainId}.`)
      );
  }, [domainId]);

  return (
    <Box
      sx={{
        backgroundColor: "action.disabledBackground",
        borderBottomLeftRadius: (t) => t.shape.borderRadius,
        borderBottomRightRadius: (t) => t.shape.borderRadius,
        height: 3,
        inset: "auto 0 0 0",
        position: "absolute",
      }}
    >
      <Box
        data-testid="domain-progress-fill"
        sx={{
          backgroundColor: "primary.main",
          borderBottomLeftRadius: (t) => t.shape.borderRadius,
          // Round the right end only as the bar nears full.
          borderBottomRightRadius: (t) => progress * t.shape.borderRadius,
          height: "100%",
          // Animate growth from 0, but reset to 0 instantly on domain change.
          transition: progress ? "width .5s ease" : undefined,
          width: `${progress * 100}%`,
        }}
      />
    </Box>
  );
}
