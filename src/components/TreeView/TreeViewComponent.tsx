import React from "react";
import { Grid, Zoom } from "@material-ui/core";

import TreeProps from "./TreeProps";
import TreeDepiction from "./TreeDepiction";
import SemanticDomainWithSubdomains from "./SemanticDomain";
import { createDomains } from "./TreeViewReducer";

// Domain data
import en from "../../resources/semantic-domains/en.json";

interface TreeViewProps extends TreeProps {
  returnControlToCaller: () => void;
}

interface TreeViewComponentState {
  visible: boolean;
}

export default class TreeViewComponent extends React.Component<
  TreeViewProps,
  TreeViewComponentState
> {
  constructor(props: TreeViewProps) {
    super(props);
    this.state = { visible: true };

    this.animate = this.animate.bind(this);

    // TODO: add checking the user's language to select the semantic domains
    let newDomain = createDomains(en);
    this.props.navigate(newDomain.currentdomain);
  }

  animate(domain: SemanticDomainWithSubdomains | undefined): Promise<void> {
    if (this.state.visible) {
      this.setState({ visible: false });
      return new Promise(resolve =>
        setTimeout(() => {
          if (domain && this.state.visible === false) {
            if (domain.id !== this.props.currentDomain.id) {
              this.props.navigate(domain);
              this.setState({ visible: true });
            } else {
              this.props.returnControlToCaller();
            }
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
