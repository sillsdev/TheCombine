/* THIS COMPONENT IS INTENDED TO BE AN EXAMPLE ONLY. 
  IT WILL NOT BE USED IN THE APPLICATION.
*/

//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word, Merge } from "../../../../types/word";
import { isTemplateElement } from "@babel/types";
import { dragWord } from "../../../DraggableWord/actions";
import {
  CardContent,
  Typography,
  Card,
  List,
  ListItem,
  ListSubheader,
  Box,
  Grid
} from "@material-ui/core";
import classes from "*.module.css";
import MergeStack from "../MergeStack";

//interface for component props
export interface MergeRowProps {
  parent: Word;
}

//interface for component state
interface MergeRowState {
  merges: Merge[];
}

class MergeRow extends React.Component<
  MergeRowProps & LocalizeContextProps,
  MergeRowState
> {
  constructor(props: MergeRowProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    //visual definition
    return (
      <Box>
        <ListSubheader>{this.props.parent.vernacular}</ListSubheader>
        <Grid>
          {this.state.merges.map((item, index) => (
            <MergeStack startingWords={item.chidren} />
          ))}
        </Grid>
      </Box>
    );
  }
}

//export class as default
export default withLocalize(MergeRow);
