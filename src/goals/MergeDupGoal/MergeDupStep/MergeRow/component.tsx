//external modules
import * as React from "react";
import {LocalizeContextProps, withLocalize} from "react-localize-redux";
import {uuid} from '../../../../utilities';
import {MergeTreeReference} from '../MergeDupsTree';

//interface for component props
export interface MergeRowProps {
  draggedWord?: MergeTreeReference;
  wordID: string;
  dropWord?: () => void;
  moveSense?: (src: MergeTreeReference, dest: MergeTreeReference) => void;
}

//interface for component state
interface MergeRowState {}

export class MergeRow extends React.Component<
  MergeRowProps & LocalizeContextProps,
  MergeRowState
> {
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
        duplicate: uuid(),
      };
      this.props.moveSense(this.props.draggedWord, dest);
      this.props.dropWord();
    }
  }

  render() {
    //visual definition
    return (
      <div> ID: {this.props.wordID}
      {/*
      <Box style={{ flex: 1 }}>
        <ListSubheader
          onDragOver={e => e.preventDefault()}
          onDrop={_ => this.drop()}
        >
          <div style={{ textAlign: "center" }}>
            {this.props.parent.senses[0].dups[0].vernacular}
          </div>
          <hr />
        </ListSubheader>
        <div>
          <Grid container style={{ display: "flex", flexFlow: "row wrap" }}>
            {this.props.parent.senses.map(item => (
              //<Grid item key={item.id}>
              <MergeStack updateRow={() => this.update()} sense={item} />
              //</Grid>
            ))}
            <Grid
              item
              onDragOver={e => e.preventDefault()}
              onDrop={_ => this.drop()}
              style={{
                position: "relative",
                flex: "1 0 10vw"
              }}
            >
              {
                <Card style={{ ...styleAddendum.inactive, width: "10vw" }}>
                  <CardContent>Drag new sense</CardContent>
                  <CardContent>Here</CardContent>
                </Card>
              }
            </Grid>
            <Grid
              item
              style={{ flex: 1 }}
              onDragOver={e => e.preventDefault()}
              onDrop={_ => this.drop()}
              title={this.props.translate("mergeDups.helpText.sense") as string}
            />
          </Grid>
        </div>
      </Box>*/} </div>
    );
  }
}

//export class as default
export default withLocalize(MergeRow);
