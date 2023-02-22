import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import DraftsIcon from "@mui/icons-material/Drafts";
import SendIcon from "@mui/icons-material/Send";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StarBorder from "@mui/icons-material/StarBorder";
import { Card, Grid, makeStyles } from "@material-ui/core";
import { Project, SemanticDomainTimestampNode } from "api";
import { GetSemanticDomainTimestampCounts } from "backend";
import React, { ReactElement, useState, useEffect } from "react";

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
  const [list, setList] = React.useState<SemanticDomainTimestampNode[]>([]);

  React.useEffect(() => {
    const updateList = async () => {
      const list = await GetSemanticDomainTimestampCounts(
        props.currentProject!.id
      );
      if (list != undefined) {
        return setList(list);
      }
    };
    updateList();
  }, []);

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
    <Grid container justifyContent="center">
      <Card style={{ width: 600 }}>
        <List className={classes.root}>{handleList()}</List>
      </Card>
    </Grid>
  );
}
