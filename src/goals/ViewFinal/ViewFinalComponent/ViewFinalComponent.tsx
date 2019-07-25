import React from "react";
import MaterialTable from "material-table";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { Paper } from "@material-ui/core";

import { Word, SemanticDomain, State, Sense } from "../../../types/word";
import tableIcons from "./icons";
import * as backend from "../../../backend";
import columns from "./CellComponents/CellColumns";
import { uuid } from "../../../utilities";

// Component state/props
interface ViewFinalProps {
  // Props mapped to store
  language: string;
  words: ViewFinalWord[];

  // Dispatch changes
  updateAllWords: (words: ViewFinalWord[]) => void;
  updateFrontierWord: (
    newData: ViewFinalWord,
    oldData: ViewFinalWord,
    language: string
  ) => Promise<void>;
}

interface ViewFinalState {
  editingField: boolean;
}

export interface ViewFinalWord {
  id: string;
  vernacular: string;
  senses: ViewFinalSense[];
}
export interface ViewFinalSense {
  senseId: string;
  glosses: string;
  domains: SemanticDomain[];
  deleted: boolean;
}

// Constants
export const OLD_SENSE: string = "-old";
export const SEP_CHAR: string = ",";
const SEPARATOR: string = SEP_CHAR + " ";
const ROWS_PER_PAGE: number[] = [10, 100, 1000];

export class ViewFinalComponent extends React.Component<
  ViewFinalProps & LocalizeContextProps,
  ViewFinalState
> {
  constructor(props: ViewFinalProps & LocalizeContextProps) {
    super(props);

    this.state = {
      editingField: false
    };
  }

  componentDidMount() {
    backend
      .getFrontierWords()
      .then((frontier: Word[]) => this.updateLocalWords(frontier));
  }

  // Creates the local set of words from the frontier
  private updateLocalWords(frontier: Word[]) {
    let newWords: ViewFinalWord[] = [];
    let currentWord: ViewFinalWord;

    for (let word of frontier) {
      // Bypass deleted words
      if (word.accessability === State.deleted) continue;

      // Create a new currentword
      currentWord = {
        id: word.id,
        vernacular: word.vernacular,
        senses: []
      };

      for (let sense of word.senses) {
        currentWord.senses.push(this.parseSense(sense));
      }

      // Remove the trailing newlines + push to newWords
      newWords.push(currentWord);
    }
    this.props.updateAllWords(newWords);
  }

  // Convert a Sense into a ViewFinalSense
  private parseSense(sense: Sense) {
    let hasGloss: boolean;
    let currentSense: ViewFinalSense = {
      glosses: "",
      domains: [],
      deleted:
        sense.accessibility !== undefined &&
        sense.accessibility === State.deleted,
      senseId: uuid() + OLD_SENSE
    };

    // Add domains
    if (sense.semanticDomains)
      currentSense = {
        ...currentSense,
        domains: [...sense.semanticDomains]
      };

    // Find all glosses in the current language
    hasGloss = false;
    if (sense.glosses)
      for (let gloss of sense.glosses)
        if (gloss.language === this.props.language) {
          hasGloss = true;
          currentSense.glosses += gloss.def + SEPARATOR;
        }

    // Format the glosses + push them
    if (hasGloss)
      currentSense.glosses = currentSense.glosses.slice(0, -SEPARATOR.length);
    else currentSense.glosses = "";

    return currentSense;
  }

  // Remove the duplicates from an array; sugar syntax, as the place it's used is already hideous enough without adding more
  private removeDuplicates(array: any[]) {
    return [...new Set(array)];
  }

  render() {
    return (
      <div>
        <MaterialTable
          icons={tableIcons}
          title={<Translate id={"viewFinal.title"} />}
          columns={columns}
          data={this.props.words.map(word => ({
            ...word,
            senses: word.senses.filter(sense => !sense.deleted)
          }))}
          editable={{
            onRowUpdate: (newData: ViewFinalWord, oldData: ViewFinalWord) =>
              new Promise(async resolve => {
                // Update database + update word ID. Awaited so that the user can't edit + submit a word with a bad ID before the ID is updated
                await this.props.updateFrontierWord(
                  newData,
                  oldData,
                  this.props.language
                );
                setTimeout(() => {
                  resolve();
                }, 500);
              })
          }}
          options={{
            filtering: true,
            pageSize: Math.min(this.props.words.length, ROWS_PER_PAGE[0]),
            pageSizeOptions: this.removeDuplicates([
              Math.min(this.props.words.length, ROWS_PER_PAGE[0]),
              Math.min(this.props.words.length, ROWS_PER_PAGE[1]),
              Math.min(this.props.words.length, ROWS_PER_PAGE[2])
            ])
          }}
        />
      </div>
    );
  }
}

export default withLocalize(ViewFinalComponent);
