import { Card, Grid, ListItem, List } from "@mui/material";
import { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { SemanticDomainUserCount } from "api/models";
import { getSemanticDomainUserCount } from "backend";
import * as LocalStorage from "backend/localStorage";
import { ColumnHead, TableCell } from "components/Statistics/TableCells";

interface UserStatisticsProps {
  lang: string;
}

export default function UserStatistics(
  props: UserStatisticsProps
): ReactElement {
  const [domainUserCountList, setDomainUserCountList] = useState<
    SemanticDomainUserCount[]
  >([]);
  const { t } = useTranslation();

  useEffect(() => {
    const updateSemanticDomainUserCounts = async () => {
      const counts = await getUserStatistics(
        LocalStorage.getProjectId(),
        props.lang
      );
      if (counts !== undefined) {
        return setDomainUserCountList(counts);
      }
    };
    updateSemanticDomainUserCounts();
  }, [props.lang]);

  async function getUserStatistics(
    projectId: string,
    lang?: string
  ): Promise<SemanticDomainUserCount[] | undefined> {
    return await getSemanticDomainUserCount(projectId, lang);
  }

  return (
    <Grid container justifyContent="center">
      <Card style={{ width: 600 }}>
        <List>
          <Grid container wrap="nowrap" justifyContent="space-around">
            <ColumnHead titleId={"statistics.column.username"} />
            <ColumnHead titleId={"statistics.column.domainCount"} />
            <ColumnHead titleId={"statistics.column.senseCount"} />
          </Grid>
        </List>
        <List>
          {domainUserCountList.map((t) => (
            <TableRow key={t.id} counts={t} />
          ))}
        </List>
      </Card>
    </Grid>
  );
}

function TableRow(props: { counts: SemanticDomainUserCount }): ReactElement {
  return (
    <ListItem style={{ minWidth: "600px" }}>
      <Grid container wrap="nowrap" justifyContent="space-around">
        <TableCell
          key={"username_" + props.counts.id}
          text={props.counts.username}
        />
        <TableCell
          key={"domCount_" + props.counts.id}
          text={props.counts.domainCount}
        />
        <TableCell
          key={"wordCount_" + props.counts.id}
          text={props.counts.wordCount}
        />
      </Grid>
    </ListItem>
  );
}
