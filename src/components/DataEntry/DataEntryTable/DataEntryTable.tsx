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
import { SemanticDomain, Word } from "../../../types/word";
import { getFileNameForWord } from "../../Pronunciations/AudioRecorder";
import Recorder from "../../Pronunciations/Recorder";
import RecentEntry from "./ExistingEntry/ExistingEntry";
import { ImmutableExistingEntry } from "./ExistingEntry/ImmutableExistingEntry";
import { NewEntry } from "./NewEntry/NewEntry";

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
  mutable?: boolean;
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
    this.updateExisting();
  }

  /** Finished with this page of words, select new semantic domain */
  // TODO: Implement
  submit(e?: React.FormEvent<HTMLFormElement>, callback?: Function) {
    if (e) e.preventDefault();
  }

  async addNewWord(wordToAdd: Word, audioURLs: string[]) {
    let newWord: Word = await Backend.createWord(wordToAdd);
    let wordId: string = await addAudiosToBackend(newWord.id, audioURLs);
    let newWordWithAudio: Word = await Backend.getWord(wordId);
    this.updateExisting();

    let recentlyAddedWords: WordAccess[] = [...this.state.recentlyAddedWords];
    let newWordAccess: WordAccess = {
      word: newWordWithAudio,
      mutable: true,
      senseIndex: 0,
    };
    recentlyAddedWords.push(newWordAccess);

    this.setState({
      recentlyAddedWords,
    });
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
      mutable: false,
      senseIndex: senseIndex,
    };
    recentlyAddedWords.push(updatedWordAccess);

    this.setState({ recentlyAddedWords });
  }

  async addAudioToRecentWord(oldWordId: string, audioFile: File) {
    let index: number = this.state.recentlyAddedWords.findIndex(
      (w) => w.word.id === oldWordId
    );
    if (index === -1) {
      console.log("Word does not exist in recentlyAddedWords");
      return;
    }
    const updatedWordId: string = await Backend.uploadAudio(
      oldWordId,
      audioFile
    );
    let updatedWord: Word = await Backend.getWord(updatedWordId);
    let updatedWordAccess: WordAccess = {
      ...this.state.recentlyAddedWords[index],
      word: updatedWord,
    };
    this.updateWordInFrontend(index, updatedWordAccess);
  }

  async deleteAudioFromRecentWord(oldWordId: string, fileName: string) {
    let index: number = this.state.recentlyAddedWords.findIndex(
      (w) => w.word.id === oldWordId
    );
    if (index === -1) {
      console.log("Word does not exist in recentlyAddedWords");
      return;
    }
    const updatedWordId: string = await Backend.deleteAudio(
      oldWordId,
      fileName
    );
    let updatedWord: Word = await Backend.getWord(updatedWordId);
    let updatedWordAccess: WordAccess = {
      ...this.state.recentlyAddedWords[index],
      word: updatedWord,
    };
    this.updateWordInFrontend(index, updatedWordAccess);
  }

  async updateRecentWord(
    wordToUpdate: Word,
    wordToDelete: Word,
    senseIndex?: number
  ) {
    let updatedWord: Word = await this.updateWordInBackend(wordToUpdate);
    let recentlyAddedWords: WordAccess[] = [...this.state.recentlyAddedWords];

    const oldWordId: string = wordToDelete ? wordToDelete.id : wordToUpdate.id;
    const recentWordIndex: number = recentlyAddedWords.findIndex(
      (w) => w.word.id === oldWordId
    );
    if (recentWordIndex === -1) {
      console.log("Word does not exist in recentlyAddedWords");
      return;
    }
    const updatedSenseIndex = senseIndex
      ? senseIndex
      : updatedWord.senses.length - 1;
    let updatedWordAccess: WordAccess = {
      word: updatedWord,
      mutable: updatedWord.senses.length === 1,
      senseIndex: updatedSenseIndex,
    };
    this.updateWordInFrontend(recentWordIndex, updatedWordAccess);
    this.deleteWordAndUpdateExisting(wordToDelete);
  }

  updateWordInFrontend(index: number, updatedWord: WordAccess) {
    let recentlyAddedWords: WordAccess[] = [...this.state.recentlyAddedWords];
    recentlyAddedWords.splice(index, 1, updatedWord);
    this.setState({ recentlyAddedWords });
  }

  async updateWordInBackend(wordToUpdate: Word): Promise<Word> {
    let updatedWord: Word = await Backend.updateWord(wordToUpdate);
    this.updateExisting();
    return updatedWord;
  }

  async updateExisting() {
    const existingWords: Word[] = await this.props.getWordsFromBackend();
    const existingVerns: string[] = [
      ...new Set(existingWords.map((word: Word) => word.vernacular)),
    ];
    this.setState({ existingVerns, existingWords });
  }

  async removeWord(word: Word) {
    this.deleteWordAndUpdateExisting(word);
    this.removeWordFromDisplay(word);
  }

  deleteWordAndUpdateExisting(word: Word) {
    Backend.deleteWord(word).then(() => this.updateExisting());
  }

  removeWordFromDisplay(word: Word) {
    let recentlyAddedWords: WordAccess[] = this.state.recentlyAddedWords.filter(
      (wordAccess) => wordAccess.word.id !== word.id
    );
    this.setState({ recentlyAddedWords });
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

          {this.state.recentlyAddedWords.map((wordAccess, index) =>
            wordAccess.mutable ? (
              <RecentEntry
                key={wordAccess.word.id}
                allVerns={this.state.existingVerns}
                allWords={this.state.existingWords}
                entryIndex={index}
                entry={wordAccess.word}
                updateWord={(
                  wordToUpdate: Word,
                  wordToDelete: Word,
                  senseIndex?: number
                ) =>
                  this.updateRecentWord(wordToUpdate, wordToDelete, senseIndex)
                }
                removeWord={(word: Word) => this.removeWord(word)}
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
            ) : (
              <ImmutableExistingEntry
                key={wordAccess.word.id}
                vernacular={wordAccess.word.vernacular}
                gloss={
                  wordAccess.word.senses[wordAccess.senseIndex].glosses[0].def
                }
              />
            )
          )}

          <Grid item xs={12}>
            <NewEntry
              ref={this.refNewEntry}
              allVerns={this.state.existingVerns}
              allWords={this.state.existingWords}
              updateWord={(
                wordToUpdate: Word,
                senseIndex: number,
                audioFileURLs: string[]
              ) =>
                this.updateWordForNewEntry(
                  wordToUpdate,
                  senseIndex,
                  audioFileURLs
                )
              }
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
