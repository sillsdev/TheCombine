import { ArrowForwardIos, WarningOutlined } from "@mui/icons-material";
import { CardContent, Chip, Grid, IconButton } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { GramCatGroup, Sense, Status } from "api/models";
import { IconButtonWithTooltip, PartOfSpeechButton } from "components/Buttons";
import MultilineTooltipTitle from "components/MultilineTooltipTitle";
import SenseCardText from "components/WordCard/SenseCardText";

interface SenseCardContentProps {
  senses: Sense[];
  languages?: string[];
  sidebar?: boolean;
  toggleFunction?: () => void;
}

// Only show first sense's glosses/definitions; in merging, others deleted as duplicates.
// Show first part of speech, if any.
// Show semantic domains from all senses.
// In merging, user can select a different one by reordering in the sidebar.
export default function SenseCardContent(
  props: SenseCardContentProps
): ReactElement {
  const { t } = useTranslation();

  const semDoms = [
    ...new Set(
      props.senses.flatMap((s) =>
        s.semanticDomains.map((dom) => `${dom.id}: ${dom.name}`)
      )
    ),
  ];
  const gramInfo = props.senses
    .map((s) => s.grammaticalInfo)
    .find((g) => g.catGroup !== GramCatGroup.Unspecified);

  const protectedWarning =
    !props.sidebar && props.senses[0].accessibility === Status.Protected;
  const tooltipTexts = [t("mergeDups.helpText.protectedSense")];
  if (props.senses[0].otherField) {
    tooltipTexts.push(
      t("mergeDups.helpText.protectedData", {
        val: props.senses[0].otherField,
      })
    );
  }
  tooltipTexts.push(t("pronunciations.protectedSenseInfo"));

  return (
    <CardContent style={{ position: "relative", paddingRight: 40 }}>
      {/* Icon for part of speech (if any). */}
      <div style={{ position: "absolute", left: 0, top: 0 }}>
        {gramInfo && (
          <PartOfSpeechButton
            buttonId={`sense-${props.senses[0].guid}-part-of-speech`}
            gramInfo={gramInfo}
            onlyIcon
          />
        )}
      </div>
      {/* Warning for protected senses. */}
      <div style={{ position: "absolute", right: 0, top: 0 }}>
        {protectedWarning && (
          <IconButtonWithTooltip
            icon={<WarningOutlined />}
            side="top"
            size="small"
            text={<MultilineTooltipTitle lines={tooltipTexts} />}
            buttonId={`sense-${props.senses[0].guid}-protected`}
          />
        )}
      </div>
      {/* Button for showing the sidebar, when sense card has multiple senses. */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
        }}
      >
        {props.senses.length > 1 && (
          <IconButton
            onClick={props.toggleFunction}
            id={`sidebar-open-sense-${props.senses[0].guid}`}
            size="large"
          >
            <ArrowForwardIos />
          </IconButton>
        )}
      </div>
      {/* List glosses and (if any) definitions. */}
      <SenseCardText languages={props.languages} sense={props.senses[0]} />
      {/* List semantic domains. */}
      <Grid container spacing={2}>
        {semDoms.map((dom) => (
          <Grid item key={dom}>
            <Chip label={dom} />
          </Grid>
        ))}
      </Grid>
    </CardContent>
  );
}
