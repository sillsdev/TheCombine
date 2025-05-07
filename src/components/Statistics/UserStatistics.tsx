import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ReactElement, useState, useEffect } from "react";

import { SemanticDomainUserCount } from "api/models";
import { getSemanticDomainUserCount } from "backend";
import * as LocalStorage from "backend/localStorage";
import { HeadCell, Cell } from "components/Statistics/TableCells";

interface UserStatisticsProps {
  lang: string;
}

export default function UserStatistics(
  props: UserStatisticsProps
): ReactElement {
  const [domainUserCountList, setDomainUserCountList] = useState<
    SemanticDomainUserCount[]
  >([]);

  useEffect(() => {
    const updateSemanticDomainUserCounts = async (): Promise<void> => {
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
    <TableContainer component={Paper} style={{ width: 600 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <HeadCell titleId={"statistics.column.username"} />
            <HeadCell titleId={"statistics.column.domainCount"} />
            <HeadCell titleId={"statistics.column.senseCount"} />
          </TableRow>
        </TableHead>
        <TableBody>
          {domainUserCountList.map((t) => (
            <Row key={t.id} counts={t} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function Row(props: { counts: SemanticDomainUserCount }): ReactElement {
  return (
    <TableRow>
      <Cell text={props.counts.username} />
      <Cell text={props.counts.domainCount} />
      <Cell text={props.counts.wordCount} />
    </TableRow>
  );
}
