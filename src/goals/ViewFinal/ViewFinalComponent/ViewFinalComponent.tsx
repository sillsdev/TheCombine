import React from "react";
import MaterialTable, { MTableEditField } from "material-table";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { Button, Paper, TextField, Chip } from "@material-ui/core";

import { Word, Gloss, SemanticDomain, Sense } from "../../../types/word";
import tableIcons from "./icons";
import * as backend from "../../../backend";
import DomainCell from "./CellComponents";
import { Add } from "@material-ui/icons";
import AlignedList from "./CellComponents/AlignedList";
import DeleteCell from "./CellComponents/DeleteCell";

// Component state/props
interface ViewFinalProps {
  updateWord: (word: Word) => Promise<void>;
}

interface ViewFinalState {
  language: string;
  words: ViewFinalWord[];
  frontier: Word[];
  edits: string[];

  addingSenseToWord: boolean;
  wordToEdit: ViewFinalWord;
}

export interface ViewFinalWord {
  id: string;
  vernacular: string;
  senses: ViewFinalSense[];
}
export interface ViewFinalSense {
  deleted: boolean;
  glosses: string;
  domains: SemanticDomain[];
}

// Constants
const SEP_CHAR: string = ",";
const SEPARATOR: string = SEP_CHAR + " ";

const NO_GLOSS: string = "{No gloss}";

export class ViewFinalComponent extends React.Component<
  ViewFinalProps & LocalizeContextProps,
  ViewFinalState
> {
  readonly COLUMNS = [
    {
      title: "Vernacular",
      field: "vernacular",
      render: (rowData: ViewFinalWord) => this.vernacularField(rowData)
    },
    {
      title: "Glosses",
      field: "glosses",
      render: (rowData: ViewFinalWord) => this.senseField(rowData)
    },
    {
      title: "Domains",
      field: "domains",
      render: (rowData: ViewFinalWord) => (
        <DomainCell
          rowData={rowData}
          addDomain={this.addDomain}
          deleteDomain={this.deleteDomain}
        />
      )
    },
    {
      title: "",
      field: "id",
      render: (rowData: ViewFinalWord) => (
        <DeleteCell rowData={rowData} delete={this.deleteSense} />
      )
    }
  ];

  constructor(props: ViewFinalProps & LocalizeContextProps) {
    super(props);

    // TODO: Make this default to the current user's language
    this.senseField = this.senseField.bind(this);
    this.vernacularField = this.vernacularField.bind(this);

    // Bind updates
    this.updateVernacular = this.updateVernacular.bind(this);
    this.addDomain = this.addDomain.bind(this);
    this.deleteDomain = this.deleteDomain.bind(this);
    this.deleteSense = this.deleteSense.bind(this);

    this.updateFrontierWords = this.updateFrontierWords.bind(this);

    this.state = {
      language: "en",
      words: [],
      frontier: [],
      edits: [],
      addingSenseToWord: false,
      wordToEdit: {} as ViewFinalWord // WordToEdit always set right before being needed, so its value here is unimportant
    };
  }

  async componentDidMount() {
    backend
      .getFrontierWords()
      .then((frontier: Word[]) => this.updateLocalWords(frontier));
  }

  // Creates the local set of words from the frontier
  private updateLocalWords(frontier: Word[]) {
    let hasGloss: boolean;
    let newWords: ViewFinalWord[] = [];
    let currentWord: ViewFinalWord;
    let currentSense: ViewFinalSense;

    for (let word of frontier) {
      // Create a new currentword
      currentWord = {
        id: word.id,
        vernacular: word.vernacular,
        senses: []
      };

      for (let sense of word.senses) {
        currentSense = {
          deleted: false,
          glosses: "",
          domains: [...sense.semanticDomains]
        };

        // Find all glosses in the current language
        hasGloss = false;
        for (let gloss of sense.glosses)
          if (gloss.language === this.state.language) {
            hasGloss = true;
            currentSense.glosses += gloss.def + SEPARATOR;
          }

        // Format the glosses + push them
        if (hasGloss)
          currentSense.glosses = currentSense.glosses.slice(
            0,
            -SEPARATOR.length
          );
        else currentSense.glosses = NO_GLOSS;
        currentWord.senses.push(currentSense);
      }

      // Remove the trailing newlines + push to newWords
      newWords.push(currentWord);
    }
    this.setState({ words: newWords, frontier });
  }

  // Updates the frontier from the local word set
  private async updateFrontierWords() {
    let editWord: Word;
    let editSource: ViewFinalWord;
    let edits: string[] = Array.from(new Set(this.state.edits));
    let senseHandle: ViewFinalSense | Sense;

    for (let edit of edits) {
      editWord = JSON.parse(
        JSON.stringify(this.state.frontier.find(value => value.id === edit))
      );
      editSource = this.state.words.find(
        value => value.id === edit
      ) as ViewFinalWord;

      editWord.vernacular = editSource.vernacular;
      // Update old senses
      for (let sense = 0; sense < editWord.senses.length; sense++) {
        senseHandle = editWord.senses[sense];

        // Update the glosses of the current sense. The second argument converts a comma-separated string into an array, trimming whitespace
        senseHandle.glosses = this.updateAddGlosses(
          senseHandle.glosses,
          editSource.senses[sense].glosses
            .split(SEP_CHAR)
            .map(value => value.trim())
        );

        senseHandle.semanticDomains = editSource.senses[sense].domains.map(
          value => {
            return {
              name: value.name,
              number: value.number
            };
          }
        );
      }

      // Add new senses
      if (editWord.senses.length > editSource.senses.length)
        for (
          let sense = editWord.senses.length;
          sense < editSource.senses.length;
          sense++
        ) {
          senseHandle = editSource.senses[sense];
          editWord.senses.push({
            glosses: senseHandle.glosses.split(SEP_CHAR).map(value => {
              return { language: this.state.language, def: value.trim() };
            }),
            semanticDomains: editSource.senses[sense].domains.map(value => {
              return {
                name: value.name,
                number: value.number
              };
            })
          });
        }

      debugger;
      await backend.updateWord(editWord);
    }
  }

  // Adds in glosses from glossBuffer; this both updates existing glosses and adds new ones
  private updateAddGlosses(glosses: Gloss[], glossBuffer: string[]): Gloss[] {
    let glossIndex: number = 0;
    let superIndex: number = 0;

    // Overwrite/add glosses
    // debugger;
    while (glossIndex < glossBuffer.length) {
      // Locate an entry
      while (
        glosses[superIndex] &&
        glosses[superIndex].language !== this.state.language
      )
        superIndex++;

      // Add the new entry
      glosses[superIndex] = {
        language: this.state.language,
        def: glossBuffer[glossIndex]
      };
      superIndex++;
      glossIndex++;
    }

    // Remove dead glosses; superIndex is the index of the last valid gloss, so one beyond it
    return glosses.slice(0, superIndex);
  }

  // Create the vernacular text field
  vernacularField(rowData: ViewFinalWord) {
    return (
      <TextField
        value={rowData.vernacular}
        onChange={event => this.updateVernacular(rowData, event.target.value)}
      />
    );
  }
  updateVernacular(rowData: ViewFinalWord, newData: string) {
    this.setState({
      words: this.state.words.map(value => {
        if (value.id === rowData.id) return { ...value, vernacular: newData };
        else return value;
      }),
      edits: [...this.state.edits, rowData.id]
    });
  }

  // Create the sense edit fields
  senseField(rowData: ViewFinalWord) {
    return (
      <AlignedList
        contents={rowData.senses.map((value, index) => (
          <TextField
            value={value.glosses}
            onChange={event =>
              this.updateSense(
                rowData,
                index,
                event.target.value,
                value.domains
              )
            }
          />
        ))}
        bottomCell={
          <Chip
            label={<Add />}
            onClick={event =>
              this.updateSense(rowData, rowData.senses.length, "", [])
            }
          />
        }
      />
    );
  }

  updateSense(
    wordToEdit: ViewFinalWord,
    editIndex: number,
    newGlosses: string,
    newDomains: SemanticDomain[]
  ) {
    this.setState({
      words: this.state.words.map(value => {
        if (value.id === wordToEdit.id)
          return {
            ...value,
            senses: [
              ...value.senses.slice(0, editIndex),
              {
                ...value.senses[editIndex],
                glosses: newGlosses,
                domains: newDomains
              },
              ...value.senses.slice(editIndex + 1, value.senses.length)
            ]
            //  value.senses.map((sense, index) => {
            //   if (editIndex === index)
            //     return { ...sense, glosses: newGlosses, domains: newDomains };
            //   else return sense;
            // })
          };
        else return value;
      }),
      edits: [...this.state.edits, wordToEdit.id]
    });
  }

  deleteSense(wordToEdit: ViewFinalWord, deleteIndex: number) {
    this.setState({
      words: this.state.words.map(value => {
        if (value.id === wordToEdit.id)
          return {
            ...value,
            senses: value.senses.filter((sense, index) => index !== deleteIndex)
          };
        else return value;
      })
    });
  }

  // Adds a domain to a word with a specific ID
  addDomain(newDomain: SemanticDomain, id: string, senseIndex: number) {
    this.setState({
      words: this.state.words.map(word => {
        if (word.id === id)
          return {
            ...word,
            senses: word.senses.map((sense, index) => {
              if (index === senseIndex) {
                return {
                  ...sense,
                  domains: [...sense.domains, newDomain]
                };
              } else return sense;
            })
          };
        else return word;
      }),
      edits: [...this.state.edits, id]
    });
  }

  // Removes the specified domain from the word with the specified ID
  deleteDomain(delDomain: SemanticDomain, id: string, senseIndex: number) {
    this.setState({
      words: this.state.words.map(word => {
        if (word.id === id)
          return {
            ...word,
            senses: word.senses.map((sense, index) => {
              if (index === senseIndex)
                return {
                  ...sense,
                  domains: sense.domains.filter(domain => domain !== delDomain)
                };
              else return sense;
            })
          };
        else return word;
      }),
      edits: [...this.state.edits, id]
    });
  }

  render() {
    return (
      <Paper>
        <MaterialTable
          icons={tableIcons}
          title={<Translate id={"viewFinal.title"} />}
          columns={this.COLUMNS}
          data={this.state.words}
        />
        <Button onClick={this.updateFrontierWords}>
          <Translate id="viewFinal.submit" />
        </Button>
      </Paper>
    );
  }
}

export default withLocalize(ViewFinalComponent);
