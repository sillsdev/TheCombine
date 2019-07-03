//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word } from "../../../../types/word";
import {
  MergeTreeReference,
  Hash,
  MergeTreeSense,
  TreeDataSense
} from "../MergeDupsTree";
import Card from "@material-ui/core/Card/Card";
import { CardContent, Typography, List, ListItem } from "@material-ui/core";
import {uuid} from '../../../../utilities';

//interface for component props
export interface MergeStackProps {
  dropWord?: () => void;
  dragWord?: (ref: MergeTreeReference) => void;
  moveSense?: (src: MergeTreeReference, dest: MergeTreeReference) => void;
  draggedWord?: MergeTreeReference;
  wordID: string;
  senseRef: string;
  senseID: string;
  treeSenses: Hash<MergeTreeSense>;
  senses: Hash<TreeDataSense>;
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

  addWord() {
    /*
    if (this.props.addDuplicate && this.props.dropWord) {
      this.props.addDuplicate(word, this.props.sense.id);
      this.props.dropWord();
    }
     */
  }

  dragDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    if (this.props.draggedWord && this.props.moveSense) {
      let ref = {
        word: this.props.wordID,
        sense: this.props.senseRef,
        duplicate: uuid(),
      };
      this.props.moveSense(this.props.draggedWord, ref);
    }
  }

  drag(_ref: MergeTreeReference) {
    /*
    if (this.props.dragWord) {
      this.props.dragWord(word);
    }
     */
  }

  removeCard(_word: Word) {
    /*
    if (this.props.draggedWord && this.props.dropWord) {
      this.props.dropWord();
    } else {
      if (this.props.removeDuplicate && this.props.updateRow) {
        this.props.removeDuplicate(word, this.props.sense.id);
        // force MergeRow to update even though react think we didn't update any of MergeWord's props
        this.props.updateRow();
      }
    }
     */
  }

  spawnDisplay(_e: React.MouseEvent<HTMLElement>) {
    /*
    if (this.props.sense.dups.length > 1) {
      this.setState({
        ...this.state,
        anchorEl: this.state.anchorEl ? undefined : e.currentTarget
      });
    }
     */
  }

  closeDisplay() {
    /*
    this.setState({ ...this.state, anchorEl: undefined });
     */
  }

  render_single() {
    /*
    var lastCard = this.parentCard();
    const open = Boolean(this.state.anchorEl);
    const id = open ? "simple-popper" : undefined;
    return (
      <div>
        <Box style={{ position: "relative" }}>
          <Card
            draggable={true}
            onDragStart={_ => this.drag(lastCard)}
            onDragEnd={_ => this.removeCard(lastCard)}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              this.dragDrop(e);
            }}
            onClick={e => this.spawnDisplay(e)}
            title={this.props.translate("mergeDups.helpText.dups") as string}
            style={{
              justifyContent: "center",
              float: "left",
              width: WIDTH,
              height: HEIGHT
            }}
          >
            {this.props.draggedWord &&
              this.props.draggedWord.id !== lastCard.id && (
                <Card
                  style={{
                    backgroundColor: "secondary",
                    position: "absolute",
                    float: "left",
                    top: 0,
                    left: 0,
                    width: WIDTH,
                    height: HEIGHT,
                    opacity: 0.7,
                    zIndex: 100
                  }}
                >
                  <CardContent style={{ textAlign: "center" }}>
                    <Typography variant="h1">+</Typography>
                  </CardContent>
                </Card>
              )}
            <CardContent>
              <WordCard key={lastCard.id} word={lastCard} />
              <div
                style={{
                  float: "right"
                }}
              >
                {this.props.sense.dups.length > 1
                  ? this.props.sense.dups.length
                  : ""}
              </div>
            </CardContent>
          </Card>
        </Box>
        <ClickAwayListener onClickAway={() => this.closeDisplay()}>
          <Popper
            id={id}
            open={open}
            anchorEl={this.state.anchorEl}
            disablePortal={true}
            placement="bottom"
            modifiers={{
              flip: {
                enabled: false
              }
            }}
            style={{ zIndex: 200 }}
          >
            <StackDisplay
              closePopper={() => this.closeDisplay()}
              sense={this.props.sense}
            />
          </Popper>
        </ClickAwayListener>
      </div>
    );
            */
  }

  render_stack() {
    /*
    return (
      <Card style={{ paddingBottom: 2, paddingRight: 2 }}>
        {this.render_single()}
      </Card>
    );
     */
  }

  render() {
    let treeSense = this.props.treeSenses[this.props.senseID];
    if (!treeSense) {
      debugger;
    }
    let displaySenseKey = Object.keys(treeSense.dups)[0];
    let displaySenseID = Object.values(treeSense.dups)[0];
    let displaySense = this.props.senses[displaySenseID];
    //TODO: Make language dynamic
    let lang = "en";

    // Find gloss
    let gloss = displaySense.glosses.filter(gloss => gloss.language == lang)[0];

    return (
      <Card
        draggable={true}
        onDragStart={() =>
          this.props.dragWord &&
          this.props.dragWord({
            word: this.props.wordID,
            sense: this.props.senseRef,
            duplicate: displaySenseKey
          })
        }
        onDragOver={e => e.preventDefault()}
        onDrop={e => this.dragDrop(e)}
      >
        <CardContent>
          <Typography variant={"h5"}>{gloss ? gloss.def : "{ no gloss }" }</Typography>
          {/* List semantic domains */}
          <List dense={true}>
            {displaySense.semanticDomains.length == 0 &&
              "{ no semantic domain }"}
            {displaySense.semanticDomains.map(dom => (
              <ListItem> {dom.name + "\t" + dom.number} </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
    /*
    //visual definition
    if (this.props.sense.dups.length > 1) {
      return this.render_stack();
    } else {
      return this.render_single();
    }
     */
  }
}

//export class as default
export default withLocalize(MergeStack);
