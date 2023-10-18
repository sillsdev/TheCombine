import { Card, CardContent, Chip, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { GramCatGroup, Sense } from "api/models";
import { PartOfSpeechButton } from "components/Buttons";
import { groupGramInfo } from "utilities/wordUtilities";

interface SummarySenseCardProps {
  senses: Sense[];
}

export default function SummarySenseCard(
  props: SummarySenseCardProps
): ReactElement {
  const { t } = useTranslation();

  const senseGuids = props.senses.map((s) => s.guid).join("_");

  const groupedGramInfo = groupGramInfo(
    props.senses.map((s) => s.grammaticalInfo)
  ).filter((info) => info.catGroup !== GramCatGroup.Unspecified);

  // Create a list of distinct semantic domain ids.
  const semDoms = props.senses.flatMap((s) => s.semanticDomains);
  const domIds = [...new Set(semDoms.map((d) => d.id))].sort();

  return (
    <Card style={{ backgroundColor: "white" }}>
      <CardContent style={{ position: "relative", paddingRight: 40 }}>
        {/* Icon for part of speech (if any). */}
        {groupedGramInfo.map((info) => (
          <PartOfSpeechButton
            buttonId={`senses-${senseGuids}-part-of-speech-${info.catGroup}`}
            gramInfo={info}
            key={info.catGroup}
            onlyIcon
          />
        ))}
        {/* Number of senses. */}
        <Typography display="block" variant="h5">
          {t("wordHistory.senseCount", { val: props.senses.length })}
        </Typography>
        {/* Semantic domain numbers. */}
        {domIds.map((id) => (
          <Chip key={id} label={id} />
        ))}
      </CardContent>
    </Card>
  );
}
