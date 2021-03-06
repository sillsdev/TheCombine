import { Paper, Divider, Dialog, Grid } from "@material-ui/core";
import React from "react";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

import { getFrontierWords } from "backend";
import { Path } from "browserHistory";
import DomainTree from "types/SemanticDomain";
import theme from "types/theme";
import { DomainWord, SemanticDomain, Sense, State, Word } from "types/word";
import AppBarComponent from "components/AppBar/AppBarComponent";
import TreeViewComponent from "components/TreeView";
import DataEntryHeader from "components/DataEntry/DataEntryHeader/DataEntryHeader";
import DataEntryTable from "components/DataEntry/DataEntryTable/DataEntryTable";
import { ExistingDataTable } from "components/DataEntry/ExistingDataTable/ExistingDataTable";

interface DataEntryProps {
  domain: DomainTree;
}

interface DataEntryState {
  displaySemanticDomain: boolean;
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
  let filteredWords: Word[] = [];
  for (let word of words) {
    let shouldInclude = false;
    for (let sense of word.senses) {
      if (sense.accessibility === State.Active) {
        shouldInclude = true;
        break;
      }
    }
    if (shouldInclude) {
      filteredWords.push(word);
    }
  }
  return filteredWords;
}

export function filterWordsByDomain(
  words: Word[],
  domain: SemanticDomain
): DomainWord[] {
  let domainWords: DomainWord[] = [];
  let domainName: String = domain.name;
  let domainMatched: Boolean = false;

  for (let currentWord of words) {
    for (let currentSense of currentWord.senses.filter(
      (s: Sense) =>
        s.accessibility === State.Active || s.accessibility === undefined
    )) {
      domainMatched = false;
      for (let currentDomain of currentSense.semanticDomains) {
        if (currentDomain.name === domainName) {
          domainMatched = true;
        }
      }
      if (domainMatched) {
        let newDomainWord: DomainWord = {
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
  let domainWords: DomainWord[] = filterWordsByDomain(existingWords, domain);
  domainWords.sort((a, b) =>
    a.word.vernacular.length < 1
      ? -1
      : a.word.vernacular < b.word.vernacular
      ? -1
      : 1
  );
  return domainWords;
}

/**
 * Allows users to add words to a project, add senses to an existing word,
 * and add the current semantic domain to a sense
 */
export class DataEntryComponent extends React.Component<
  DataEntryProps & LocalizeContextProps,
  DataEntryState
> {
  constructor(props: DataEntryProps & LocalizeContextProps) {
    super(props);
    this.state = {
      displaySemanticDomain: true,
      existingWords: [],
      domainWords: [],
      isSmallScreen: window.matchMedia("(max-width: 960px)").matches,
      drawerOpen: false,
      questionsVisible: false,
    };
  }

  async componentDidMount() {
    window.addEventListener("resize", this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
    let smallScreen: boolean = window.matchMedia("(max-width: 960px)").matches;
    this.setState({
      isSmallScreen: smallScreen,
    });
  };

  toggleDrawer = (openClose: boolean) =>
    this.setState({
      drawerOpen: openClose,
    });

  async getWordsFromBackend(): Promise<Word[]> {
    let words = await getFrontierWords();
    this.setState({
      existingWords: words,
    });
    words = filterWords(words);

    return words;
  }

  updateWords = () => {};

  render() {
    let semanticDomain: SemanticDomain = {
      name: this.props.domain.name,
      id: this.props.domain.id,
    };

    return (
      <Grid container justify="center" spacing={3} wrap={"nowrap"}>
        <Grid item>
          <Paper style={paperStyle}>
            <DataEntryHeader
              domain={this.props.domain}
              questionsVisible={this.state.questionsVisible}
              setQuestionVisibility={(visibility: boolean) =>
                this.setState({ questionsVisible: visibility })
              }
            />
            <Divider />
            <DataEntryTable
              domain={this.props.domain}
              semanticDomain={semanticDomain}
              displaySemanticDomainView={(isGettingSemanticdomain: boolean) => {
                this.setState({
                  displaySemanticDomain: isGettingSemanticdomain,
                });
              }}
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

        <Dialog fullScreen open={this.state.displaySemanticDomain}>
          <AppBarComponent currentTab={Path.DataEntry} />
          <TreeViewComponent
            returnControlToCaller={() =>
              this.getWordsFromBackend().then(() => {
                this.setState((prevState) => ({
                  domainWords: sortDomainWordByVern(
                    prevState.existingWords,
                    this.props.domain
                  ),
                  displaySemanticDomain: false,
                }));
              })
            }
          />
        </Dialog>
      </Grid>
    );
  }
}

export default withLocalize(DataEntryComponent);
