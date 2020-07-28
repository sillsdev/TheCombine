import { Grid } from "@material-ui/core";
import React from "react";

import DuplicateFinder from "../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
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
import { DuplicateResolutionView } from "../DuplicateResolutionView/DuplicateResolutionView";
import GlossWithSuggestions from "../GlossWithSuggestions/GlossWithSuggestions";
import DeleteEntry from "./DeleteEntry/DeleteEntry";
import ExistingVernacular from "./ExistingVernacular/ExistingVernacular";

interface ExistingEntryProps {
  wordsBeingAdded: Word[];
  existingWords: Word[];
  entryIndex: number;
  entry: Word;
  updateWord: (wordToUpdate: Word, wordToDelete?: Word) => void;
  removeWord: (word: Word) => void;
  addAudioToWord: (wordId: string, audioFile: File) => void;
  deleteAudioFromWord: (wordId: string, fileName: string) => void;
  semanticDomain: SemanticDomain;
  displayDuplicates: boolean;
  toggleDisplayDuplicates: () => void;
  recorder: Recorder;
  focusNewEntry: () => void;
}

interface ExistingEntryState {
  displayDuplicates: boolean;
  existingEntry: Word;
  duplicateIds?: string[];
  duplicates?: Word[];
  isDuplicate: boolean;
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

export function duplicatesFromFrontier(
  existingWords: Word[],
  vernacular: string,
  maximum: number,
  entryToExclude?: string
): string[] {
  let Finder: DuplicateFinder = new DuplicateFinder();

  let duplicateWords: [string, number][] = [];
  for (const word of existingWords) {
    let accessible: boolean = false;
    for (const sense of word.senses) {
      if (sense.accessibility === 0) {
        accessible = true;
        break;
      }
    }
    if (accessible) {
      const levenD: number = Finder.getLevenshteinDistance(
        vernacular,
        word.vernacular
      );
      // 2 here is the maximum acceptable score
      if (
        levenD < 2 &&
        (entryToExclude === undefined || word.id !== entryToExclude)
      ) {
        duplicateWords.push([word.id, levenD]);
      }
    }
  }

  let sorted: [string, number][] = duplicateWords.sort((a, b) => a[1] - b[1]);
  sorted.length = Math.min(duplicateWords.length, maximum);
  return sorted.map((item) => item[0]);
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
  readonly maxDuplicates: number = 5;
  constructor(props: ExistingEntryProps) {
    super(props);

    let possibleDups: string[] = duplicatesFromFrontier(
      props.existingWords,
      props.entry.vernacular,
      this.maxDuplicates,
      props.entry.id
    );
    let isDuplicate: boolean = possibleDups.length > 0;
    let duplicateWords: Word[] | undefined;
    if (isDuplicate) {
      duplicateWords = props.existingWords.filter((word) =>
        possibleDups.includes(word.id)
      );
    }

    this.state = {
      displayDuplicates: false,
      existingEntry: { ...props.entry },
      isDuplicate: isDuplicate,
      duplicates: duplicateWords,
      duplicateIds: possibleDups,
      hovering: false,
    };
    this.duplicateInput = React.createRef<HTMLDivElement>();
  }

  duplicateInput: React.RefObject<HTMLDivElement>;

  componentDidMount() {
    let possibleDups = duplicatesFromFrontier(
      this.props.existingWords,
      this.props.entry.vernacular,
      this.maxDuplicates,
      this.props.entry.id
    );
    let isDuplicate: boolean = possibleDups.length > 0;
    let duplicateIds: string[] | undefined;
    let duplicateWords: Word[] | undefined;
    if (isDuplicate) {
      duplicateIds = possibleDups;
      duplicateWords = this.props.existingWords.filter((word) =>
        duplicateIds!.includes(word.id)
      );
    }

    this.setState({
      isDuplicate,
      duplicateIds,
      duplicates: duplicateWords,
    });
  }

  toggleDuplicateResolutionView() {
    this.props.toggleDisplayDuplicates();
  }

  addNewSense(existingWord: Word, newSense: string) {
    let updatedWord: Word = addSenseToWord(
      this.props.semanticDomain,
      existingWord,
      newSense
    );
    if (!this.state.duplicates) {
      return;
    }
    this.props.updateWord(updatedWord, this.props.entry);
    this.props.toggleDisplayDuplicates();
    this.setState({
      displayDuplicates: false,
      isDuplicate: false,
      duplicates: undefined,
      duplicateIds: undefined,
    });
  }

  addSemanticDomain(existingWord: Word, sense: Sense, index: number) {
    let updatedWord: Word = addSemanticDomainToSense(
      this.props.semanticDomain,
      existingWord,
      sense,
      index
    );
    if (!this.state.duplicates) {
      return;
    }
    this.props.updateWord(updatedWord, this.props.entry);
    this.props.toggleDisplayDuplicates();
    this.setState({
      displayDuplicates: false,
      isDuplicate: false,
      duplicates: undefined,
      duplicateIds: undefined,
    });
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
    let possibleDups: string[] = duplicatesFromFrontier(
      this.props.existingWords,
      newValue,
      this.maxDuplicates,
      this.props.entry.id
    );
    let isDuplicate: boolean = possibleDups.length > 0;

    if (isDuplicate) {
      let duplicateWords:
        | Word[]
        | undefined = this.props.existingWords.filter((word) =>
        possibleDups.includes(word.id)
      );
      this.setState({
        isDuplicate: true,
        duplicateIds: possibleDups,
        duplicates: duplicateWords,
      });
    }
    this.setState({
      existingEntry: {
        ...this.state.existingEntry,
        vernacular: newValue,
      },
      displayDuplicates:
        this.state.displayDuplicates && isDuplicate
          ? this.state.displayDuplicates
          : false,
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
            <ExistingVernacular
              vernacular={this.state.existingEntry.vernacular}
              isDuplicate={
                this.state.displayDuplicates && this.state.isDuplicate
              }
              toggleDuplicateResolutionView={() =>
                this.toggleDuplicateResolutionView()
              }
              updateField={(newValue: string) => this.updateVernField(newValue)}
              updateWord={() => this.conditionallyUpdateWord()}
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
              onBlur={(newValue: string) => {
                this.updateGlossField(newValue);
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
        {this.props.displayDuplicates &&
          this.state.isDuplicate &&
          this.state.duplicates &&
          this.state.duplicates.map((duplicate) => (
            <DuplicateResolutionView
              existingEntry={duplicate}
              newSense={
                this.state.existingEntry.senses &&
                this.state.existingEntry.senses[0] &&
                this.state.existingEntry.senses[0].glosses &&
                this.state.existingEntry.senses[0].glosses[0]
                  ? this.state.existingEntry.senses[0].glosses[0].def
                  : ""
              }
              addSense={(existingWord: Word, newSense: string) =>
                this.addNewSense(existingWord, newSense)
              }
              addSemanticDomain={(
                existingWord: Word,
                sense: Sense,
                index: number
              ) => this.addSemanticDomain(existingWord, sense, index)}
              duplicateInput={this.duplicateInput}
            />
          ))}
      </Grid>
    );
  }
}
