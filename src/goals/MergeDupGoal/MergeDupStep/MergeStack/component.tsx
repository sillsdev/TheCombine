//external modules
import * as React from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { Word } from "../../../../types/word";
import {
  Box,
  CardContent,
  Card,
  Popper,
  ClickAwayListener
} from "@material-ui/core";
import { Sense } from "../component";
import WordCard from "../WordCard";
import StackDisplay from "./Display";

//interface for component props
export interface MergeStackProps {
  sense: Sense;
  addDuplicate?: (word: Word, sense: number) => void;
  removeDuplicate?: (word: Word, sense: number) => void;
  dropWord?: () => void;
  dragWord?: (word: Word) => void;
  updateRow?: () => void;
  draggedWord?: Word;
}

//interface for component state
interface MergeStackState {
  stackDisplay: number;
  anchorEl?: HTMLElement;
}

class MergeStack extends React.Component<
  MergeStackProps & LocalizeContextProps,
  MergeStackState
> {
  constructor(props: MergeStackProps & LocalizeContextProps) {
    super(props);
    this.state = { stackDisplay: -1 };
  }

  addWord(word: Word) {
    if (this.props.addDuplicate && this.props.dropWord) {
      this.props.addDuplicate(word, this.props.sense.id);
      this.props.dropWord();
    }
  }

  dragDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    if (
      this.props.draggedWord &&
      this.props.draggedWord !== this.parentCard()
    ) {
      this.addWord(this.props.draggedWord);
    }
  }

  drag(word: Word) {
    if (this.props.dragWord) {
      this.props.dragWord(word);
    }
  }

  removeCard(word: Word) {
    if (this.props.draggedWord && this.props.dropWord) {
      this.props.dropWord();
    } else {
      if (this.props.removeDuplicate && this.props.updateRow) {
				this.props.removeDuplicate(word, this.props.sense.id);
        // force MergeRow to update even though react think we didn't update any of MergeWord's props
        this.props.updateRow();
      }
    }
  }

  parentCard(): Word {
    return this.props.sense.dups[0];
  }

	spawnDisplay(e: React.MouseEvent<HTMLElement>) {
		if (this.props.sense.dups.length > 1 ){
    this.setState({
      ...this.state,
      anchorEl: this.state.anchorEl ? undefined : e.currentTarget
		});
		}
  }

	closeDisplay() {
			this.setState({ ...this.state, anchorEl: undefined });
  }

  render_single() {
    var lastCard = this.parentCard();
    const open = Boolean(this.state.anchorEl);
    const id = open ? "simple-popper" : undefined;
    return (
      <Box style={{ width: 200 }}>
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
        >
          <div
            style={{
              position: "relative",
              float: "left",
              top: 0,
              left: 0,
              backgroundColor: "#eee"
            }}
          >
            {this.props.draggedWord &&
              this.props.draggedWord.id !== lastCard.id && (
                <Translate id="mergeDups.helpText.dups" />
              )}
          </div>
          <CardContent>
            <WordCard word={lastCard} />
            <div
              style={{
                float: "right",
                position: "relative",
                bottom: 0,
                right: 0
              }}
            >
              {this.props.sense.dups.length > 1
                ? this.props.sense.dups.length
                : ""}
            </div>
          </CardContent>
        </Card>
        <ClickAwayListener onClickAway={() => this.closeDisplay()}>
          <Popper id={id} open={open} anchorEl={this.state.anchorEl} transition>
            <div>
							<StackDisplay closePopper={() => this.closeDisplay()} sense={this.props.sense} />
            </div>
          </Popper>
        </ClickAwayListener>
      </Box>
    );
  }

  render_stack() {
    return (
      <Card style={{ paddingBottom: 2, paddingRight: 2 }}>
        {this.render_single()}
      </Card>
    );
  }

	render() {
    //visual definition
    if (this.props.sense.dups.length > 1) {
      return this.render_stack();
		} else {
      return this.render_single();
    }
  }
}

//export class as default
export default withLocalize(MergeStack);
