import React from "react";
import MaterialTable from "material-table";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { Paper } from "@material-ui/core";

import { Word, SemanticDomain, State } from "../../../types/word";
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
const NO_GLOSS: string = "{No gloss}";

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
      // Bypass deleted words
      if (word.accessability === State.deleted) continue;

      // Create a new currentword
      currentWord = {
        id: word.id,
        vernacular: word.vernacular,
        senses: []
      };

      for (let sense of word.senses) {
        debugger;
        // Create dummy sense
        currentSense = {
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
    this.props.updateAllWords(newWords);
  }

  render() {
    return (
      <Paper>
        <MaterialTable
          icons={tableIcons}
          title={<Translate id={"viewFinal.title"} />}
          columns={columns}
          data={this.props.words.map(word => {
            return {
              ...word,
              senses: word.senses.filter(sense => !sense.deleted)
            };
          })}
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
            filtering: true
          }}
        />
      </Paper>
    );
  }
}

export default withLocalize(ViewFinalComponent);
