import { Dialog, Divider, Grid, Paper } from "@mui/material";
import React, { ReactElement } from "react";

import {
  SemanticDomain,
  SemanticDomainFull,
  SemanticDomainTreeNode,
  Status,
  Word,
} from "api/models";
import { getFrontierWords, getSemanticDomainFull } from "backend";
import AppBar from "components/AppBar/AppBarComponent";
import DataEntryHeader from "components/DataEntry/DataEntryHeader/DataEntryHeader";
import DataEntryTable from "components/DataEntry/DataEntryTable/DataEntryTable";
import ExistingDataTable from "components/DataEntry/ExistingDataTable/ExistingDataTable";
import TreeView from "components/TreeView/TreeViewComponent";
import { newSemanticDomain } from "types/semanticDomain";
import theme from "types/theme";
import { DomainWord } from "types/word";

interface DataEntryProps {
  currentDomainTree: SemanticDomainTreeNode;
  isTreeOpen?: boolean;
  closeTree: () => void;
  openTree: () => void;
}

interface DataEntryState {
  domain: SemanticDomainFull;
  domainWords: DomainWord[];
  isSmallScreen: boolean;
  drawerOpen: boolean;
  questionsVisible: boolean;
}

const paperStyle = {
  padding: theme.spacing(2),
  maxWidth: 800,
  marginLeft: "auto",
  marginRight: "auto",
};

/** Filter out words that do not have at least 1 active sense */
export function filterWords(words: Word[]): Word[] {
  return words.filter((w) =>
    w.senses.find((s) =>
      [Status.Active, Status.Protected].includes(s.accessibility)
    )
  );
}

export function filterWordsByDomain(
  words: Word[],
  domain: SemanticDomain
): DomainWord[] {
  const domainWords: DomainWord[] = [];
  for (const currentWord of words) {
    const senses = currentWord.senses.filter((s) =>
      // The undefined is for Statuses created before .accessibility was required in the frontend.
      [Status.Active, Status.Protected, undefined].includes(s.accessibility)
    );
    for (const sense of senses) {
      if (sense.semanticDomains.map((dom) => dom.id).includes(domain.id)) {
        domainWords.push(new DomainWord({ ...currentWord, senses: [sense] }));
      }
    }
  }
  return domainWords;
}

export function sortDomainWordByVern(
  words: Word[],
  domain: SemanticDomain
): DomainWord[] {
  const domainWords = filterWordsByDomain(words, domain);
  return domainWords.sort((a, b) => {
    const comp = a.vernacular.localeCompare(b.vernacular);
    return comp !== 0 ? comp : a.gloss.localeCompare(b.gloss);
  });
}

/**
 * Allows users to add words to a project, add senses to an existing word,
 * and add the current semantic domain to a sense
 */
export default class DataEntryComponent extends React.Component<
  DataEntryProps,
  DataEntryState
> {
  constructor(props: DataEntryProps) {
    super(props);
    this.state = {
      domain: newSemanticDomain(
        this.props.currentDomainTree.id,
        this.props.currentDomainTree.name,
        this.props.currentDomainTree.lang
      ),
      domainWords: [],
      isSmallScreen: window.matchMedia("(max-width: 960px)").matches,
      drawerOpen: false,
      questionsVisible: false,
    };
  }

  componentDidMount(): void {
    this.props.openTree();
    window.addEventListener("resize", () => this.handleWindowSizeChange());
  }

  componentWillUnmount(): void {
    window.removeEventListener("resize", () => this.handleWindowSizeChange());
  }

  handleWindowSizeChange(): void {
    const isSmallScreen = window.matchMedia("(max-width: 960px)").matches;
    this.setState({ isSmallScreen });
  }

  toggleDrawer = (drawerOpen: boolean) => this.setState({ drawerOpen });

  render(): ReactElement {
    return (
      <Grid container justifyContent="center" spacing={3} wrap={"nowrap"}>
        <Grid item>
          <Paper style={paperStyle}>
            <DataEntryHeader
              domain={this.state.domain}
              questionsVisible={this.state.questionsVisible}
              setQuestionVisibility={(questionsVisible: boolean) =>
                this.setState({ questionsVisible })
              }
            />
            <Divider />
            <DataEntryTable
              semanticDomain={this.props.currentDomainTree}
              isTreeOpen={this.props.isTreeOpen}
              openTree={this.props.openTree}
              showExistingData={() => this.toggleDrawer(true)}
              hasDrawerButton={
                this.state.isSmallScreen && this.state.domainWords.length > 0
              }
              hideQuestions={() => {
                this.setState({ questionsVisible: false });
              }}
            />
          </Paper>
        </Grid>
        <ExistingDataTable
          domain={this.props.currentDomainTree}
          typeDrawer={this.state.isSmallScreen}
          domainWords={this.state.domainWords}
          drawerOpen={this.state.drawerOpen}
          toggleDrawer={this.toggleDrawer}
        />

        <Dialog fullScreen open={!!this.props.isTreeOpen}>
          <AppBar />
          <TreeView
            returnControlToCaller={async () =>
              await getFrontierWords().then((words) => {
                this.setState((_, props) => ({
                  domainWords: sortDomainWordByVern(
                    words,
                    props.currentDomainTree
                  ),
                }));
                getSemanticDomainFull(
                  this.props.currentDomainTree.id,
                  this.props.currentDomainTree.lang
                ).then((fullDomain) => {
                  if (fullDomain) {
                    this.setState({ domain: fullDomain });
                  }
                });
                this.props.closeTree();
              })
            }
          />
        </Dialog>
      </Grid>
    );
  }
}
