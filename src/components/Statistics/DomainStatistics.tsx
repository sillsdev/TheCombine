import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ReactElement, useState, useEffect } from "react";

import { SemanticDomainCount, SemanticDomainTreeNode } from "api/models";
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
    <TableContainer component={Paper} style={{ maxWidth: 600 }}>
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
            <Row
              key={t.semanticDomainTreeNode.id}
              dom={t.semanticDomainTreeNode}
              count={t.count}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function Row(props: {
  dom: SemanticDomainTreeNode;
  count: number;
}): ReactElement {
  return (
    <TableRow>
      <Cell text={props.dom.id} />
      <Cell text={props.dom.name} />
      <Cell text={props.count} />
    </TableRow>
  );
}
