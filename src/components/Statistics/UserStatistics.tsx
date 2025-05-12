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
import { Cell, HeadCell } from "components/Statistics/TableCells";

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
    <TableContainer component={Paper} sx={{ maxWidth: 700 }}>
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
            <TableRow key={t.id}>
              <Cell text={t.username} />
              <Cell text={t.domainCount} />
              <Cell text={t.wordCount} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
