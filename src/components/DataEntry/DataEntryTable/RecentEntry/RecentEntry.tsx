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
import VernWithSuggestions from "../VernWithSuggestions/VernWithSuggestions";
import DeleteEntry from "./DeleteEntry/DeleteEntry";

interface RecentEntryProps {
  allVerns: string[];
  allWords: Word[];
  entryIndex: number;
  entry: Word;
  updateWord: (
    wordToUpdate: Word,
    wordToDelete: Word,
    senseIndex?: number
  ) => void;
  removeWord: (word: Word) => void;
  addAudioToWord: (wordId: string, audioFile: File) => void;
  deleteAudioFromWord: (wordId: string, fileName: string) => void;
  semanticDomain: SemanticDomain;
  recorder: Recorder;
  focusNewEntry: () => void;
}

interface RecentEntryState {
  recentEntry: Word;
  isDupVern: boolean;
  wordId?: string;
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
  senseIndex: number
): Word {
  if (senseIndex >= existingWord.senses.length) {
    throw new Error("senseIndex too large");
  } else {
    const oldSense: Sense = existingWord.senses[senseIndex];
    let updatedDomains: SemanticDomain[] = [...oldSense.semanticDomains];
    updatedDomains.push(semanticDomain);
    const updatedSense: Sense = {
      ...oldSense,
      semanticDomains: updatedDomains,
    };
    let updatedSenses: Sense[] = existingWord.senses;
    updatedSenses.splice(senseIndex, 1, updatedSense);
    const updatedWord: Word = { ...existingWord, senses: updatedSenses };
    return updatedWord;
  }
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
export default class RecentEntry extends React.Component<
  RecentEntryProps,
  RecentEntryState
> {
  constructor(props: RecentEntryProps) {
    super(props);

    this.state = {
      recentEntry: { ...props.entry },
      isDupVern: false,
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

  addSemanticDomain(existingWord: Word, senseIndex: number) {
    let updatedWord: Word = addSemanticDomainToSense(
      this.props.semanticDomain,
      existingWord,
      senseIndex
    );
    this.props.updateWord(updatedWord, this.props.entry, senseIndex);
  }

  updateGlossField(newValue: string) {
    this.setState({
      recentEntry: {
        ...this.state.recentEntry,
        senses: [
          {
            ...this.state.recentEntry.senses[0],
            glosses: [{ language: "en", def: newValue }],
          },
        ],
      },
    });
  }

  updateVernField(newValue: string): Word[] {
    var dupVernWords: Word[] = [];
    var isDupVern: boolean = false;
    if (newValue) {
      dupVernWords = this.props.allWords.filter(
        (word: Word) => word.vernacular === newValue
      );
      isDupVern = dupVernWords.length > 0;
    }
    this.setState({
      isDupVern,
      recentEntry: {
        ...this.state.recentEntry,
        vernacular: newValue,
      },
    });
    return dupVernWords;
  }

  updateWordId(wordId?: string) {
    this.setState({ wordId });
  }

  removeEntry() {
    this.props.removeWord(this.props.entry);
  }

  conditionallyUpdateWord() {
    if (!wordsAreEqual(this.state.recentEntry, this.props.entry)) {
      this.props.updateWord(this.state.recentEntry, this.props.entry);
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
            <VernWithSuggestions
              vernacular={this.state.recentEntry.vernacular}
              updateVernField={(newValue: string) =>
                this.updateVernField(newValue)
              }
              updateWordId={(wordId?: string) => this.updateWordId(wordId)}
              allVerns={this.props.allVerns}
              onBlur={() => {
                if (!this.state.isDupVern || this.state.wordId !== undefined) {
                  this.conditionallyUpdateWord();
                }
              }}
              handleEnter={() => {}}
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
                this.state.recentEntry.senses &&
                this.state.recentEntry.senses[0] &&
                this.state.recentEntry.senses[0].glosses &&
                this.state.recentEntry.senses[0].glosses[0]
                  ? this.state.recentEntry.senses[0].glosses[0].def
                  : ""
              }
              updateGlossField={(newValue: string) =>
                this.updateGlossField(newValue)
              }
              onBlur={() => {
                this.conditionallyUpdateWord();
              }}
              handleEnter={() => {
                this.focusOnNewEntry();
                //TODO: check for empty gloss
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
              wordId={this.state.recentEntry.id}
              pronunciationFiles={this.state.recentEntry.audio}
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
