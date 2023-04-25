import { Card, Grid, ListItem, List } from "@mui/material";
import { ReactElement, useState, useEffect } from "react";

import { SemanticDomainCount, SemanticDomainTreeNode } from "api/models";
import { getSemanticDomainCounts } from "backend";
import * as LocalStorage from "backend/localStorage";
import { ColumnHead, TableCell } from "components/Statistics/TableCells";

interface SemanticDomainStatisticsProps {
  lang: string;
}

export default function SemanticDomainStatistics(
  props: SemanticDomainStatisticsProps
): ReactElement {
  const [statisticsList, setStatisticsList] = useState<SemanticDomainCount[]>(
    []
  );

  useEffect(() => {
    const updateStatisticList = async () => {
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
    <Grid container justifyContent="center">
      <Card style={{ width: 600 }}>
        <List>
          <Grid container wrap="nowrap" justifyContent="space-around">
            <ColumnHead titleId={"statistics.domainNumber"} />
            <ColumnHead titleId={"statistics.domainName"} />
            <ColumnHead titleId={"statistics.countSenses"} />
          </Grid>
        </List>
        <List>
          {statisticsList.map((t) => (
            <TableRow
              key={t.semanticDomainTreeNode.id}
              dom={t.semanticDomainTreeNode}
              count={t.count}
            />
          ))}
        </List>
      </Card>
    </Grid>
  );
}

function TableRow(props: {
  dom: SemanticDomainTreeNode;
  count: number;
}): ReactElement {
  return (
    <ListItem style={{ minWidth: "600px" }}>
      <Grid container wrap="nowrap" justifyContent="space-around">
        <TableCell key={"id_" + props.dom.id} text={props.dom.id} />
        <TableCell key={"domain_" + props.dom.id} text={props.dom.name} />
        <TableCell key={"count_" + props.dom.id} text={`${props.count}`} />
      </Grid>
    </ListItem>
  );
}
