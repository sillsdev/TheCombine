import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";

import { Card, Grid, makeStyles } from "@material-ui/core";
import {
  BarChartTimestampNode,
  Project,
  SemanticDomainTimestampNode,
} from "api";
import {
  GetBarChartTimestampNodeCounts,
  GetSemanticDomainTimestampCounts,
} from "backend";
import { useState, useEffect } from "react";
import BarChartComponent from "./BarChartComponent";

interface TimeProps {
  currentProject?: Project;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: "auto",
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function NestedList(props: TimeProps) {
  const [index, setIndex] = useState<string>();
  const classes = useStyles();
  const [list, setList] = useState<SemanticDomainTimestampNode[]>([]);
  const [barChartList, setBarChartList] = useState<BarChartTimestampNode[]>([]);

  useEffect(() => {
    const updateList = async () => {
      const list = await GetSemanticDomainTimestampCounts(
        props.currentProject!.id
      );
      if (list != undefined) {
        return setList(list);
      }
    };

    const updateBarChartList = async () => {
      const list = await GetBarChartTimestampNodeCounts(
        props.currentProject!.id
      );
      if (list != undefined) {
        return setBarChartList(list);
      }
    };
    updateList();
    updateBarChartList();
  }, []);

  console.log(barChartList);

  function handleList() {
    return list.map((t) => [
      <ListItemButton
        key={t.shortDateString + "time key"}
        onClick={() => setIndex(t.shortDateString)}
        selected={index === t.shortDateString}
      >
        <ListItemText primary={t.shortDateString} />
        {t.count}
      </ListItemButton>,
      <Collapse
        key={t.shortDateString + "collapse"}
        in={index === t.shortDateString}
        timeout="auto"
        unmountOnExit
      >
        {t.nodeList.map((t) => [
          <List
            key={t.shortDateString + "collapse"}
            component="div"
            disablePadding
          >
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemText
                primary={
                  t.hour + "\t--\t" + (t.hour + 1 >= 25 ? 0 : t.hour + 1)
                }
              />
              {t.count}
            </ListItemButton>
          </List>,
        ])}
      </Collapse>,
    ]);
  }

  return (
    <Grid
      container
      direction="column"
      alignContent="center"
      justifyContent="center"
    >
      <Grid item>
        <BarChartComponent barChartNodeList={barChartList} />
      </Grid>
      <Grid item style={{ width: 1000 }}>
        <Card>
          <List className={classes.root}>{handleList()}</List>
        </Card>
      </Grid>
    </Grid>
  );
}
