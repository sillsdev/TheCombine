import { Card, CardContent, Grid2, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { GramCatGroup, Sense } from "api/models";
import { PartOfSpeechButton } from "components/Buttons";
import DomainChip from "components/WordCard/DomainChip";
import SensesTextSummary from "components/WordCard/SensesTextSummary";
import { groupGramInfo } from "utilities/wordUtilities";

interface SummarySenseCardProps {
  bgcolor?: string;
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

  // Create a list of semantic domains with distinct ids.
  const semDoms = props.senses.flatMap((s) => s.semanticDomains);
  const sortedDoms = [...new Set(semDoms.map((d) => d.id))]
    .sort()
    .map((id) => semDoms.find((dom) => dom.id === id)!);

  return (
    <Card sx={{ bgcolor: props.bgcolor || "white", mb: 1 }}>
      <CardContent sx={{ position: "relative" }}>
        {/* Parts of speech */}
        {groupedGramInfo.map((info) => (
          <PartOfSpeechButton
            buttonId={`senses-${senseGuids}-part-of-speech-${info.catGroup}`}
            gramInfo={info}
            key={info.catGroup}
            onlyIcon
          />
        ))}

        {/* Sense count */}
        <Typography display="block" variant="h5">
          {t("wordCard.senseCount", { val: props.senses.length })}
        </Typography>

        {/* Glosses */}
        <SensesTextSummary
          definitionsOrGlosses="glosses"
          senses={props.senses}
        />

        {/* Semantic domain numbers */}
        <Grid2 container spacing={1}>
          {sortedDoms.map((dom) => (
            <DomainChip domain={dom} key={dom.id} onlyId />
          ))}
        </Grid2>
      </CardContent>
    </Card>
  );
}
