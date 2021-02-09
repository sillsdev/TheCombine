import { Button, Grid, Typography } from "@material-ui/core";
import { List as ListIcon } from "@material-ui/icons";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import * as Backend from "backend";
import { AutoComplete } from "types/project";
import DomainTree from "types/SemanticDomain";
import theme from "types/theme";
import {
  Gloss,
  Note,
  SemanticDomain,
  Sense,
  simpleWord,
  State,
  Word,
} from "types/word";
import { getFileNameForWord } from "components/Pronunciations/AudioRecorder";
import Recorder from "components/Pronunciations/Recorder";
import NewEntry from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";
import RecentEntry from "components/DataEntry/DataEntryTable/RecentEntry/RecentEntry";

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
  suggestVerns: boolean;
  analysisLang: string;
  defunctWordIds: string[];
  isFetchingFrontier: boolean;
}

export function addSemanticDomainToSense(
  semanticDomain: SemanticDomain,
  existingWord: Word,
  senseIndex: number
): Word {
  if (senseIndex >= existingWord.senses.length) {
    throw new RangeError("senseIndex too large");
  } else {
    const oldSense = existingWord.senses[senseIndex];
    const updatedDomains = [...oldSense.semanticDomains];
    updatedDomains.push(semanticDomain);
    const updatedSense: Sense = {
      ...oldSense,
      semanticDomains: updatedDomains,
    };
    const updatedSenses = [...existingWord.senses];
    updatedSenses.splice(senseIndex, 1, updatedSense);
    const updatedWord: Word = { ...existingWord, senses: updatedSenses };
    return updatedWord;
  }
}

export function addSenseToWord(
  semanticDomain: SemanticDomain,
  existingWord: Word,
  gloss: string,
  language: string
): Word {
  const updatedWord: Word = { ...existingWord };
  const newGloss: Gloss = { language, def: gloss };
  const newSense: Sense = {
    glosses: [newGloss],
    semanticDomains: [semanticDomain],
    accessibility: State.Active,
  };
  updatedWord.senses.push(newSense);
  return updatedWord;
}

/**
 * A data entry table containing recent word entries
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
      suggestVerns: true,
      analysisLang: "en",
      defunctWordIds: [],
      isFetchingFrontier: false,
    };
    this.refNewEntry = React.createRef<NewEntry>();
    this.recorder = new Recorder();
  }
  refNewEntry: React.RefObject<NewEntry>;
  recorder: Recorder;

  async componentDidMount() {
    await this.updateExisting();
    await this.getProjectSettings();
  }

  async getProjectSettings() {
    const proj = await Backend.getProject();
    const suggestVerns = proj.autocompleteSetting === AutoComplete.On;
    let analysisLang = "en";
    if (proj.analysisWritingSystems?.length > 0) {
      analysisLang = proj.analysisWritingSystems[0].bcp47;
    }
    this.setState({ analysisLang, suggestVerns });
  }

  /** Finished with this page of words, select new semantic domain */
  // TODO: Implement
  submit(e?: React.FormEvent<HTMLFormElement>, _c?: Function) {
    if (e) {
      e.preventDefault();
    }
  }

  // Use this before updating any word on the backend,
  // to make sure that word doesn't get edited by two different functions
  defunctWord(wordId: string) {
    const defunctWordIds = this.state.defunctWordIds;
    if (!defunctWordIds.includes(wordId)) {
      defunctWordIds.push(wordId);
      this.setState({ defunctWordIds });
    }
  }

  async addNewWord(wordToAdd: Word, audioURLs: string[], insertIndex?: number) {
    wordToAdd.note.language = this.state.analysisLang;
    const newWord = await Backend.createWord(wordToAdd);
    if (newWord.id === "Duplicate") {
      alert(
        this.props.translate("addWords.wordInDatabase") +
          `: ${wordToAdd.vernacular}, ${wordToAdd.senses[0].glosses[0].def}`
      );
      return;
    }
    const wordId = await this.addAudiosToBackend(newWord.id, audioURLs);
    const newWordWithAudio = await Backend.getWord(wordId);
    await this.updateExisting();

    const recentlyAddedWords = [...this.state.recentlyAddedWords];
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
  async updateWordBackAndFront(
    wordToUpdate: Word,
    senseIndex: number,
    audioURLs?: string[]
  ) {
    let updatedWord = await this.updateWordInBackend(wordToUpdate);
    if (audioURLs && audioURLs.length) {
      const wordId = await this.addAudiosToBackend(updatedWord.id, audioURLs);
      updatedWord = await Backend.getWord(wordId);
    }

    const recentlyAddedWords = [...this.state.recentlyAddedWords];
    const updatedWordAccess: WordAccess = {
      word: updatedWord,
      senseIndex: senseIndex,
    };
    recentlyAddedWords.push(updatedWordAccess);

    this.setState({ recentlyAddedWords }, () => {
      this.replaceInDisplay(wordToUpdate.id, updatedWord);
    });
  }
  async updateWordBackAndFrontSimple(wordToUpdate: Word) {
    let updatedWord = await this.updateWordInBackend(wordToUpdate);
    this.replaceInDisplay(wordToUpdate.id, updatedWord);
  }

  // Checks if sense already exists with this gloss and semantic domain
  // returns false if encounters duplicate
  async updateWordWithNewGloss(
    wordId: string,
    gloss: string,
    audioFileURLs?: string[]
  ): Promise<void> {
    const existingWord = this.state.existingWords.find(
      (word: Word) => word.id === wordId
    );
    if (!existingWord) {
      throw new Error("You are trying to update a nonexistent word");
    }

    for (const [senseIndex, sense] of existingWord.senses.entries()) {
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
          alert(
            this.props.translate("addWords.senseInWord") +
              `: ${existingWord.vernacular}, ${gloss}`
          );
          return;
        } else {
          const updatedWord = addSemanticDomainToSense(
            this.props.semanticDomain,
            existingWord!, // Existing word already null checked
            senseIndex
          );
          await this.updateWordBackAndFront(
            updatedWord,
            senseIndex,
            audioFileURLs
          );
          return;
        }
      }
    }
    // The gloss is new for this word, so add a new sense.
    const updatedWord = addSenseToWord(
      this.props.semanticDomain,
      existingWord,
      gloss,
      this.state.analysisLang
    );
    await this.updateWordBackAndFront(
      updatedWord,
      updatedWord.senses.length - 1, // Was added at the end of the sense list
      audioFileURLs
    );
    return;
  }

  async addAudiosToBackend(
    wordId: string,
    audioURLs: string[]
  ): Promise<string> {
    let updatedWordId = wordId;
    for (const audioURL of audioURLs) {
      const audioBlob = await fetch(audioURL).then((result) => result.blob());
      const fileName = getFileNameForWord(updatedWordId);
      const audioFile = new File([audioBlob], fileName, {
        type: audioBlob.type,
        lastModified: Date.now(),
      });
      this.defunctWord(updatedWordId);
      updatedWordId = await Backend.uploadAudio(updatedWordId, audioFile);
      URL.revokeObjectURL(audioURL);
    }
    return updatedWordId;
  }

  async addAudioToRecentWord(oldWordId: string, audioFile: File) {
    this.defunctWord(oldWordId);
    await Backend.uploadAudio(oldWordId, audioFile).then(async (newWordId) => {
      await Backend.getWord(newWordId).then(async (newWord) => {
        this.replaceInDisplay(oldWordId, newWord);
        await this.updateExisting();
      });
    });
  }

  async deleteAudioFromRecentWord(oldWordId: string, fileName: string) {
    this.defunctWord(oldWordId);
    await Backend.deleteAudio(oldWordId, fileName).then(async (newWordId) => {
      await Backend.getWord(newWordId).then(async (newWord) => {
        this.replaceInDisplay(oldWordId, newWord);
        await this.updateExisting();
      });
    });
  }

  async updateWordInBackend(wordToUpdate: Word): Promise<Word> {
    this.defunctWord(wordToUpdate.id);
    let updatedWord = await Backend.updateWord(wordToUpdate);
    await this.updateExisting();
    return updatedWord;
  }

  async updateExisting() {
    if (!this.state.isFetchingFrontier) {
      this.setState({ isFetchingFrontier: true });
      const existingWords = await this.props.getWordsFromBackend();
      const existingVerns = [
        ...new Set(existingWords.map((word: Word) => word.vernacular)),
      ];
      const isFetchingFrontier = false;
      this.setState({ existingVerns, existingWords, isFetchingFrontier });
    }
  }

  async undoRecentEntry(entryIndex: number): Promise<string> {
    if (entryIndex >= this.state.recentlyAddedWords.length) {
      throw new RangeError("Entry doesn't exist in recent entries.");
    }
    const recentEntry: WordAccess = this.state.recentlyAddedWords[entryIndex];

    // Copy all the parts we need
    const recentWord: Word = { ...recentEntry.word };
    const senseCount = recentWord.senses.length;
    const senseIndex = recentEntry.senseIndex;
    const recentSense: Sense = {
      ...recentWord.senses[senseIndex],
    };

    this.removeRecentEntry(entryIndex);

    if (recentSense.semanticDomains.length > 1) {
      // If there is more than one semantic domain in this sense, only remove the domain
      const updatedSemanticDomains: SemanticDomain[] = recentSense.semanticDomains.filter(
        (semDom) => semDom.id !== this.props.semanticDomain.id
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
    const oldEntry = this.state.recentlyAddedWords[entryIndex];
    const oldWord = oldEntry.word;
    const oldSense = oldWord.senses[oldEntry.senseIndex];

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
    const oldEntry = this.state.recentlyAddedWords[entryIndex];
    const oldWord = oldEntry.word;
    const senseIndex = oldEntry.senseIndex;
    const oldSense = oldWord.senses[senseIndex];
    const oldGloss = oldSense.glosses[0];

    if (oldWord.senses.length === 1 && oldSense.semanticDomains.length === 1) {
      // The word can simply be updated as it stands
      const newSense: Sense = {
        ...oldSense,
        glosses: [{ ...oldGloss, def: newGloss }],
      };
      await this.updateSense(oldWord, senseIndex, newSense);
    } else {
      // This is a modification that has to be retracted and replaced with a new entry
      await this.undoRecentEntry(entryIndex).then(async (wordId) => {
        await this.updateWordWithNewGloss(wordId, newGloss);
      });
    }
  }

  async updateRecentEntryNote(entryIndex: number, newText: string) {
    const oldEntry = this.state.recentlyAddedWords[entryIndex];
    const oldWord = oldEntry.word;
    const oldNote = oldWord.note;
    if (newText !== oldNote.text) {
      const newNote: Note = { ...oldNote, text: newText };
      const newWord: Word = { ...oldWord, note: newNote };
      this.updateWordBackAndFrontSimple(newWord);
    }
  }

  removeRecentEntry(entryIndex: number) {
    const recentlyAddedWords = [...this.state.recentlyAddedWords];
    recentlyAddedWords.splice(entryIndex, 1);
    this.setState({ recentlyAddedWords });
  }

  // Update a vern in a word and replace every displayed instance of that word.
  async updateVernacular(word: Word, vernacular: string) {
    const updatedWord: Word = { ...word, vernacular };
    await this.updateWordInBackend(updatedWord).then((newWord) =>
      this.replaceInDisplay(word.id, newWord)
    );
  }

  // Update a sense in a word and replace every displayed instance of that word.
  async updateSense(
    word: Word,
    senseIndex: number,
    updatedSense: Sense
  ): Promise<string> {
    const senses = [...word.senses];
    senses.splice(senseIndex, 1, updatedSense);
    const updatedWord: Word = { ...word, senses };
    return await this.updateWordInBackend(updatedWord).then((newWord) => {
      this.replaceInDisplay(word.id, newWord);
      return newWord.id;
    });
  }

  // Remove a sense from a word and replace every displayed instance of that word.
  async removeSense(word: Word, senseIndex: number): Promise<string> {
    const senses = [...word.senses];
    senses.splice(senseIndex, 1);
    const updatedWord: Word = { ...word, senses };
    return await this.updateWordInBackend(updatedWord).then((newWord) => {
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
    const recentlyAddedWords = [...this.state.recentlyAddedWords];
    recentlyAddedWords.forEach((entry, index) => {
      if (entry.word.id === oldWordId) {
        let newSenseIndex = entry.senseIndex;
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
    this.defunctWord(word.id);
    await Backend.deleteFrontierWord(word.id).then(
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
              {this.state.defunctWordIds.includes(
                wordAccess.word.id
              ) ? null /*Word not shows because it's being edited*/ : (
                <RecentEntry
                  key={wordAccess.word.id + "_" + wordAccess.senseIndex}
                  entry={wordAccess.word}
                  senseIndex={wordAccess.senseIndex}
                  updateGloss={(newGloss: string) =>
                    this.updateRecentEntryGloss(index, newGloss)
                  }
                  updateNote={(newText: string) =>
                    this.updateRecentEntryNote(index, newText)
                  }
                  updateVern={(newVernacular: string, targetWordId?: string) =>
                    this.updateRecentEntryVern(
                      index,
                      newVernacular,
                      targetWordId
                    )
                  }
                  removeEntry={() => this.undoRecentEntry(index)}
                  addAudioToWord={(wordId: string, audioFile: File) =>
                    this.addAudioToRecentWord(wordId, audioFile)
                  }
                  deleteAudioFromWord={(wordId: string, fileName: string) =>
                    this.deleteAudioFromRecentWord(wordId, fileName)
                  }
                  recorder={this.recorder}
                  focusNewEntry={() => {
                    if (this.refNewEntry.current) {
                      this.refNewEntry.current.focusVernInput();
                    }
                  }}
                  analysisLang={this.state.analysisLang}
                />
              )}
            </Grid>
          ))}

          <Grid item xs={12}>
            <NewEntry
              ref={this.refNewEntry}
              allVerns={this.state.suggestVerns ? this.state.existingVerns : []}
              allWords={this.state.suggestVerns ? this.state.existingWords : []}
              defunctWordIds={this.state.defunctWordIds}
              updateWordWithNewGloss={(
                wordId: string,
                gloss: string,
                audioFileURLs: string[]
              ) => this.updateWordWithNewGloss(wordId, gloss, audioFileURLs)}
              addNewWord={(word: Word, audioFileURLs: string[]) =>
                this.addNewWord(word, audioFileURLs)
              }
              semanticDomain={this.props.semanticDomain}
              setIsReadyState={(isReady: boolean) => this.setState({ isReady })}
              recorder={this.recorder}
              analysisLang={this.state.analysisLang}
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
                this.setState({ defunctWordIds: [], recentlyAddedWords: [] });

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
