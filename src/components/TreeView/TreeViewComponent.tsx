import React from "react";
import { Grid, Paper, Zoom } from "@material-ui/core";

import TreeViewHeader from "./TreeViewHeader";
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
  updateDomain?: () => void;

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
          if (domain)
            if (domain.id !== this.props.currentDomain.id) {
              this.props.navigate(domain);
              this.setState({ ...this.state, visible: true });
              if (this.updateDomain) this.updateDomain();
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
      <Paper
        style={{
          flexWrap: "nowrap",
          flexGrow: 1
        }}
      >
        <Grid container direction="column" justify="center" alignItems="center">
          <Grid item xs>
            <TreeViewHeader
              currentDomain={this.props.currentDomain}
              animate={this.animate}
              ref={ref => {
                if (ref) this.updateDomain = ref.updateDomain;
              }}
            />
          </Grid>
          <Zoom in={this.state.visible}>
            <Grid item xs>
              <TreeDepiction
                currentDomain={this.props.currentDomain}
                animate={this.animate}
              />
            </Grid>
          </Zoom>
        </Grid>
      </Paper>
    );
  }
}
