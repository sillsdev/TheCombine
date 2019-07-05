//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import {
  MergeTreeReference,
  Hash,
  MergeTreeSense,
  TreeDataSense
} from "../MergeDupsTree";
import Card from "@material-ui/core/Card/Card";
import {
  CardContent,
  Typography,
  List,
  ListItem,
  IconButton
} from "@material-ui/core";
import { uuid } from "../../../../utilities";
import { Sort } from "@material-ui/icons";

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

  dragDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    if (this.props.draggedWord && this.props.moveSense) {
      let ref = {
        word: this.props.wordID,
        sense: this.props.senseRef,
        duplicate: uuid()
      };
      this.props.moveSense(this.props.draggedWord, ref);
    }
  }

  render() {
    let treeSense = this.props.treeSenses[this.props.senseID];
    let displaySenseKey = Object.keys(treeSense.dups)[0];
    let displaySenseID = Object.values(treeSense.dups)[0];
    let displaySense = this.props.senses[displaySenseID];
    //TODO: Make language dynamic
    let lang = "en";

    // Find gloss
    let gloss = displaySense.glosses.filter(
      gloss => gloss.language === lang
    )[0];

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
        {Object.keys(treeSense.dups).length > 1 && (
          <IconButton style={{ float: "right" }}>
            <Sort />
          </IconButton>
        )}
        <CardContent>
          <Typography variant={"h5"}>
            {gloss ? gloss.def : "{ no gloss }"}
          </Typography>
          {/* List semantic domains */}
          <List dense={true}>
            {displaySense.semanticDomains.length === 0 &&
              "{ no semantic domain }"}
            {displaySense.semanticDomains.map(dom => (
              <ListItem> {dom.name + "\t" + dom.number} </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }
}

//export class as default
export default withLocalize(MergeStack);
