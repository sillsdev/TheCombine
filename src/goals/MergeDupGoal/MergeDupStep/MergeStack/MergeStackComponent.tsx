import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { MergeTreeReference, Hash, TreeDataSense } from "../MergeDupsTree";
import Card from "@material-ui/core/Card/Card";
import {
  CardContent,
  Typography,
  IconButton,
  Grid,
  Chip,
  Select,
  MenuItem
} from "@material-ui/core";
import { uuid } from "../../../../utilities";
import {
  Sort,
  ArrowForwardIos,
  ExpandMore,
  ExpandLess
} from "@material-ui/icons";
import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Gloss } from "../../../../types/word";

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
  setSidebar: (el: () => JSX.Element | undefined) => void;
}

//interface for component state
interface MergeStackState {
  anchorEl?: HTMLElement;
  expanded: boolean;
}

// Constants
const WIDTH: string = "16vw"; // Width of each card

class MergeStack extends React.Component<
  MergeStackProps & LocalizeContextProps,
  MergeStackState
> {
  constructor(props: MergeStackProps & LocalizeContextProps) {
    super(props);
    this.state = { expanded: false };
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

  toggleExpand() {
    this.props.setSidebar(() => this.renderExpanded());
  }

  renderExpanded() {
    let senseEntries = Object.entries(this.props.sense).map(sense => ({
      id: sense[0],
      data: this.props.senses[sense[1]]
    }));

    return (
      <Droppable droppableId={`${this.props.wordID} ${this.props.senseID}`}>
        {(providedDroppable, _snapshot) => (
          <div
            ref={providedDroppable.innerRef}
            {...providedDroppable.droppableProps}
          >
            {senseEntries.map((entry, index) => (
              <Draggable
                draggableId={JSON.stringify({
                  word: this.props.wordID,
                  sense: this.props.senseID,
                  duplicate: entry.id
                })}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Card
                      style={{
                        marginBottom: 8,
                        marginTop: 8,
                        background: snapshot.isDragging ? "lightgreen" : "white"
                      }}
                    >
                      <CardContent>
                        <Typography variant={"h5"}>
                          {entry.data.glosses
                            .map(gloss => gloss.def)
                            .reduce((gloss, acc) => `${acc}, ${gloss}`)}
                        </Typography>
                        semdom info
                      </CardContent>
                    </Card>
                  </div>
                )}
              </Draggable>
            ))}
            {providedDroppable.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  render() {
    let lang = "en";

    let senses = Object.values(this.props.sense).map(
      senseID => this.props.senses[senseID]
    );

    let senseEntries = Object.entries(this.props.sense).map(sense => ({
      id: sense[0],
      data: this.props.senses[sense[1]]
    }));

    let glosses: { def: string; language: string; sense: string }[] = [];
    for (let entry of senseEntries) {
      for (let gloss of entry.data.glosses) {
        glosses.push({
          def: gloss.def,
          language: gloss.language,
          sense: entry.id
        });
      }
    }
    glosses = glosses.filter(
      (v, i, a) => a.findIndex(o => o.def === v.def) === i
    );

    let semDoms = [
      ...new Set(
        senses
          .map(sense =>
            sense.semanticDomains.map(dom => `${dom.name} ${dom.number}`)
          )
          .flat()
      )
    ];
    console.log(glosses);

    let showMoreButton = Object.keys(this.props.sense).length > 1;

    return (
      <Draggable
        key={this.props.senseID}
        draggableId={JSON.stringify({
          word: this.props.wordID,
          sense: this.props.senseID
        })}
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
              minWidth: 150,
              maxWidth: 300,
              background: snapshot.isDragging ? "lightgreen" : "white"
            }}
          >
            <CardContent style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 0,
                  transform: "translateY(-50%)"
                }}
              >
                {showMoreButton && (
                  <IconButton onClick={() => this.toggleExpand()}>
                    <ArrowForwardIos />
                  </IconButton>
                )}
              </div>
              <div style={{ overflow: "hidden" }}>
                <Typography variant={"h5"}>{glosses[0].def}</Typography>
                {/* List semantic domains */}
                <Grid container spacing={2}>
                  {semDoms.map(dom => (
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
}

//export class as default
export default withLocalize(MergeStack);
