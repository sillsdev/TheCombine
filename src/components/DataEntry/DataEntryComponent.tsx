import { Dialog, Divider, Grid, Paper } from "@material-ui/core";
import React, { ReactElement } from "react";

import { SemanticDomain, State, Word } from "api/models";
import { getFrontierWords } from "backend";
import AppBar from "components/AppBar/AppBarComponent";
import DataEntryHeader from "components/DataEntry/DataEntryHeader/DataEntryHeader";
import DataEntryTable from "components/DataEntry/DataEntryTable/DataEntryTable";
import { ExistingDataTable } from "components/DataEntry/ExistingDataTable/ExistingDataTable";
import TreeViewComponent from "components/TreeView";
import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import theme from "types/theme";
import { DomainWord, newSemanticDomain } from "types/word";

interface DataEntryProps {
  domain: TreeSemanticDomain;
  treeIsOpen: boolean;
  closeTree: () => void;
  openTree: () => void;
}

interface DataEntryState {
  existingWords: Word[];
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
    w.senses.find((s) => s.accessibility === State.Active)
  );
}

export function filterWordsByDomain(
  words: Word[],
  domain: SemanticDomain
): DomainWord[] {
  const domainWords: DomainWord[] = [];
  const domainName = domain.name;
  let domainMatched = false;

  for (const currentWord of words) {
    for (const currentSense of currentWord.senses.filter(
      (s) =>
        // This is for States created before .accessibility was required in the frontend.
        s.accessibility === State.Active || s.accessibility === undefined
    )) {
      domainMatched = false;
      for (const currentDomain of currentSense.semanticDomains) {
        if (currentDomain.name === domainName) {
          domainMatched = true;
        }
      }
      if (domainMatched) {
        const newDomainWord: DomainWord = {
          word: currentWord,
          gloss: currentSense.glosses[0],
        };
        domainWords.push(newDomainWord);
      }
    }
  }

  return domainWords;
}

export function sortDomainWordByVern(
  existingWords: Word[],
  domain: SemanticDomain
): DomainWord[] {
  const domainWords = filterWordsByDomain(existingWords, domain);
  return domainWords.sort((a, b) =>
    a.word.vernacular.length < 1
      ? -1
      : a.word.vernacular < b.word.vernacular
      ? -1
      : 1
  );
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
      existingWords: [],
      domainWords: [],
      isSmallScreen: window.matchMedia("(max-width: 960px)").matches,
      drawerOpen: false,
      questionsVisible: false,
    };
  }

  componentDidMount(): void {
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

  async getWordsFromBackend(): Promise<Word[]> {
    const existingWords = await getFrontierWords();
    this.setState({ existingWords });
    return filterWords(existingWords);
  }

  render(): ReactElement {
    const semanticDomain = newSemanticDomain(
      this.props.domain.id,
      this.props.domain.name
    );

    return (
      <Grid container justifyContent="center" spacing={3} wrap={"nowrap"}>
        <Grid item>
          <Paper style={paperStyle}>
            <DataEntryHeader
              domain={this.props.domain}
              questionsVisible={this.state.questionsVisible}
              setQuestionVisibility={(questionsVisible: boolean) =>
                this.setState({ questionsVisible })
              }
            />
            <Divider />
            <DataEntryTable
              semanticDomain={semanticDomain}
              treeIsOpen={this.props.treeIsOpen}
              openTree={this.props.openTree}
              getWordsFromBackend={() => this.getWordsFromBackend()}
              showExistingData={() => this.toggleDrawer(true)}
              isSmallScreen={this.state.isSmallScreen}
              hideQuestions={() => {
                this.setState({ questionsVisible: false });
              }}
            />
          </Paper>
        </Grid>
        <ExistingDataTable
          domain={this.props.domain}
          typeDrawer={this.state.isSmallScreen}
          domainWords={this.state.domainWords}
          drawerOpen={this.state.drawerOpen}
          toggleDrawer={this.toggleDrawer}
        />

        <Dialog fullScreen open={this.props.treeIsOpen}>
          <AppBar />
          <TreeViewComponent
            returnControlToCaller={() =>
              this.getWordsFromBackend().then(() => {
                this.setState((prevState, props) => ({
                  domainWords: sortDomainWordByVern(
                    prevState.existingWords,
                    props.domain
                  ),
                }));
                this.props.closeTree();
              })
            }
          />
        </Dialog>
      </Grid>
    );
  }
}
