import { Circle } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { Fragment, ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { GramCatGroup, GrammaticalInfo } from "api/models";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { getGramCatGroupColor } from "utilities/wordUtilities";

interface PartOfSpeechProps {
  buttonId: string;
  gramInfo: GrammaticalInfo;
  onClick?: () => void;
  onlyIcon?: boolean;
}

export default function PartOfSpeech(props: PartOfSpeechProps): ReactElement {
  const { t } = useTranslation();
  const { catGroup, grammaticalCategory } = props.gramInfo;
  if (catGroup === GramCatGroup.Unspecified) {
    return <Fragment />;
  }
  const catGroupText = t(`grammaticalCategory.group.${catGroup}`);
  const hoverText = props.onlyIcon ? (
    <>
      {`[${catGroupText}]`}
      <br />
      {`${grammaticalCategory}`}
    </>
  ) : (
    catGroupText
  );

  return (
    <>
      <IconButtonWithTooltip
        buttonId={props.buttonId}
        icon={
          <Circle
            fontSize="small"
            sx={{ color: getGramCatGroupColor(catGroup) }}
          />
        }
        onClick={props.onClick}
        text={hoverText}
        small
      />
      {!props.onlyIcon && <Typography>grammaticalCategory</Typography>}
    </>
  );
}
