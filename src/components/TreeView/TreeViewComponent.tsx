import React from "react";
import { Grid, Zoom } from "@material-ui/core";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import TreeProps from "./TreeProps";
import TreeDepiction from "./TreeDepiction";
import SemanticDomainWithSubdomains from "./SemanticDomain";
import { createDomains } from "./TreeViewReducer";

// Domain data
import en from "../../resources/semantic-domains/en.json";
import es from "../../resources/semantic-domains/es.json";
import fr from "../../resources/semantic-domains/fr.json";

interface TreeViewProps extends TreeProps {
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

    var domains = en;
    if (props.activeLanguage) {
      // not defined in unit tests
      switch (props.activeLanguage.code) {
        case "fr":
          domains = fr;
          break;
        case "es":
          domains = es;
          break;
      }
    }
    // TODO: if the state has the current domain defined then use that in the navigate call
    let newDomain = createDomains(domains);
    // If the current domain is the default then set the name to the translation of "Semantic Domain"
    if (newDomain.currentdomain.name === "") {
      newDomain.currentdomain.name = this.props.translate(
        "addWords.domain"
      ) as string;
    }
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

export default withLocalize(TreeView);
