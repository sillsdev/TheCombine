//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { uuid } from "../../../../utilities";
import { MergeTreeReference, Hash, MergeTreeWord } from "../MergeDupsTree";
import { Box, ListSubheader, Grid, Card, CardContent } from "@material-ui/core";
import MergeStack from "../MergeStack";
import { styleAddendum } from "../../../../types/theme";
import { Droppable, Draggable, DragDropContext } from "react-beautiful-dnd";

//interface for component props
export interface MergeRowProps {
  draggedWord?: MergeTreeReference;
  wordID: string;
  dropWord?: () => void;
  moveSense?: (src: MergeTreeReference, dest: MergeTreeReference) => void;
  words: Hash<MergeTreeWord>;
  portait: boolean;
}

//interface for component state
interface MergeRowState {
  items: number[];
}

export class MergeRow extends React.Component<
  MergeRowProps & LocalizeContextProps,
  MergeRowState
> {
  constructor(props: MergeRowProps & LocalizeContextProps) {
    super(props);
    this.state = { items: [0, 1, 2, 3, 4] };
  }
  // this function is used to force this component to redraw itself when
  // the contents of parent change from the removeWord action in MergeStack
  update() {
    this.setState({});
  }

  drop() {
    if (this.props.moveSense && this.props.draggedWord && this.props.dropWord) {
      let dest = {
        word: this.props.wordID,
        sense: uuid(),
        duplicate: uuid()
      };
      this.props.moveSense(this.props.draggedWord, dest);
      this.props.dropWord();
    }
  }

  render() {
    return (
      <Droppable droppableId={this.props.wordID}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={{
              backgroundColor: "lightgrey",
              padding: 8,
              width: 250
            }}
            {...provided.droppableProps}
          >
            {Object.keys(this.props.words[this.props.wordID].senses).map(
              (item, index) => (
                <MergeStack
                  index={index}
                  wordID={this.props.wordID}
                  senseID={item}
                  sense={this.props.words[this.props.wordID].senses[item]}
                />
              )
            )}
          </div>
        )}
      </Droppable>
    );
    //visual definition
    //return (
    //  <Box style={{ flex: 1 }}>
    //    <ListSubheader
    //      onDragOver={e => e.preventDefault()}
    //      onDrop={_ => this.drop()}
    //    >
    //      <hr />
    //      <div style={{ textAlign: "center" }}>
    //        {this.props.words[this.props.wordID].vern}
    //        <i> {"pl. " + this.props.words[this.props.wordID].plural} </i>
    //      </div>
    //    </ListSubheader>
    //    <div>
    //      <Grid container direction={this.props.portait ? "column" : "row"}>
    //        {/*this.props.parent.senses.map(item => (
    //          //<Grid item key={item.id}>
    //          <MergeStack updateRow={() => this.update()} sense={item} />
    //          //</Grid>
    //        ))*/}
    //        {Object.keys(this.props.words[this.props.wordID].senses).map(
    //          senseID => (
    //            <Grid item key={senseID}>
    //              <MergeStack
    //                senseID={senseID}
    //                wordID={this.props.wordID}
    //                sense={
    //                  this.props.words[this.props.wordID].senses[senseID]
    //                }
    //              />
    //            </Grid>
    //          )
    //        )}
    //        <Grid
    //          item
    //          onDragOver={e => e.preventDefault()}
    //          onDrop={_ => this.drop()}
    //          style={{
    //            position: "relative",
    //            flex: "1 0 10vw"
    //          }}
    //        >
    //          {
    //            <Card style={{ ...styleAddendum.inactive, width: "10vw" }}>
    //              <CardContent>Drag new sense</CardContent>
    //              <CardContent>Here</CardContent>
    //            </Card>
    //          }
    //        </Grid>
    //        <Grid
    //          item
    //          style={{ flex: 1 }}
    //          onDragOver={e => e.preventDefault()}
    //          onDrop={_ => this.drop()}
    //          title={this.props.translate("mergeDups.helpText.sense") as string}
    //        />
    //      </Grid>
    //    </div>
    //  </Box>
    //);
  }
}

//export class as default
export default withLocalize(MergeRow);
