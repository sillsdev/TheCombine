import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ReactElement, useState, useEffect } from "react";

import { SemanticDomainCount } from "api/models";
import { getSemanticDomainCounts } from "backend";
import * as LocalStorage from "backend/localStorage";
import { Cell, HeadCell } from "components/Statistics/TableCells";

interface DomainStatisticsProps {
  lang: string;
}

export default function DomainStatistics(
  props: DomainStatisticsProps
): ReactElement {
  const [statisticsList, setStatisticsList] = useState<SemanticDomainCount[]>(
    []
  );

  useEffect(() => {
    const updateStatisticList = async (): Promise<void> => {
      const counts = await getStatisticsCounts(
        LocalStorage.getProjectId(),
        props.lang
      );
      if (counts !== undefined) {
        return setStatisticsList(counts);
      }
    };
    updateStatisticList();
  }, [props.lang]);

  async function getStatisticsCounts(
    projectId: string,
    lang?: string
  ): Promise<SemanticDomainCount[] | undefined> {
    return await getSemanticDomainCounts(projectId, lang);
  }

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 700 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <HeadCell titleId={"statistics.column.domainNumber"} />
            <HeadCell titleId={"statistics.column.domainName"} />
            <HeadCell titleId={"statistics.column.senseCount"} />
          </TableRow>
        </TableHead>
        <TableBody>
          {statisticsList.map((t) => (
            <TableRow key={t.semanticDomainTreeNode.id}>
              <Cell text={t.semanticDomainTreeNode.id} />
              <Cell text={t.semanticDomainTreeNode.name} />
              <Cell text={t.count} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
