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
  senseIndex: number;
  updateWord: (
    wordToUpdate: Word,
    wordToDelete: Word,
    senseIndex?: number
  ) => void;
  updateSense: (
    oldWord: Word,
    senseIndex: number,
    updatedSense: Sense,
    updatedVernacular: string,
    targetWordId?: string
  ) => void;
  removeEntry: () => void;
  addAudioToWord: (wordId: string, audioFile: File) => void;
  deleteAudioFromWord: (wordId: string, fileName: string) => void;
  semanticDomain: SemanticDomain;
  recorder: Recorder;
  focusNewEntry: () => void;
}

interface RecentEntryState {
  sense: Sense;
  vernacular: string;
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

/**
 * Displays a word a user can still make edits to
 */
export default class RecentEntry extends React.Component<
  RecentEntryProps,
  RecentEntryState
> {
  constructor(props: RecentEntryProps) {
    super(props);

    let sense: Sense = { ...props.entry.senses[props.senseIndex] };
    if (sense.glosses.length < 1) sense.glosses.push({ def: "", language: "" });

    this.state = {
      sense: sense,
      vernacular: props.entry.vernacular,
      isDupVern: false,
      hovering: false,
    };
  }

  updateGlossField(newValue: string) {
    const newGloss: Gloss = { ...this.state.sense.glosses[0], def: newValue };
    const sense: Sense = { ...this.state.sense, glosses: [newGloss] };
    this.setState({ sense });
  }

  updateVernField(newValue?: string): Word[] {
    var vernacular: string = "";
    var dupVernWords: Word[] = [];
    var isDupVern: boolean = false;
    if (newValue) {
      vernacular = newValue;
      dupVernWords = this.props.allWords.filter(
        (word: Word) => word.vernacular === newValue
      );
      isDupVern = dupVernWords.length > 0;
    }
    this.setState({
      isDupVern,
      vernacular,
    });
    return dupVernWords;
  }

  updateWordId(wordId?: string) {
    this.setState({ wordId });
  }

  conditionallyUpdateWord() {
    if (this.isSenseUpdated()) {
      //this.props.updateWord(this.props.entry, this.state.sense);
      this.props.updateSense(
        this.props.entry,
        this.props.entryIndex,
        this.state.sense,
        this.state.vernacular,
        this.state.wordId
      );
    }
  }

  isSenseUpdated() {
    if (this.props.entry.vernacular !== this.state.vernacular) return true;
    if (
      this.props.entry.senses[this.props.senseIndex].glosses[0].def !==
      this.state.sense.glosses[0].def
    )
      return true;
    if (this.state.wordId) return true;
    return false;
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
              vernacular={this.state.vernacular}
              isDisabled={this.props.entry.senses.length > 1}
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
              handleEnterAndTab={() => {}}
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
              gloss={this.state.sense.glosses[0].def!}
              updateGlossField={(newValue: string) =>
                this.updateGlossField(newValue)
              }
              onBlur={() => {
                this.conditionallyUpdateWord();
              }}
              handleEnterAndTab={() => {
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
              wordId={this.props.entry.id}
              senseIndex={this.props.senseIndex}
              pronunciationFiles={this.props.entry.audio}
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
              <DeleteEntry removeEntry={() => this.props.removeEntry()} />
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
