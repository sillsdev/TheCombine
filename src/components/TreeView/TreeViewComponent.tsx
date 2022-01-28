import { Grid, Zoom } from "@material-ui/core";
import { animate } from "motion";
import React, { ReactElement } from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

import { WritingSystem } from "api";
import TreeDepiction from "components/TreeView/TreeDepiction";
import TreeSearch from "components/TreeView/TreeSearch";
import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import { createDomains } from "components/TreeView/TreeViewReducer";
import en from "resources/semantic-domains/en.json";
import es from "resources/semantic-domains/es.json";
import fr from "resources/semantic-domains/fr.json";
import { newWritingSystem } from "types/project";

/* This list should cover the domain data imported from resources/semantic-domains/
 * and be covered by the switch statement below. */
export const allSemDomWritingSystems = [
  newWritingSystem("en", "English"),
  newWritingSystem("es", "Español"),
  newWritingSystem("fr", "Francés"),
];

function getSemDomWritingSystem(
  lang: WritingSystem
): WritingSystem | undefined {
  return allSemDomWritingSystems.find((ws) => lang.bcp47.startsWith(ws.bcp47));
}

export interface TreeViewProps {
  semDomWritingSystem: WritingSystem;
  currentDomain: TreeSemanticDomain;
  navigateTree: (domain: TreeSemanticDomain) => void;
  returnControlToCaller: () => void;
}

interface TreeViewComponentState {
  visible: boolean;
}

/** Lets users navigate around a semantic domain hierarchy */
export class TreeView extends React.Component<
  TreeViewProps & LocalizeContextProps,
  TreeViewComponentState
> {
  constructor(props: TreeViewProps & LocalizeContextProps) {
    super(props);
    this.state = { visible: true };

    this.animate = this.animate.bind(this);

    /* Select the language used for the semantic domains.
     * Primary: Has it been specified for the project?
     * Secondary: What is the current browser/ui language?
     * Default: English. */
    const lang =
      getSemDomWritingSystem(props.semDomWritingSystem)?.bcp47 ??
      props.activeLanguage.code;
    let domains: TreeSemanticDomain[];
    switch (lang) {
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

    // If current domain defined in state, use that in the navigateTree call
    if (this.props.currentDomain.name) {
      this.props.navigateTree(props.currentDomain);
    } else {
      const newDomain = createDomains(domains);
      if (!newDomain.name) {
        newDomain.name = this.props.translate("addWords.domain") as string;
      }
      this.props.navigateTree(newDomain);
    }
  }

  animate(domain?: TreeSemanticDomain): Promise<void> {
    if (this.state.visible) {
      this.setState({ visible: false });
      return new Promise((resolve) =>
        setTimeout(() => {
          if (domain && !this.state.visible) {
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

  render(): ReactElement {
    return (
      <React.Fragment>
        {/* Domain search */}
        <Grid container justifyContent="center">
          <TreeSearch
            currentDomain={this.props.currentDomain}
            animate={this.animate}
          />
        </Grid>
        {/* Domain tree */}
        <Zoom
          in={this.state.visible}
          onEntered={() => {
            if (this.props.currentDomain.id) {
              animate(
                "#current-domain",
                { transform: ["none", "scale(.9)", "none"] },
                { delay: 0.25, duration: 1 }
              );
            }
          }}
        >
          <Grid
            container
            direction="column"
            justifyContent="center"
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
