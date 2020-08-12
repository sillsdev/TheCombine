import { Grid } from "@material-ui/core";
import React from "react";

import theme from "../../../../types/theme";
import {
  Gloss,
  SemanticDomain,
  Sense,
  State,
  Word,
} from "../../../../types/word";
import Pronunciations from "../../../Pronunciations/PronunciationsComponent";
import Recorder from "../../../Pronunciations/Recorder";
import GlossWithSuggestions from "../GlossWithSuggestions/GlossWithSuggestions";
import NewVernEntry from "../NewEntry/NewVernEntry/NewVernEntry";
import DeleteEntry from "./DeleteEntry/DeleteEntry";

interface ExistingEntryProps {
  existingWords: Word[];
  entryIndex: number;
  entry: Word;
  updateWord: (wordToUpdate: Word, wordToDelete?: Word) => void;
  removeWord: (word: Word) => void;
  addAudioToWord: (wordId: string, audioFile: File) => void;
  deleteAudioFromWord: (wordId: string, fileName: string) => void;
  semanticDomain: SemanticDomain;
  recorder: Recorder;
  focusNewEntry: () => void;
}

interface ExistingEntryState {
  existingEntry: Word;
  isNew: boolean;
  hovering: boolean;
}

export function addSenseToWord(
  semanticDomain: SemanticDomain,
  existingWord: Word,
  gloss: string
): Word {
  let updatedWord: Word = { ...existingWord };

  let newGloss: Gloss = {
    language: "en",
    def: gloss,
  };

  let newSense: Sense = {
    glosses: [newGloss],
    semanticDomains: [semanticDomain],
    accessibility: State.active,
  };

  updatedWord.senses.push(newSense); // Fix which sense we are adding to
  return updatedWord;
}

export function addSemanticDomainToSense(
  semanticDomain: SemanticDomain,
  existingWord: Word,
  sense: Sense,
  index: number
): Word {
  let updatedWord: Word = { ...existingWord };
  let newSense: Sense = {
    ...sense,
    semanticDomains: [...sense.semanticDomains, semanticDomain],
  };
  let updatedSenses: Sense[] = updateSenses(
    existingWord.senses,
    newSense,
    index
  );
  updatedWord.senses = updatedSenses;
  return updatedWord;
}

function updateSenses(
  senses: Sense[],
  senseToUpdate: Sense,
  index: number
): Sense[] {
  let updatedSenses: Sense[] = [...senses];
  updatedSenses.splice(index, 1, senseToUpdate);
  return updatedSenses;
}

// extract, or remove altogether
function wordsAreEqual(a: Word, b: Word): boolean {
  return (
    a.vernacular === b.vernacular &&
    a.senses[0].glosses[0].def === b.senses[0].glosses[0].def
  );
}

/**
 * Displays a word a user can still make edits to
 */
export class ExistingEntry extends React.Component<
  ExistingEntryProps,
  ExistingEntryState
> {
  constructor(props: ExistingEntryProps) {
    super(props);

    this.state = {
      existingEntry: { ...props.entry },
      isNew: true,
      hovering: false,
    };
  }

  addNewSense(existingWord: Word, newSense: string) {
    let updatedWord: Word = addSenseToWord(
      this.props.semanticDomain,
      existingWord,
      newSense
    );
    this.props.updateWord(updatedWord, this.props.entry);
  }

  addSemanticDomain(existingWord: Word, sense: Sense, index: number) {
    let updatedWord: Word = addSemanticDomainToSense(
      this.props.semanticDomain,
      existingWord,
      sense,
      index
    );
    this.props.updateWord(updatedWord, this.props.entry);
  }

  updateGlossField(newValue: string) {
    this.setState({
      existingEntry: {
        ...this.state.existingEntry,
        senses: [
          {
            ...this.state.existingEntry.senses[0],
            glosses: [{ language: "en", def: newValue }],
          },
        ],
      },
    });
  }

  updateVernField(newValue: string) {
    this.setState({
      existingEntry: {
        ...this.state.existingEntry,
        vernacular: newValue,
      },
    });
  }

  removeEntry() {
    this.props.removeWord(this.props.entry);
  }

  conditionallyUpdateWord() {
    if (!wordsAreEqual(this.props.entry, this.state.existingEntry)) {
      this.props.updateWord(this.state.existingEntry);
    }
  }

  focusOnNewEntry = () => {
    this.props.focusNewEntry();
    //reference NewEntry's focus thing here
  };

  render() {
    return (
      <Grid item xs={12} key={this.props.entryIndex}>
        <Grid
          container
          onMouseEnter={() => this.setState({ hovering: true })}
          onMouseLeave={() => this.setState({ hovering: false })}
          onKeyUp={(e) => {
            if (e.key === "Enter" && this.state.existingEntry.vernacular) {
              this.focusOnNewEntry();
            }
          }}
        >
          <Grid
            item
            xs={4}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative",
            }}
          >
            <NewVernEntry
              vernacular={this.state.existingEntry.vernacular}
              updateVernField={(newValue: string) =>
                this.updateVernField(newValue)
              }
              allWords={this.props.existingWords}
              onBlur={() => this.conditionallyUpdateWord()}
            />
          </Grid>
          <Grid
            item
            xs={4}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative",
            }}
          >
            <GlossWithSuggestions
              gloss={
                this.state.existingEntry.senses &&
                this.state.existingEntry.senses[0] &&
                this.state.existingEntry.senses[0].glosses &&
                this.state.existingEntry.senses[0].glosses[0]
                  ? this.state.existingEntry.senses[0].glosses[0].def
                  : ""
              }
              updateGlossField={(newValue: string) =>
                this.updateGlossField(newValue)
              }
              onBlur={() => {
                this.conditionallyUpdateWord();
              }}
            />
          </Grid>
          <Grid
            item
            xs={3}
            style={{
              paddingLeft: theme.spacing(1),
              paddingRight: theme.spacing(1),
              position: "relative",
            }}
          >
            <Pronunciations
              wordId={this.state.existingEntry.id}
              pronunciationFiles={this.state.existingEntry.audio}
              recorder={this.props.recorder}
              deleteAudio={(wordId: string, fileName: string) => {
                this.props.deleteAudioFromWord(wordId, fileName);
              }}
              uploadAudio={(wordId: string, audioFile: File) => {
                this.props.addAudioToWord(wordId, audioFile);
              }}
            />
          </Grid>
          <Grid
            item
            xs={1}
            style={{
              paddingLeft: theme.spacing(1),
              paddingRight: theme.spacing(1),
              position: "relative",
            }}
          >
            {this.state.hovering && (
              <DeleteEntry removeEntry={() => this.removeEntry()} />
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
