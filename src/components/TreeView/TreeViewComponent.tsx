import React from "react";
import { Grid, Zoom } from "@material-ui/core";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

import TreeDepiction from "components/TreeView/TreeDepiction";
import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import { createDomains } from "components/TreeView/TreeViewReducer";

// Domain data
import en from "resources/semantic-domains/en.json";
import es from "resources/semantic-domains/es.json";
import fr from "resources/semantic-domains/fr.json";

interface TreeViewProps {
  currentDomain: TreeSemanticDomain;
  navigateTree: (domain: TreeSemanticDomain) => void;
  returnControlToCaller: () => void;
}

interface TreeViewComponentState {
  visible: boolean;
}

/**
 * Lets users navigate around a semantic domain hierarchy
 */
export class TreeView extends React.Component<
  TreeViewProps & LocalizeContextProps,
  TreeViewComponentState
> {
  constructor(props: TreeViewProps & LocalizeContextProps) {
    super(props);
    this.state = { visible: true };

    this.animate = this.animate.bind(this);

    let domains: TreeSemanticDomain[];
    if (props.activeLanguage) {
      // not defined in unit tests
      switch (props.activeLanguage.code) {
        case "fr":
          domains = fr;
          break;
        case "es":
          domains = es;
          break;
        default:
          domains = en;
          break;
      }
    } else {
      domains = en;
    }
    // If the state has the current domain defined then use that in the navigateTree call
    if (this.props.currentDomain.name !== "") {
      this.props.navigateTree(props.currentDomain);
    } else {
      let newDomain = createDomains(domains);
      // If the current domain is the default then set the name to the translation of "Semantic Domain"
      if (newDomain.currentDomain.name === "") {
        newDomain.currentDomain.name = this.props.translate(
          "addWords.domain"
        ) as string;
      }
      this.props.navigateTree(newDomain.currentDomain);
    }
  }

  animate(domain?: TreeSemanticDomain): Promise<void> {
    if (this.state.visible) {
      this.setState({ visible: false });
      return new Promise((resolve) =>
        setTimeout(() => {
          if (domain && this.state.visible === false) {
            if (domain.id !== this.props.currentDomain.id) {
              this.props.navigateTree(domain);
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

export default withLocalize(TreeView);
