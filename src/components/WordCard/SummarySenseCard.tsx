import { Card, CardContent, Chip, Grid, Typography } from "@mui/material";
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
    <Card style={{ backgroundColor: "white", marginBottom: 10 }}>
      <CardContent style={{ position: "relative" }}>
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
          {t("wordHistory.senseCount", { val: props.senses.length })}
        </Typography>

        {/* Semantic domain numbers */}
        <Grid container spacing={1}>
          {domIds.map((id) => (
            <Grid item key={id}>
              <Chip label={id} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
