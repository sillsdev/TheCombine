import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { MergeTreeReference, Hash, TreeDataSense } from "../MergeDupsTree";
import Card from "@material-ui/core/Card/Card";
import {
  CardContent,
  Typography,
  List,
  ListItem,
  IconButton,
  Grid,
  Chip
} from "@material-ui/core";
import { uuid } from "../../../../utilities";
import { Sort } from "@material-ui/icons";
import React from "react";
import { Droppable, Draggable, DragDropContext } from "react-beautiful-dnd";

//interface for component props
export interface MergeStackProps {
  dropWord?: () => void;
  dragWord?: (ref: MergeTreeReference) => void;
  moveSense?: (src: MergeTreeReference, dest: MergeTreeReference) => void;
  draggedWord?: MergeTreeReference;
  wordID: string;
  senseID: string;
  sense: Hash<string>;
  senses: Hash<TreeDataSense>;
  index: number;
}

//interface for component state
interface MergeStackState {
  anchorEl?: HTMLElement;
}

// Constants
const WIDTH: string = "16vw"; // Width of each card
const HEIGHT: string = "10vw"; // Height of each card

class MergeStack extends React.Component<
  MergeStackProps & LocalizeContextProps,
  MergeStackState
> {
  constructor(props: MergeStackProps & LocalizeContextProps) {
    super(props);
    this.state = {};
  }

  dragDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    if (this.props.draggedWord && this.props.moveSense) {
      let ref = {
        word: this.props.wordID,
        sense: this.props.senseID,
        duplicate: uuid()
      };
      this.props.moveSense(this.props.draggedWord, ref);
    }
  }

  render() {
    let displaySenseKey = Object.keys(this.props.sense)[0];
    let displaySenseID = Object.values(this.props.sense)[0];
    let displaySense = this.props.senses[displaySenseID];
    //TODO: Make language dynamic
    if (!displaySense) {
      debugger;
    }
    let lang = "en";

    // Find gloss
    let gloss = displaySense.glosses.filter(
      gloss => gloss.language === lang
    )[0];

    return (
      <Draggable
        key={this.props.senseID}
        draggableId={this.props.senseID}
        index={this.props.index}
        type="SENSE"
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
              width: WIDTH,
              background: snapshot.isDragging ? "lightgreen" : "white"
            }}
          >
            {Object.keys(this.props.sense).length > 1 && (
              <IconButton style={{ float: "right" }}>
                <Sort />
              </IconButton>
            )}
            <CardContent>
              <Typography variant={"h5"}>
                {gloss ? gloss.def : "{ no gloss }"}
              </Typography>
              {/* List semantic domains */}
              <Grid container spacing={2}>
                {displaySense.semanticDomains.map(dom => (
                  <Grid item xs key={dom.name + " " + dom.number}>
                    <Chip
                      label={dom.name + " " + dom.number}
                      onDelete={() => {}}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Draggable>
    );
  }
}

//export class as default
export default withLocalize(MergeStack);
