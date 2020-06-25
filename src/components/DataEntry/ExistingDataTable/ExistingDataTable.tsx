import React from "react";
import { Word, SemanticDomain, Gloss } from "../../../types/word";
import  { getWordsFromBackend } from "../DataEntryTable/DataEntryTable";
import { ImmutableExistingData } from "./ImmutableExistingData/ImmutableExistingData";
import { Button, Drawer, Grid, List } from "@material-ui/core";
import ListIcon from '@material-ui/icons/List';
import theme from "../../../types/theme";

interface DomainWord {
  word: Word;
  gloss: Gloss;
}

interface ExistingDataTableProps {
  domain: SemanticDomain;
  typeDrawer: boolean;
}

interface ExistingDataTableStates {
  existingWords: Word[];
  domainWords: DomainWord[];
  open: boolean;
  isSmallScreen: boolean;
}

export function filterWordsByDomain(
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
      open: false,
      isSmallScreen: false,
    };
  }

  sortDomainWordByVern(): DomainWord[] {
    let domainWords: DomainWord[] = filterWordsByDomain(
      this.state.existingWords,
      this.props.domain
    );
    domainWords.sort((a, b) =>
      a.word.vernacular.length < 1 ? -1 : a.word.vernacular < b.word.vernacular ? -1 : 1
    );
    return domainWords;
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
    window.addEventListener("resize", this.handleWindowSizeChange);

    let allWords = await getWordsFromBackend();
    this.setState({
      existingWords: allWords,
      domainWords: this.sortDomainWordByVern(),
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
    let smallScreen: boolean = window.matchMedia("(max-width: 960px)").matches;
    this.setState({
      isSmallScreen: smallScreen,
    });
  }

  async updateTable() {
    let allWords = await getWordsFromBackend();
    this.setState({
      existingWords: allWords,
      domainWords: this.sortDomainWordByVern(),
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
  
  renderDrawer() {
    if ( this.props.typeDrawer){
      return (
        <React.Fragment >
            <Button 
            style={{ marginTop: theme.spacing(2) }}
            onClick={this.toggleDrawer(true)}>
              <ListIcon fontSize={"default"} color={"inherit"} />
              </Button>
            <Drawer 
              role="presentation" 
              anchor={'left'} 
              open={this.state.open} 
              onClose={this.toggleDrawer(false)}
            >
              {this.list()}
            </Drawer>
        </React.Fragment>
      );
    }
    return null;
  }
  
  renderSidePanel() {
    if (!this.props.typeDrawer){
      return(
          <React.Fragment >
            <Grid item >
              {this.list()}
            </Grid>
          </React.Fragment>
      );
    }
    return null;
  }
  /*Make an interface that has the Word and an array of numbers to reference the senses desired to be displayed*/
  render() {
    this.updateTable();
    let domainWords: DomainWord[] = this.state.domainWords;
    if (this.state.domainWords.length > 0) {
      return (
      <React.Fragment>
      { this.state.isSmallScreen ? this.renderDrawer() : this.renderSidePanel()}
      </React.Fragment>
      );
    }
    return "empty";
  }

}
