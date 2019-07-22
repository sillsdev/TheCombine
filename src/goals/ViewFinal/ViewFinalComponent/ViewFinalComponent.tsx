import React from "react";
import MaterialTable from "material-table";
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
  // Props mapped to store
  language: string;
  words: ViewFinalWord[];
  edits: string[];

  // Dispatch changes
  updateVernacular: (id: string, newVernacular: string) => void;
  updateGlosses: (id: string, editIndex: number, newGlosses: string) => void;
  addDomain: (
    id: string,
    senseIndex: number,
    newDomain: SemanticDomain
  ) => void;
  deleteDomain: (
    id: string,
    senseIndex: number,
    delDomain: SemanticDomain
  ) => void;
  addSense: (id: string) => void;
  deleteSense: (id: string, deleteIndex: number) => void;
  updateWords: (words: ViewFinalWord[], frontier?: Word[]) => void;
}

interface ViewFinalState {
  addingSenseToWord: boolean;
  wordToEdit: ViewFinalWord;
}

export interface ViewFinalWord {
  id: string;
  vernacular: string;
  senses: ViewFinalSense[];
}
export interface ViewFinalSense {
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
      render: (rowData: ViewFinalWord) => this.senseField(rowData),
      customFilterAndSearch: (
        term: string,
        rowData: ViewFinalWord
      ): boolean => {
        let regex: RegExp = new RegExp(term);
        debugger;
        for (let sense of rowData.senses)
          if (regex.exec(sense.glosses) !== null) return true;
        return false;
      }
    },
    {
      title: "Domains",
      field: "domains",
      render: (rowData: ViewFinalWord) => (
        <DomainCell
          rowData={rowData}
          addDomain={this.props.addDomain}
          deleteDomain={this.props.deleteDomain}
        />
      ),
      customFilterAndSearch: (
        term: string,
        rowData: ViewFinalWord
      ): boolean => {
        let regex: RegExp = new RegExp(term);
        for (let sense of rowData.senses)
          for (let domain of sense.domains)
            if (
              regex.exec(domain.name) !== null ||
              regex.exec(domain.number) !== null
            )
              return true;
        return false;
      }
    },
    {
      title: "",
      field: "id",
      render: (rowData: ViewFinalWord) => (
        <DeleteCell rowData={rowData} delete={this.props.deleteSense} />
      )
    }
  ];

  constructor(props: ViewFinalProps & LocalizeContextProps) {
    super(props);

    // TODO: Make this default to the current user's language
    this.senseField = this.senseField.bind(this);
    this.vernacularField = this.vernacularField.bind(this);
    this.updateFrontierWords = this.updateFrontierWords.bind(this);

    this.state = {
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
          glosses: "",
          domains: [...sense.semanticDomains]
        };

        // Find all glosses in the current language
        hasGloss = false;
        for (let gloss of sense.glosses)
          if (gloss.language === this.props.language) {
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
    this.props.updateWords(newWords, frontier);
  }

  // Updates the frontier from the local word set
  private async updateFrontierWords() {
    let editWord: Word;
    let editSource: ViewFinalWord;
    let edits: string[] = Array.from(new Set(this.props.edits));
    let senseHandle: ViewFinalSense | Sense;

    for (let edit of edits) {
      editWord = await backend.getWord(edit);
      editSource = this.props.words.find(
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
              return { language: this.props.language, def: value.trim() };
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
        glosses[superIndex].language !== this.props.language
      )
        superIndex++;

      // Add the new entry
      glosses[superIndex] = {
        language: this.props.language,
        def: glossBuffer[glossIndex]
      };
      superIndex++;
      glossIndex++;
    }

    // Remove dead glosses; superIndex is the index of the last valid gloss, so one beyond it
    return glosses.slice(0, superIndex);
  }

  // Create the vernacular text field
  private vernacularField(rowData: ViewFinalWord) {
    return (
      <TextField
        value={rowData.vernacular}
        onChange={event =>
          this.props.updateVernacular(rowData.id, event.target.value)
        }
      />
    );
  }

  // Create the sense edit fields
  private senseField(rowData: ViewFinalWord) {
    return (
      <AlignedList
        contents={rowData.senses.map((value, index) => (
          <TextField
            value={value.glosses}
            onChange={event =>
              this.props.updateGlosses(rowData.id, index, event.target.value)
            }
          />
        ))}
        bottomCell={
          <Chip
            label={<Add />}
            onClick={() => this.props.addSense(rowData.id)}
          />
        }
      />
    );
  }

  render() {
    return (
      <Paper>
        <MaterialTable
          icons={tableIcons}
          title={<Translate id={"viewFinal.title"} />}
          columns={this.COLUMNS}
          data={this.props.words}
        />
        <Button onClick={this.updateFrontierWords}>
          <Translate id="viewFinal.submit" />
        </Button>
      </Paper>
    );
  }
}

export default withLocalize(ViewFinalComponent);
