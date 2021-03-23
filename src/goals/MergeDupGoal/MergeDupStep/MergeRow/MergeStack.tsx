import {
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Typography,
} from "@material-ui/core";
import { ArrowForwardIos } from "@material-ui/icons";
import { useCallback, useEffect, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";

import {
  MergeSense,
  SideBar,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupStepComponent";
import { Hash } from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { StoreState } from "types";

interface MergeStackProps {
  wordId: string;
  mergeSenseId: string;
  senses: Hash<string>;
  index: number;
  setSidebar: (el: SideBar) => void;
  sideBar: SideBar;
}

interface MergeGloss {
  def: string;
  language: string;
  mergeSenseId: string;
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
  const [senseEntries, setSenseEntries] = useState<MergeSense[]>([]);
  const hashedSenses = useSelector(
    (state: StoreState) => state.mergeDuplicateGoal.data.senses
  );
  const analysisLangs = useSelector((state: StoreState) =>
    state.currentProject.analysisWritingSystems.map((ws) => ws.bcp47)
  );

  const updateSidebar = useCallback(() => {
    props.setSidebar({
      senses: senseEntries,
      wordId: props.wordId,
      mergeSenseId: props.mergeSenseId,
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
      Object.entries(props.senses).map((s) => ({
        id: s[0],
        data: hashedSenses[s[1]],
      }))
    );
  }, [hashedSenses, props.senses]);

  if (
    props.sideBar.wordId === props.wordId &&
    props.sideBar.mergeSenseId === props.mergeSenseId &&
    !arraysEqual(
      props.sideBar.senses.map((s) => s.id),
      senseEntries.map((s) => s.id)
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
        mergeSenseId: entry.id,
      });
    }
  }
  glosses = glosses.filter(
    (v, i, a) => a.findIndex((o) => o.def === v.def) === i
  );

  const senses = Object.values(props.senses).map((id) => hashedSenses[id]);
  const semDoms = [
    ...new Set(
      senses.flatMap((sense) =>
        sense.semanticDomains.map((dom) => `${dom.id}: ${dom.name}`)
      )
    ),
  ];

  const showMoreButton = Object.keys(props.senses).length > 1;

  return (
    <Draggable
      key={props.mergeSenseId}
      draggableId={JSON.stringify({
        wordId: props.wordId,
        mergeSenseId: props.mergeSenseId,
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
              {analysisLangs.map((lang) => (
                <div key={lang}>
                  <Typography variant="caption">{`${lang}: `}</Typography>
                  <Typography display="inline" variant="h5">
                    {glosses
                      .filter((g) => g.language === lang)
                      .map((g) => g.def)
                      .join(", ")}
                  </Typography>
                </div>
              ))}
              {/* List semantic domains */}
              <Grid container spacing={2}>
                {semDoms.map((dom) => (
                  <Grid item key={dom}>
                    <Chip label={dom} />
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
