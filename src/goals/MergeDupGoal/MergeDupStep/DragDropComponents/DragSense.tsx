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
import { useDispatch, useSelector } from "react-redux";

import { MergeTreeSense } from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { setSidebar } from "goals/MergeDupGoal/Redux/MergeDupActions";
import { StoreState } from "types";
import theme from "types/theme";

interface DragSenseProps {
  index: number;
  wordId: string;
  mergeSenseId: string;
  senses: MergeTreeSense[];
}

function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

export default function DragSense(props: DragSenseProps) {
  const [duplicateCount, setDuplicateCount] = useState<number>(1);
  const analysisLangs = useSelector((state: StoreState) =>
    state.currentProjectState.project.analysisWritingSystems.map(
      (ws) => ws.bcp47
    )
  );
  const dispatch = useDispatch();
  const sidebar = useSelector(
    (state: StoreState) => state.mergeDuplicateGoal.tree.sidebar
  );
  const isInSidebar =
    sidebar.wordId === props.wordId &&
    sidebar.mergeSenseId === props.mergeSenseId &&
    sidebar.senses.length > 1;
  const showDefinitions = useSelector(
    (state: StoreState) => state.currentProject.definitionsEnabled
  );

  const updateSidebar = useCallback(() => {
    dispatch(
      setSidebar({
        senses: props.senses,
        wordId: props.wordId,
        mergeSenseId: props.mergeSenseId,
      })
    );
  }, [dispatch, props]);

  const toggleSidebar = () => {
    if (isInSidebar) {
      dispatch(setSidebar());
    } else {
      updateSidebar();
    }
  };

  useEffect(() => {
    if (props.senses.length !== duplicateCount) {
      if (props.senses.length > duplicateCount) {
        updateSidebar();
      }
      setDuplicateCount(props.senses.length);
    }
  }, [props.senses.length, duplicateCount, updateSidebar]);

  if (
    isInSidebar &&
    !arraysEqual(
      sidebar.senses.map((s) => s.guid),
      props.senses.map((s) => s.guid)
    )
  ) {
    updateSidebar();
  }

  // Only display the first sense; others will be deleted as duplicates.
  // User can select a different one by reordering in the sidebar.
  const sep = "; ";
  const semDoms = [
    ...new Set(
      props.senses.flatMap((sense) =>
        sense.semanticDomains.map((dom) => `${dom.id}: ${dom.name}`)
      )
    ),
  ];

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
            margin: theme.spacing(1),
            userSelect: "none",
            minWidth: 150,
            maxWidth: 300,
            background: snapshot.isDragging
              ? "lightgreen"
              : isInSidebar
              ? "lightblue"
              : "white",
          }}
        >
          <CardContent style={{ position: "relative", paddingRight: 40 }}>
            {/* Button for showing the sidebar. */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: 0,
                transform: "translateY(-50%)",
              }}
            >
              {props.senses.length > 1 && (
                <IconButton onClick={toggleSidebar}>
                  <ArrowForwardIos />
                </IconButton>
              )}
            </div>
            {/* Display of sense details. */}
            <div>
              {/* List glosses and (if enabled) definitions. */}
              {analysisLangs.map((lang) => (
                <div key={lang}>
                  <Typography variant="caption">{`${lang}: `}</Typography>
                  <Typography display="inline" variant="h5">
                    {props.senses[0].glosses
                      .filter((g) => g.language === lang)
                      .map((g) => g.def)
                      .join(sep)}
                  </Typography>
                  {showDefinitions && (
                    <div
                      style={{
                        background: "lightyellow",
                        marginTop: theme.spacing(2),
                      }}
                    >
                      <Typography variant="h6">
                        {props.senses[0].definitions
                          .filter((d) => d.language === lang)
                          .map((d) => d.text)
                          .join(sep)}
                      </Typography>
                    </div>
                  )}
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
