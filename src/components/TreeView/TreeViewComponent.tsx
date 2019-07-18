import React from "react";
import { Grid, Zoom } from "@material-ui/core";

import TreeProps from "./TreeProps";
import TreeDepiction from "./TreeDepiction";
import SemanticDomain from "./SemanticDomain";

interface TreeViewProps extends TreeProps {
  returnControlToCaller: () => void;
}

interface TreeViewState {
  visible: boolean;
}

export default class TreeView extends React.Component<
  TreeViewProps,
  TreeViewState
> {
  id: any;

  constructor(props: TreeViewProps) {
    super(props);
    this.state = { visible: true };

    this.animate = this.animate.bind(this);
  }

  animate(domain: SemanticDomain | undefined): Promise<void> {
    if (this.state.visible) {
      this.setState({ visible: false });
      return new Promise(resolve =>
        setTimeout(() => {
          if (domain && this.state.visible === false)
            if (domain.number !== this.props.currentDomain.number) {
              this.props.navigate(domain);
              this.setState({ visible: true });
            } else {
              this.props.returnControlToCaller();
            }
          resolve();
        }, 300)
      );
    } else return Promise.reject("Change already in-progress");
  }

  render() {
    return (
      <React.Fragment>
        <Zoom in={this.state.visible}>
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
          >
            <TreeDepiction
              currentDomain={this.props.currentDomain}
              animate={this.animate}
            />
          </Grid>
        </Zoom>
      </React.Fragment>
    );
  }
}
