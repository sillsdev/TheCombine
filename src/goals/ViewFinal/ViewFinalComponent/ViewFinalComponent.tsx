import React, { ReactElement } from "react";
import MaterialTable, { MTableEditField, MTableCell } from "material-table";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import columns from "./ColumnConstants";

import { Hash } from "../../../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { Word, Gloss, Sense, SemanticDomain } from "../../../types/word";
import tableIcons from "./icons";
import * as backend from "../../../backend";
import { Button, Paper } from "@material-ui/core";

// Component state/props
interface ViewFinalProps {
  updateWord: (word: Word) => Promise<void>;
}

interface ViewFinalState {
  language: string;
  words: ViewFinalWord[];
  frontier: Word[];
  edits: string[];
}

export interface ViewFinalWord {
  id: string;
  vernacular: string;
  glosses: string;
  domains: string;
}

// Constants
const SEP_CHAR: string = ",";
const DOMAIN_SEP_CHAR: string = ":";
const SEPARATOR: string = SEP_CHAR + " ";

export class ViewFinalComponent extends React.Component<
  ViewFinalProps & LocalizeContextProps,
  ViewFinalState
> {
  constructor(props: ViewFinalProps & LocalizeContextProps) {
    super(props);

    // this.rowListener = this.rowListener.bind(this);

    // TODO: Make this default to the current user's language
    this.updateFrontierWords = this.updateFrontierWords.bind(this);
    this.state = { language: "en", words: [], frontier: [], edits: [] };
  }

  async componentDidMount() {
    backend
      .getFrontierWords()
      .then((frontier: Word[]) => this.updateLocalWords(frontier));
    // window.addEventListener("keypress", this.rowListener);
  }

  // rowListener(event: KeyboardEvent) {
  //   if (event.key === "Enter" && event.target && event.target instanceof React.Component) {
  //     let element: React.Component = event.target as React.Component;
  //     if (element.props.id === "semanticdomain")
  //   }
  // }

  updateLocalWords(frontier: Word[]) {
    let newWords: ViewFinalWord[] = [];
    let currentWord: ViewFinalWord;
    let hasGloss: boolean;

    for (let word of frontier) {
      // Create a new currentword
      currentWord = {
        id: word.id,
        vernacular: word.vernacular,
        glosses: "",
        domains: ""
      };

      for (let sense of word.senses) {
        // Add all glosses on to currentWord.glosses, if they match the current language
        hasGloss = false;
        for (let gloss of sense.glosses) {
          if (gloss.language === this.state.language) {
            currentWord.glosses += gloss.def + SEPARATOR;
            hasGloss = true;
          }
        }

        // Record semantic domains
        for (let domain of sense.semanticDomains) {
          currentWord.domains +=
            domain.number + DOMAIN_SEP_CHAR + domain.name + SEPARATOR;
        }

        // Remove the last SEPARATOR from glosses and domains, if applicable, and add newlines
        if (hasGloss)
          currentWord.glosses = currentWord.glosses.slice(0, -SEPARATOR.length);
        if (sense.semanticDomains.length > 0)
          currentWord.domains = currentWord.domains.slice(0, -SEPARATOR.length);
        currentWord.glosses += "\n";
        currentWord.domains += "\n";
      }
      // Remove the trailing newlines + push to newWords
      currentWord.glosses = currentWord.glosses.slice(0, -1);
      currentWord.domains = currentWord.domains.slice(0, -1);
      newWords.push(currentWord);
    }
    this.setState({ words: newWords, frontier });
  }

  async updateFrontierWords() {
    let editWord: Word;
    let editSource: ViewFinalWord;

    // Stores gloss info
    let glossBuffer: string[][];

    // Stores semantic domain info
    let domainBuffer: string[][][];

    for (let edit of this.state.edits) {
      editWord = this.state.frontier.find(word => word.id === edit) as Word;
      if (editWord) {
        // Deep copy to edit
        editWord = JSON.parse(JSON.stringify(editWord));
        editSource = this.state.words.find(
          word => word.id === edit
        ) as ViewFinalWord;
        editWord.vernacular = editSource.vernacular;

        // Create a 2D array: row based on \n, column based on SEP_CHAR; clean data afterwards
        glossBuffer = editSource.glosses
          .split("\n")
          .map(value => value.split(SEP_CHAR));
        this.cleanElements(glossBuffer);

        // Create a 3D array: row based on \n, column based on SEP_CHAR, and index based on DOMAIN_SEP_CHAR
        domainBuffer = editSource.domains
          .split("\n")
          .map(value =>
            value.split(SEP_CHAR).map(value2 => value2.split(DOMAIN_SEP_CHAR))
          );
        domainBuffer.forEach(element => this.cleanElements(element));

        // Update all old senses
        for (let sense = 0; sense < editWord.senses.length; sense++) {
          // Edit all glosses
          this.updateAndAddGlosses(
            editWord.senses[sense].glosses,
            glossBuffer[sense]
          );

          // Edit all domains
          this.updateAndAddDomains(
            editWord.senses[sense].semanticDomains,
            domainBuffer[sense]
          );
        }

        // Add new senses
        for (let i = editWord.senses.length; i < glossBuffer.length; i++) {
          editWord.senses.push({
            glosses: glossBuffer[i].map(value => {
              return { language: this.state.language, def: value };
            }),
            semanticDomains: domainBuffer[i].map(value => {
              return { name: value[0], number: value[1] };
            })
          });
        }

        debugger;
        await backend.updateWord(editWord);
      } else {
        // Edited a non-existant word (addition of words not currently allowed).
        // Wat.
      }
    }
    this.setState({ edits: [] });
  }

  // Adds in glosses from glossBuffer; this both updates existing glosses and adds new ones
  private updateAndAddGlosses(glosses: Gloss[], glossBuffer: string[]) {
    let glossIndex: number = 0;

    // Update old glosses
    for (let gloss of glosses) {
      if (gloss.language === this.state.language) {
        // Found a gloss to update
        gloss.def = glossBuffer[glossIndex];
        glossIndex++;
      }
    }

    // Add new glosses
    while (glossIndex < glossBuffer.length) {
      glosses.push({
        language: this.state.language,
        def: glossBuffer[glossIndex]
      });
      glossIndex++;
    }
  }

  // Adds in domains from domainBuffer; this both updates existing domains and adds new ones
  private updateAndAddDomains(
    semanticDomains: SemanticDomain[],
    domainBuffer: string[][]
  ) {
    let domainIndex: number = 0;

    // Edit semantic domains
    for (let domain of semanticDomains) {
      domain.name = domainBuffer[domainIndex][0];
      domain.number = domainBuffer[domainIndex][1];
      domainIndex++;
    }

    // Add in straggler domains
    while (domainIndex < domainBuffer.length) {
      semanticDomains.push({
        name: domainBuffer[domainIndex][0],
        number: domainBuffer[domainIndex][1]
      });
      domainIndex++;
    }
  }

  // Removes all whitespace from strings in a 2d array
  private cleanElements(elements: string[][]) {
    for (let i = 0; i < elements.length; i++)
      for (let j = 0; j < elements[i].length; j++)
        elements[i][j] = elements[i][j].trim();
  }

  render() {
    return (
      <Paper>
        <MaterialTable
          icons={tableIcons}
          title={<Translate id={"viewFinal.title"} />}
          columns={columns}
          data={this.state.words}
          components={{
            //Cell: props => <MTableCell multiline {...props} />,
            EditField: props => <MTableEditField multiline {...props} />
          }}
          editable={{
            onRowUpdate: (newData: ViewFinalWord) => {
              return new Promise(resolve => {
                this.setState({
                  words: this.state.words.map((word: ViewFinalWord) => {
                    if (word.id === newData.id) return newData;
                    else return word;
                  }),
                  edits: [...this.state.edits, newData.id]
                });
                resolve();
              });
            }
          }}
        />
        <Button onClick={this.updateFrontierWords}>SUBMIT</Button>
      </Paper>
    );
  }
}

export default withLocalize(ViewFinalComponent);
