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
import { Sort } from "@material-ui/icons";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
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
}

//interface for component state
interface MergeStackState {
  anchorEl?: HTMLElement;
}

// Constants
const WIDTH: string = "16vw"; // Width of each card

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
              minWidth: 150,
              maxWidth: 300,
              background: snapshot.isDragging ? "lightgreen" : "white"
            }}
          >
            {Object.keys(this.props.sense).length > 1 && (
              <IconButton style={{ float: "right" }}>
                <Sort />
              </IconButton>
            )}
            <CardContent>
              <Select value={glosses[0].def}>
                {glosses.map((gloss, i) => (
                  <MenuItem value={gloss.def}>
                    <Typography variant={"h5"}>{gloss.def}</Typography>
                  </MenuItem>
                ))}
              </Select>
              {/* List semantic domains */}
              <Grid container spacing={2}>
                {semDoms.map(dom => (
                  <Grid item xs key={dom}>
                    <Chip label={dom} onDelete={() => {}} />
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
