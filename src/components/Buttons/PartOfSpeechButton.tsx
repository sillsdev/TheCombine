import { Hexagon } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { Fragment, ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { GramCatGroup, GrammaticalInfo } from "api/models";
// Loadable is interfering with table rendering, so import this button directly
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { getGramCatGroupColor } from "utilities/wordUtilities";

interface PartOfSpeechButtonProps {
  buttonId?: string;
  buttonLabel?: string;
  gramInfo: GrammaticalInfo;
  onClick?: () => void;
  onlyIcon?: boolean;
}

export default function PartOfSpeechButton(
  props: PartOfSpeechButtonProps
): ReactElement {
  const { t } = useTranslation();
  const { catGroup, grammaticalCategory } = props.gramInfo;
  if (catGroup === GramCatGroup.Unspecified && !props.onClick) {
    return <Fragment />;
  }
  const catGroupText = t(`grammaticalCategory.group.${catGroup}`);
  const color = getGramCatGroupColor(catGroup);
  const hoverText = props.onlyIcon ? (
    <>
      {`[${catGroupText}]`}
      <br />
      {`${grammaticalCategory}`}
    </>
  ) : (
    catGroupText
  );

  const CatGroupButton = (): ReactElement => (
    <IconButtonWithTooltip
      buttonId={props.buttonId}
      buttonLabel={props.buttonLabel ?? "Part of speech"}
      icon={<Hexagon fontSize="small" sx={{ color }} />}
      onClick={props.onClick}
      side="top"
      size="small"
      text={hoverText}
    />
  );

  return props.onlyIcon ? (
    <CatGroupButton />
  ) : (
    <Typography>
      <CatGroupButton />
      {grammaticalCategory}
    </Typography>
  );
}
