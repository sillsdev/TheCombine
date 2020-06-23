import React from "react";
import { Word, SemanticDomain, Gloss } from "../../../types/word";
import { getWordsFromBackend } from "../DataEntryTable/DataEntryTable";
import { ImmutableExistingData } from "./ImmutableExistingData/ImmutableExistingData";
import { Button, Drawer, Grid, List, makeStyles, Theme, createStyles, Hidden, } from "@material-ui/core";
import theme from "../../../types/theme";

interface DomainWord {
  word: Word;
  gloss: Gloss;
}

interface ExistingDataTableProps {
  domain: SemanticDomain;
}

interface ExistingDataTableStates {
  existingWords: Word[];
  domainWords: DomainWord[];
  reducedSize: string;
  open: boolean;
}

function filterWordsByDomain(
  words: Word[],
  domain: SemanticDomain
): DomainWord[] {
  let domainWords: DomainWord[] = [];
  let domainName: String = domain.name;
  let domainMatched: Boolean = false;

  for (let currentWord of words) {
    for (let currentSense of currentWord.senses) {
      domainMatched = false;
      for (let currentDomain of currentSense.semanticDomains) {
        if (currentDomain.name === domainName) {
          domainMatched = true;
        }
      }
      if (domainMatched){
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

function sortDomainWordByVern(existingData: ExistingDataTable): DomainWord[] {
  let domainWords: DomainWord[] = filterWordsByDomain(
    existingData.state.existingWords,
    existingData.props.domain
  );
  domainWords.sort((a, b) =>
    a.word.vernacular.length < 1 ? -1 : a.word.vernacular < b.word.vernacular ? -1 : 1
  );
  return domainWords;
}
/*Displays previously entered data in a panel to the right of the DataEntryTable */
export class ExistingDataTable extends React.Component<
  ExistingDataTableProps,
  ExistingDataTableStates
> {
  constructor(props: ExistingDataTableProps) {
    super(props);
    this.state = {
      existingWords: [],
      domainWords: [],
      reducedSize: theme.breakpoints.down("md"),
      open: false,
    };
  }
  
  toggleDrawer = (openClose: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    this.setState({
      open: openClose,
    });
  };

  async componentDidMount() {
    let allWords = await getWordsFromBackend();
    this.setState({
      existingWords: allWords,
      domainWords: sortDomainWordByVern(this),
    });
  }

  async updateTable() {
    let allWords = await getWordsFromBackend();
    this.setState({
      existingWords: allWords,
      domainWords: sortDomainWordByVern(this),
    });
  }
  
  list() {
    let domainWords: DomainWord[] = this.state.domainWords;
    return (
    <div onClick={this.toggleDrawer(false)} onKeyDown={this.toggleDrawer(false)} >
        <List >
          {domainWords.map((domainWord) => (
          <ImmutableExistingData
            key={domainWord.word.id}
            vernacular={domainWord.word.vernacular}
            gloss={domainWord.gloss.def}
          />
        ))}
        </List>
    </div>
    );
  }
  
  
  
  /*Make an interface that has the Word and an array of numbers to reference the senses desired to be displayed*/
  render() {
    this.updateTable();
    let domainWords: DomainWord[] = this.state.domainWords;
    if (domainWords !== []) {
      return (
          <React.Fragment >
            <Hidden  lgUp>
              <Button onClick={this.toggleDrawer(true)}>{">"}</Button>
              <Drawer 
                role="presentation" 
                anchor={'right'} 
                open={this.state.open} 
                onClose={this.toggleDrawer(false)}
              >
                {this.list()}
              </Drawer>
            </Hidden>
            <Hidden mdDown >
              <Grid item >
                {this.list()}
              </Grid>
            </Hidden>
          </React.Fragment>
      );
    }
    return "empty";
  }
}
