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
  const { className, domainId, showTooltip } = props;
  const [senseCount, setSenseCount] = useState<number | undefined>();
  const { t } = useTranslation();

  useEffect(() => {
    setSenseCount(undefined);
    if (domainId && domainId !== rootId) {
      getDomainWordCount(domainId)
        .then(setSenseCount)
        .catch(() =>
          console.warn(`Failed to get sense count for domain ${domainId}.`)
        );
    }
  }, [domainId]);

  if (senseCount === undefined) {
    return null;
  }

  return (
    <div className={className}>
      <Tooltip
        placement="top"
        title={showTooltip ? t("treeView.wordCountTooltip") : ""}
      >
        <Badge
          badgeContent={`${senseCount}`} // Convert to string to show even if 0
          color="secondary"
          sx={{ insetInlineEnd: 6, position: "absolute", top: 6 }}
        />
      </Tooltip>
    </div>
  );
}
