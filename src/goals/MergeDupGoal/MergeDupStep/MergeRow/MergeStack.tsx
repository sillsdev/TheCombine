import {
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Typography,
} from "@material-ui/core";
import { ArrowForwardIos } from "@material-ui/icons";
import React, { useCallback, useEffect, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";

import { SideBar } from "goals/MergeDupGoal/MergeDupStep/MergeDupStepComponent";
import {
  Hash,
  TreeDataSense,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { StoreState } from "types";

interface MergeStackProps {
  wordID: string;
  senseID: string;
  sense: Hash<string>;
  index: number;
  setSidebar: (el: SideBar) => void;
  sideBar: SideBar;
}

interface MergeSenseEntry {
  id: string;
  data: TreeDataSense;
}

interface MergeGloss {
  def: string;
  language: string;
  sense: string;
}

function arraysEqual<T>(arr1: T[], arr2: T[]) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

export default function MergeStack(props: MergeStackProps) {
  const [duplicateCount, setDuplicateCount] = useState<number>(1);
  const [senseEntries, setSenseEntries] = useState<MergeSenseEntry[]>([]);
  const hashedSenses = useSelector(
    (state: StoreState) => state.mergeDuplicateGoal.data.senses
  );

  const updateSidebar = useCallback(() => {
    props.setSidebar({
      senses: senseEntries,
      wordID: props.wordID,
      senseID: props.senseID,
    });
  }, [props, senseEntries]);

  useEffect(() => {
    if (senseEntries.length !== duplicateCount) {
      if (senseEntries.length > duplicateCount) {
        updateSidebar();
      }
      setDuplicateCount(senseEntries.length);
    }
  }, [senseEntries.length, duplicateCount, updateSidebar]);

  useEffect(() => {
    setSenseEntries(
      Object.entries(props.sense).map((s) => ({
        id: s[0],
        data: hashedSenses[s[1]],
      }))
    );
  }, [hashedSenses, props.sense]);

  if (
    props.sideBar.wordID === props.wordID &&
    props.sideBar.senseID === props.senseID &&
    !arraysEqual(
      props.sideBar.senses.map((a) => a.id),
      senseEntries.map((a) => a.id)
    )
  ) {
    updateSidebar();
  }

  let glosses: MergeGloss[] = [];
  for (const entry of senseEntries) {
    for (const gloss of entry.data.glosses) {
      glosses.push({
        def: gloss.def,
        language: gloss.language,
        sense: entry.id,
      });
    }
  }
  glosses = glosses.filter(
    (v, i, a) => a.findIndex((o) => o.def === v.def) === i
  );

  const senses = Object.values(props.sense).map(
    (senseID) => hashedSenses[senseID]
  );
  const semDoms = [
    ...new Set(
      senses
        .map((sense) =>
          sense.semanticDomains.map((dom) => `${dom.name} ${dom.id}`)
        )
        .flat()
    ),
  ];

  const showMoreButton = Object.keys(props.sense).length > 1;

  return (
    <Draggable
      key={props.senseID}
      draggableId={JSON.stringify({
        word: props.wordID,
        sense: props.senseID,
      })}
      index={props.index}
    >
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            margin: 8,
            userSelect: "none",
            minWidth: 150,
            maxWidth: 300,
            background: snapshot.isDragging ? "lightgreen" : "white",
          }}
        >
          <CardContent style={{ position: "relative", paddingRight: 40 }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: 0,
                transform: "translateY(-50%)",
              }}
            >
              {showMoreButton && (
                <IconButton onClick={updateSidebar}>
                  <ArrowForwardIos />
                </IconButton>
              )}
            </div>
            <div>
              {glosses.length > 0 && (
                <Typography variant={"h5"}>{glosses[0].def}</Typography>
              )}
              {/* List semantic domains */}
              <Grid container spacing={2}>
                {semDoms.map((dom) => (
                  <Grid item xs key={dom}>
                    <Chip label={dom} onDelete={() => {}} />
                  </Grid>
                ))}
              </Grid>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}
