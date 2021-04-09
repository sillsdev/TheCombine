import { CardContent, Typography, Grid, Chip, Card } from "@material-ui/core";
import { Draggable } from "react-beautiful-dnd";

import {
  MergeTreeReference,
  MergeTreeSense,
  Sidebar,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import theme from "types/theme";

interface SidebarDragSenseProps {
  sidebar: Sidebar;
  sense: MergeTreeSense;
  index: number;
}

export default function SidebarDragSense(props: SidebarDragSenseProps) {
  const ref: MergeTreeReference = {
    wordId: props.sidebar.wordId,
    mergeSenseId: props.sidebar.mergeSenseId,
    order: props.index,
  };
  return (
    <Draggable
      key={props.sense.guid}
      draggableId={JSON.stringify(ref)}
      index={props.index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card
            style={{
              marginBottom: theme.spacing(1),
              marginTop: theme.spacing(1),
              background: snapshot.isDragging
                ? "lightgreen"
                : props.index === 0
                ? "white"
                : "lightgrey",
            }}
          >
            {senseCardContent(props.sense)}
          </Card>
        </div>
      )}
    </Draggable>
  );
}

function senseCardContent(sense: MergeTreeSense) {
  return (
    <CardContent>
      <Typography variant={"h5"}>
        {sense.glosses.map((g) => g.def).join(", ")}
      </Typography>
      <Grid container spacing={2}>
        {sense.semanticDomains.map((dom) => (
          <Grid item xs key={dom.name}>
            <Chip label={`${dom.name} ${dom.id}`} />
          </Grid>
        ))}
      </Grid>
    </CardContent>
  );
}
