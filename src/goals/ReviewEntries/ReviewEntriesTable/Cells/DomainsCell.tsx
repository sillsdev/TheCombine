import { Chip, Grid, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { Word } from "api/models";

interface DomainsCellProps {
  rowData: Word;
}

export default function DomainsCell(props: DomainsCellProps): ReactElement {
  const { t } = useTranslation();

  return (
    <Grid container direction="row" spacing={1}>
      {props.rowData.senses.map((sense, i) => (
        <>
          {i ? (
            <Grid item>
              <Typography>{"|"}</Typography>
            </Grid>
          ) : null}
          {sense.semanticDomains.length ? (
            sense.semanticDomains.map((dom, domainIndex) => (
              <Grid item key={`${dom.id}_${dom.name}`}>
                <Chip
                  id={`sense-${sense.guid}-domain-${domainIndex}`}
                  label={`${dom.id}: ${dom.name}`}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs>
              <Chip label={t("reviewEntries.noDomain")} />
            </Grid>
          )}
        </>
      ))}
    </Grid>
  );
}
