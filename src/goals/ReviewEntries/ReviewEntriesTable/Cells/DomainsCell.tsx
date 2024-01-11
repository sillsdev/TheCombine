import { Chip, Grid, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { Word } from "api/models";

interface DomainsCellProps {
  rowData: Word;
}

export default function DomainsCell(props: DomainsCellProps): ReactElement {
  const { t } = useTranslation();
  const items: ReactElement[] = [];

  props.rowData.senses.forEach((sense, index) => {
    if (index) {
      items.push(
        <Grid item key={`${sense.guid}-sep`}>
          <Typography>{"|"}</Typography>
        </Grid>
      );
    }

    if (sense.semanticDomains.length) {
      items.push(
        ...sense.semanticDomains.map((d) => (
          <Grid item key={`${sense.guid}-${d.id}-${d.name}`}>
            <Chip label={`${d.id}: ${d.name}`} />
          </Grid>
        ))
      );
    } else {
      items.push(
        <Grid item key={sense.guid} xs>
          <Chip label={t("reviewEntries.noDomain")} />
        </Grid>
      );
    }
  });

  return (
    <Grid container direction="row" spacing={1}>
      {items}
    </Grid>
  );
}
