import { Button, Grid, Typography } from "@material-ui/core";
import { List as ListIcon } from "@material-ui/icons";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import * as Backend from "../../../backend";
import DomainTree from "../../../types/SemanticDomain";
import theme from "../../../types/theme";
import {
  Gloss,
  SemanticDomain,
  Sense,
  simpleWord,
  State,
  Word,
} from "../../../types/word";
import { getFileNameForWord } from "../../Pronunciations/AudioRecorder";
import Recorder from "../../Pronunciations/Recorder";
import NewEntry from "./NewEntry/NewEntry";
import RecentEntry from "./RecentEntry/RecentEntry";

interface DataEntryTableProps {
  domain: DomainTree;
  semanticDomain: SemanticDomain;
  displaySemanticDomainView: (isGettingSemanticDomain: boolean) => void;
  getWordsFromBackend: () => Promise<Word[]>;
  showExistingData: () => void;
  isSmallScreen: boolean;
  hideQuestions: () => void;
}

interface WordAccess {
  word: Word;
  senseIndex: number;
}

interface DataEntryTableState {
  existingVerns: string[];
  existingWords: Word[];
  recentlyAddedWords: WordAccess[];
  isReady: boolean;
}

async function addAudiosToBackend(
  wordId: string,
  audioURLs: string[]
): Promise<string> {
  let updatedWordId: string = wordId;
  let audioBlob: Blob;
  let fileName: string;
  let audioFile: File;
  for (const audioURL of audioURLs) {
    audioBlob = await fetch(audioURL).then((result) => result.blob());
    fileName = getFileNameForWord(updatedWordId);
    audioFile = new File([audioBlob], fileName, {
      type: audioBlob.type,
      lastModified: Date.now(),
    });
    updatedWordId = await Backend.uploadAudio(updatedWordId, audioFile);
    URL.revokeObjectURL(audioURL);
  }
  return updatedWordId;
}

export function addSemanticDomainToSense(
  semanticDomain: SemanticDomain,
  existingWord: Word,
  senseIndex: number
): Word {
  if (senseIndex >= existingWord.senses.length) {
    throw new RangeError("senseIndex too large");
  } else {
    const oldSense: Sense = existingWord.senses[senseIndex];
    const updatedDomains: SemanticDomain[] = [...oldSense.semanticDomains];
    updatedDomains.push(semanticDomain);
    const updatedSense: Sense = {
      ...oldSense,
      semanticDomains: updatedDomains,
    };
    const updatedSenses: Sense[] = existingWord.senses;
    updatedSenses.splice(senseIndex, 1, updatedSense);
    const updatedWord: Word = { ...existingWord, senses: updatedSenses };
    return updatedWord;
  }
}

export function addSenseToWord(
  semanticDomain: SemanticDomain,
  existingWord: Word,
  gloss: string
): Word {
  const updatedWord: Word = { ...existingWord };

  //ToDo: Use analysis language from project instead of "en"
  const newGloss: Gloss = {
    language: "en",
    def: gloss,
  };

  const newSense: Sense = {
    glosses: [newGloss],
    semanticDomains: [semanticDomain],
    accessibility: State.active,
  };

  updatedWord.senses.push(newSense); // Fix which sense we are adding to
  return updatedWord;
}

/**
 * A data entry table containing word entries
 */
export class DataEntryTable extends React.Component<
  DataEntryTableProps & LocalizeContextProps,
  DataEntryTableState
> {
  constructor(props: DataEntryTableProps & LocalizeContextProps) {
    super(props);
    this.state = {
      existingVerns: [],
      existingWords: [],
      recentlyAddedWords: [],
      isReady: false,
    };
    this.refNewEntry = React.createRef<NewEntry>();
    this.recorder = new Recorder();
  }
  refNewEntry: React.RefObject<NewEntry>;
  recorder: Recorder;

  async componentDidMount() {
    await this.updateExisting();
  }

  /** Finished with this page of words, select new semantic domain */
  // TODO: Implement
  submit(e?: React.FormEvent<HTMLFormElement>, _c?: Function) {
    if (e) e.preventDefault();
  }

  async addNewWord(wordToAdd: Word, audioURLs: string[], insertIndex?: number) {
    const newWord: Word = await Backend.createWord(wordToAdd);
    const wordId: string = await addAudiosToBackend(newWord.id, audioURLs);
    const newWordWithAudio: Word = await Backend.getWord(wordId);
    await this.updateExisting();

    const recentlyAddedWords: WordAccess[] = [...this.state.recentlyAddedWords];
    const newWordAccess: WordAccess = {
      word: newWordWithAudio,
      senseIndex: 0,
    };
    if (insertIndex !== undefined && insertIndex < recentlyAddedWords.length) {
      recentlyAddedWords.splice(insertIndex, 0, newWordAccess);
    } else {
      recentlyAddedWords.push(newWordAccess);
    }
    this.setState({ recentlyAddedWords });
  }

  /** Update the word in the backend and the frontend */
  async updateWordForNewEntry(
    wordToUpdate: Word,
    senseIndex: number,
    audioURLs: string[]
  ) {
    let existingWord: Word | undefined = this.state.existingWords.find(
      (word) => word.id === wordToUpdate.id
    );
    if (!existingWord)
      throw new Error("You are trying to update a nonexistent word");

    let updatedWord: Word = await this.updateWordInBackend(wordToUpdate);
    let updatedWordId: string = await addAudiosToBackend(
      updatedWord.id,
      audioURLs
    );
    updatedWord = await Backend.getWord(updatedWordId);

    let recentlyAddedWords: WordAccess[] = [...this.state.recentlyAddedWords];
    let updatedWordAccess: WordAccess = {
      word: updatedWord,
      senseIndex: senseIndex,
    };
    recentlyAddedWords.push(updatedWordAccess);

    this.setState({ recentlyAddedWords }, () => {
      this.replaceInDisplay(wordToUpdate.id, updatedWord);
    });
  }

  // Checks if sense already exists with this gloss and semantic domain
  // returns false if encounters duplicate
  async updateWordWithNewGloss(
    wordId: string,
    gloss: string,
    audioFileURLs: string[] = []
  ): Promise<boolean> {
    let existingWord: Word | undefined = this.state.existingWords.find(
      (word: Word) => word.id === wordId
    );
    if (!existingWord)
      throw new Error(
        "Attempting to edit an existing word but did not find one"
      );

    let sense: Sense;
    for (
      let senseIndex = 0;
      senseIndex < existingWord.senses.length;
      senseIndex++
    ) {
      sense = existingWord.senses[senseIndex];
      if (
        sense.glosses &&
        sense.glosses.length &&
        sense.glosses[0].def === gloss
      ) {
        if (
          sense.semanticDomains
            .map((semanticDomain) => semanticDomain.id)
            .includes(this.props.semanticDomain.id)
        ) {
          // User is trying to add a sense that already exists
          alert("This sense already exists for this domain");
          return false;
        } else {
          let updatedWord = addSemanticDomainToSense(
            this.props.semanticDomain,
            existingWord!, // Existing word already null checked
            senseIndex
          );
          await this.updateWordForNewEntry(
            updatedWord,
            senseIndex,
            audioFileURLs
          );
          return true;
        }
      }
    }
    // The gloss is new for this word, so add a new sense.
    const updatedWord = addSenseToWord(
      this.props.semanticDomain,
      existingWord,
      gloss
    );
    await this.updateWordForNewEntry(
      updatedWord,
      updatedWord.senses.length - 1, // Was added at the end of the sense list
      audioFileURLs
    );
    return true;
  }

  async addAudioToRecentWord(oldWordId: string, audioFile: File) {
    await Backend.uploadAudio(oldWordId, audioFile).then(
      async (newWordId: string) => {
        await Backend.getWord(newWordId).then((newWord: Word) => {
          this.replaceInDisplay(oldWordId, newWord);
        });
      }
    );
  }

  async deleteAudioFromRecentWord(oldWordId: string, fileName: string) {
    await Backend.deleteAudio(oldWordId, fileName).then(
      async (newWordId: string) => {
        await Backend.getWord(newWordId).then((newWord: Word) => {
          this.replaceInDisplay(oldWordId, newWord);
        });
      }
    );
  }

  async updateWordInBackend(wordToUpdate: Word): Promise<Word> {
    let updatedWord: Word = await Backend.updateWord(wordToUpdate);
    await this.updateExisting();
    return updatedWord;
  }

  async updateExisting() {
    const existingWords: Word[] = await this.props.getWordsFromBackend();
    const existingVerns: string[] = [
      ...new Set(existingWords.map((word: Word) => word.vernacular)),
    ];
    this.setState({ existingVerns, existingWords });
  }

  async undoRecentEntry(entryIndex: number): Promise<string> {
    if (entryIndex >= this.state.recentlyAddedWords.length)
      throw new RangeError("Entry doesn't exist in recent entries.");
    const recentEntry: WordAccess = this.state.recentlyAddedWords[entryIndex];

    // Copy all the parts we need
    const recentWord: Word = { ...recentEntry.word };
    const senseCount: number = recentWord.senses.length;
    const senseIndex: number = recentEntry.senseIndex;
    const recentSense: Sense = {
      ...recentWord.senses[senseIndex],
    };

    this.removeRecentEntry(entryIndex);

    if (recentSense.semanticDomains.length > 1) {
      // If there is more than one semantic domain in this sense, only remove the domain
      const updatedSemanticDomains: SemanticDomain[] = recentSense.semanticDomains.filter(
        (semDom: SemanticDomain) => semDom.id !== this.props.semanticDomain.id
      );
      const updatedSense: Sense = {
        ...recentSense,
        semanticDomains: updatedSemanticDomains,
      };
      return await this.updateSense(recentWord, senseIndex, updatedSense);
    } else if (senseCount > 1) {
      // If there is more than one sense in this word, only remove this sense.
      return await this.removeSense(recentWord, senseIndex);
    } else {
      // Since this is the only sense, delete the word.
      await this.deleteWord(recentWord);
      return "";
    }
  }

  async updateRecentEntryVern(
    entryIndex: number,
    newVern: string,
    targetWordId?: string
  ) {
    if (targetWordId !== undefined) {
      throw new Error("VernDialog on RecentEntry is not yet supported.");
    }
    const oldEntry: WordAccess = this.state.recentlyAddedWords[entryIndex];
    const oldWord: Word = oldEntry.word;
    const oldSense: Sense = oldWord.senses[oldEntry.senseIndex];

    if (
      oldWord.senses.length === 1 &&
      oldWord.senses[0].semanticDomains.length === 1
    ) {
      // The word can simply be updated as it stand
      await this.updateVernacular(oldWord, newVern);
    } else {
      // This is a modification that has to be retracted and replaced with a new entry
      const newWord: Word = {
        ...simpleWord(newVern, oldSense.glosses[0].def),
        id: "",
      };
      await this.undoRecentEntry(entryIndex).then(async () => {
        await this.addNewWord(newWord, [], entryIndex);
      });
    }
  }

  async updateRecentEntryGloss(entryIndex: number, newGloss: string) {
    const oldEntry: WordAccess = this.state.recentlyAddedWords[entryIndex];
    const oldWord: Word = oldEntry.word;
    const senseIndex: number = oldEntry.senseIndex;
    const oldSense: Sense = oldWord.senses[senseIndex];
    const oldGloss: Gloss = oldSense.glosses[0];

    if (oldWord.senses.length === 1 && oldSense.semanticDomains.length === 1) {
      // The word can simply be updated as it stand
      const newSense: Sense = {
        ...oldSense,
        glosses: [{ ...oldGloss, def: newGloss }],
      };
      await this.updateSense(oldWord, senseIndex, newSense);
    } else {
      // This is a modification that has to be retracted and replaced with a new entry
      await this.undoRecentEntry(entryIndex).then(async (wordId) => {
        await this.updateWordWithNewGloss(wordId, newGloss, []);
      });
    }
  }

  removeRecentEntry(entryIndex: number) {
    let recentlyAddedWords: WordAccess[] = this.state.recentlyAddedWords;
    recentlyAddedWords.splice(entryIndex, 1);
    this.setState({ recentlyAddedWords });
  }

  // Update a vern in a word and replace every displayed instance of that word.
  async updateVernacular(word: Word, vernacular: string) {
    const updatedWord: Word = { ...word, vernacular };
    await this.updateWordInBackend(updatedWord).then((newWord: Word) =>
      this.replaceInDisplay(word.id, newWord)
    );
  }

  // Update a sense in a word and replace every displayed instance of that word.
  async updateSense(
    word: Word,
    senseIndex: number,
    updatedSense: Sense
  ): Promise<string> {
    let senses: Sense[] = [...word.senses];
    senses.splice(senseIndex, 1, updatedSense);
    const updatedWord: Word = { ...word, senses };
    return await this.updateWordInBackend(updatedWord).then((newWord: Word) => {
      this.replaceInDisplay(word.id, newWord);
      return newWord.id;
    });
  }

  // Remove a sense from a word and replace every displayed instance of that word.
  async removeSense(word: Word, senseIndex: number): Promise<string> {
    let senses: Sense[] = [...word.senses];
    senses.splice(senseIndex, 1);
    const updatedWord: Word = { ...word, senses };
    return await this.updateWordInBackend(updatedWord).then((newWord: Word) => {
      this.replaceInDisplay(word.id, newWord, senseIndex);
      return newWord.id;
    });
  }

  // Replace every displayed instance of a word.
  // If senseIndex is provided, that sense was removed.
  replaceInDisplay(
    oldWordId: string,
    newWord: Word,
    removedSenseIndex?: number
  ) {
    let recentlyAddedWords: WordAccess[] = this.state.recentlyAddedWords;
    recentlyAddedWords.forEach((entry: WordAccess, index: number) => {
      if (entry.word.id === oldWordId) {
        let newSenseIndex: number = entry.senseIndex;
        if (
          removedSenseIndex !== undefined &&
          newSenseIndex >= removedSenseIndex
        ) {
          newSenseIndex--;
        }
        const newEntry: WordAccess = {
          ...entry,
          word: newWord,
          senseIndex: newSenseIndex,
        };
        recentlyAddedWords.splice(index, 1, newEntry);
      }
    });
    this.setState({ recentlyAddedWords });
  }

  async deleteWord(word: Word) {
    await Backend.deleteWord(word).then(
      async () => await this.updateExisting()
    );
  }

  render() {
    return (
      <form
        onSubmit={(e?: React.FormEvent<HTMLFormElement>, callback?: Function) =>
          this.submit(e, callback)
        }
      >
        <input type="submit" style={{ display: "none" }} />

        <Grid container>
          <Grid item xs={4}>
            <Typography
              variant="h5"
              align="center"
              style={{
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(2),
              }}
            >
              <Translate id="addWords.vernacular" />
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography
              variant="h5"
              align="center"
              style={{
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(2),
              }}
            >
              <Translate id="addWords.glosses" />
            </Typography>
          </Grid>

          {this.state.recentlyAddedWords.map((wordAccess, index) => (
            <Grid item xs={12} key={index}>
              <RecentEntry
                key={wordAccess.word.id + "_" + wordAccess.senseIndex}
                allVerns={this.state.existingVerns}
                allWords={this.state.existingWords}
                entry={wordAccess.word}
                senseIndex={wordAccess.senseIndex}
                updateGloss={(newGloss: string) =>
                  this.updateRecentEntryGloss(index, newGloss)
                }
                updateVern={(newVernacular: string, targetWordId?: string) =>
                  this.updateRecentEntryVern(index, newVernacular, targetWordId)
                }
                removeEntry={() => this.undoRecentEntry(index)}
                addAudioToWord={(wordId: string, audioFile: File) =>
                  this.addAudioToRecentWord(wordId, audioFile)
                }
                deleteAudioFromWord={(wordId: string, fileName: string) =>
                  this.deleteAudioFromRecentWord(wordId, fileName)
                }
                recorder={this.recorder}
                semanticDomain={this.props.semanticDomain}
                focusNewEntry={() => {
                  if (this.refNewEntry.current)
                    this.refNewEntry.current.focusVernInput();
                }}
              />
            </Grid>
          ))}

          <Grid item xs={12}>
            <NewEntry
              ref={this.refNewEntry}
              allVerns={this.state.existingVerns}
              allWords={this.state.existingWords}
              updateWordWithNewGloss={(
                wordId: string,
                gloss: string,
                audioFileURLs: string[]
              ) => this.updateWordWithNewGloss(wordId, gloss, audioFileURLs)}
              addNewWord={(word: Word, audioFileURLs: string[]) =>
                this.addNewWord(word, audioFileURLs)
              }
              semanticDomain={this.props.semanticDomain}
              setIsReadyState={(isReady: boolean) =>
                this.setState({ isReady: isReady })
              }
              recorder={this.recorder}
            />
          </Grid>
        </Grid>

        <Grid container justify="space-between" spacing={3}>
          <Grid item>
            {this.props.isSmallScreen ? (
              <Button
                style={{ marginTop: theme.spacing(2) }}
                onClick={this.props.showExistingData}
              >
                <ListIcon fontSize={"default"} color={"inherit"} />
              </Button>
            ) : null}
          </Grid>
          <Grid item>
            <Button
              id="complete"
              type="submit"
              variant="contained"
              color={this.state.isReady ? "primary" : "secondary"}
              style={{ marginTop: theme.spacing(2) }}
              tabIndex={-1}
              onClick={() => {
                // Check if there is a new word, but the user clicked complete instead of pressing enter
                if (this.refNewEntry.current) {
                  let newEntry = this.refNewEntry.current.state.newEntry;
                  let newEntryAudio = this.refNewEntry.current.state
                    .audioFileURLs;
                  if (newEntry && newEntry.vernacular) {
                    this.addNewWord(newEntry, newEntryAudio);
                    this.refNewEntry.current.resetState();
                  }
                }

                // Reset everything
                this.props.hideQuestions();
                let recentlyAddedWords: WordAccess[] = [];
                this.setState({ recentlyAddedWords });

                // Reveal the TreeView, hiding DataEntry
                this.props.displaySemanticDomainView(true);
              }}
            >
              <Translate id="buttons.complete" />
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }
}

export default withLocalize(DataEntryTable);
