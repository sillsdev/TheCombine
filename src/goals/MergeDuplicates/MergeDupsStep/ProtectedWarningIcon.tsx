import { WarningOutlined } from "@mui/icons-material";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ProtectReason } from "api/models";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import MultilineTooltipTitle from "components/MultilineTooltipTitle";
import { protectReasonsText } from "goals/MergeDuplicates/MergeDupsStep/protectReasonUtils";

interface ProtectedWarningIconProps {
  id?: string;
  isCompleted?: boolean;
  protectReasons?: ProtectReason[] | null;
  senseOrWord: "sense" | "word";
}

export default function ProtectedWarningIcon(
  props: ProtectedWarningIconProps
): ReactNode {
  const { id, isCompleted, protectReasons, senseOrWord } = props;

  const { t } = useTranslation();

  const tooltipTexts = [];

  switch (senseOrWord) {
    case "sense":
      tooltipTexts.push(t("mergeDups.helpText.protectedSense"));
      if (protectReasons?.length) {
        tooltipTexts.push(protectReasonsText(t, { sense: protectReasons }));
      }
      if (!isCompleted) {
        tooltipTexts.push(t("mergeDups.helpText.protectedSenseInfo"));
      }
      break;

    case "word":
      tooltipTexts.push(t("mergeDups.helpText.protectedWord"));
      if (protectReasons?.length) {
        tooltipTexts.push(protectReasonsText(t, { word: protectReasons }));
      }
      if (!isCompleted) {
        tooltipTexts.push(t("mergeDups.helpText.protectedSenseInfo"));
      }
      break;
  }

  return (
    <IconButtonWithTooltip
      buttonId={`protected-${id}`}
      icon={<WarningOutlined />}
      side="top"
      size="small"
      text={<MultilineTooltipTitle lines={tooltipTexts} />}
    />
  );
}
