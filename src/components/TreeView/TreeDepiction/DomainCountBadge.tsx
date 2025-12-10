import { Badge, Tooltip } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getDomainWordCount } from "backend";
import { rootId } from "types/semanticDomain";

interface DomainCountBadgeProps {
  className?: string;
  domainId?: string;
  showTooltip?: boolean;
}

export default function DomainCountBadge(
  props: DomainCountBadgeProps
): ReactNode {
  const { domainId, showTooltip } = props;
  const [wordCount, setWordCount] = useState<number | undefined>();
  const { t } = useTranslation();

  useEffect(() => {
    setWordCount(undefined);
    if (domainId) {
      getDomainWordCount(domainId)
        .then(setWordCount)
        .catch(() =>
          console.warn(`Failed to get word count for domain ${domainId}.`)
        );
    }
  }, [domainId]);

  if (wordCount === undefined || props.domainId === rootId) {
    return null;
  }

  return (
    <div className={props.className}>
      <Tooltip
        placement="top"
        title={showTooltip ? t("treeView.wordCountTooltip") : ""}
      >
        <Badge
          badgeContent={`${wordCount}`}
          color="secondary"
          sx={{ insetInlineEnd: 6, position: "absolute", top: 6 }}
        />
      </Tooltip>
    </div>
  );
}
