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
import DomainChip from "components/WordCard/DomainChip";

export default function UserStatistics(): ReactElement {
  const [domainUserCountList, setDomainUserCountList] = useState<
    SemanticDomainUserCount[]
  >([]);

  useEffect(() => {
    const updateSemanticDomainUserCounts = async (): Promise<void> => {
      const counts = await getUserStatistics(LocalStorage.getProjectId());
      if (counts !== undefined) {
        return setDomainUserCountList(counts);
      }
    };
    updateSemanticDomainUserCounts();
  }, []);

  async function getUserStatistics(
    projectId: string
  ): Promise<SemanticDomainUserCount[] | undefined> {
    return await getSemanticDomainUserCount(projectId);
  }

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 700 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <HeadCell titleId={"statistics.column.username"} />
            <HeadCell titleId={"statistics.column.recentDomain"} />
            <HeadCell titleId={"statistics.column.domainCount"} />
            <HeadCell titleId={"statistics.column.senseCount"} />
          </TableRow>
        </TableHead>
        <TableBody>
          {domainUserCountList.map((t) => (
            <TableRow key={t.id}>
              <Cell text={t.username} />
              <Cell
                body={
                  t.recentDomain ? (
                    <DomainChip
                      domain={{ ...t.recentDomain, userId: undefined }}
                      provenance
                    />
                  ) : null
                }
              />
              <Cell text={t.domainCount} />
              <Cell text={t.wordCount} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
