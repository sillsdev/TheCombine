import { List } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useState, useEffect } from "react";

import { SemanticDomainTimestampNode } from "api";
import { GetSemanticDomainTimestampCounts } from "backend";

import * as LocalStorage from "backend/localStorage";

export default function PerDayStatisticView() {
  const [index, setIndex] = useState<string>("");
  const [list, setList] = useState<SemanticDomainTimestampNode[]>([]);

  useEffect(() => {
    const updateList = async () => {
      const list = await GetSemanticDomainTimestampCounts(
        LocalStorage.getProjectId()
      );
      if (list != undefined) {
        return setList(list);
      }
    };
    updateList();
  }, []);

  console.log("1");
  function handleList(currList: SemanticDomainTimestampNode[]) {
    return currList.map((t) => [
      <ListItemButton
        key={t.shortDateString + "time key"}
        onClick={() => {
          index != t.shortDateString
            ? setIndex(t.shortDateString)
            : setIndex("");
        }}
        selected={index === t.shortDateString}
      >
        <ListItemText primary={t.shortDateString} />
        {t.count}
      </ListItemButton>,
      <Collapse
        key={t.shortDateString + "collapse"}
        in={index === t.shortDateString}
      >
        {t.nodeList.map((t) => (
          <ListItemButton key={t.hour} sx={{ pl: 4 }}>
            <ListItemText primary={t.hour + "\t--\t" + (t.hour + 1)} />
            {t.count}
          </ListItemButton>
        ))}
      </Collapse>,
    ]);
  }

  return <List>{handleList(list)}</List>;
}
