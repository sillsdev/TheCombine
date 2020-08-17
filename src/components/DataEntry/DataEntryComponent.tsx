import { Dialog, Divider, Grid, Paper } from "@material-ui/core";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

import { getFrontierWords } from "../../backend";
import { CurrentTab } from "../../types/currentTab";
import DomainTree from "../../types/SemanticDomain";
import theme from "../../types/theme";
import {
  DomainWord,
  SemanticDomain,
  Sense,
  State,
  Word,
} from "../../types/word";
import AppBarComponent from "../AppBar/AppBarComponent";
import TreeViewComponent from "../TreeView";
import DataEntryHeader from "./DataEntryHeader/DataEntryHeader";
import DataEntryTable from "./DataEntryTable/DataEntryTable";
import ExistingDataTable from "./ExistingDataTable/ExistingDataTable";

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

/** Filter out words that do not have correct accessibility */
export function filterWords(words: Word[]): Word[] {
  const filteredWords: Word[] = [];
  for (const word of words) {
    let shouldInclude = true;
    for (const sense of word.senses) {
      if (sense.accessibility !== State.active) {
        shouldInclude = false;
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
  const domainWords: DomainWord[] = [];
  const domainName: String = domain.name;
  let domainMatched: Boolean = false;

  for (const currentWord of words) {
    currentWord.senses.forEach((currentSense: Sense, senseIndex: number) => {
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
          senseIndex,
        };
        domainWords.push(newDomainWord);
      }
    });
  }

  return domainWords;
}

export function sortDomainWordByVern(
  existingWords: Word[],
  domain: SemanticDomain
): DomainWord[] {
  const domainWords: DomainWord[] = filterWordsByDomain(existingWords, domain);
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
    const smallScreen: boolean = window.matchMedia("(max-width: 960px)")
      .matches;
    this.setState({
      isSmallScreen: smallScreen,
    });
  };

  toggleDrawer = (openClose: boolean) =>
    this.setState({
      drawerOpen: openClose,
    });

  async getWordsFromBackend(): Promise<Word[]> {
    const existingWords = await getFrontierWords();
    this.setState({ existingWords });
    const words = filterWords(existingWords);
    return words;
  }

  render() {
    const semanticDomain: SemanticDomain = {
      name: this.props.domain.name,
      id: this.props.domain.id,
    };

    return (
      <React.Fragment>
        <AppBarComponent currentTab={CurrentTab.DataEntry} />

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
                displaySemanticDomainView={(
                  isGettingSemanticdomain: boolean
                ) => {
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
            <AppBarComponent currentTab={CurrentTab.DataEntry} />
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
      </React.Fragment>
    );
  }
}

export default withLocalize(DataEntryComponent);
