import { Button, Grid, Typography } from "@material-ui/core";
import { ExitToApp, List as ListIcon } from "@material-ui/icons";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import {
  AutocompleteSetting,
  Note,
  SemanticDomain,
  SemanticDomainTreeNode,
  Sense,
  Word,
  WritingSystem,
} from "api/models";
import * as backend from "backend";
import NewEntry, {
  FocusTarget,
} from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";
import RecentEntry from "components/DataEntry/DataEntryTable/RecentEntry/RecentEntry";
import { getFileNameForWord } from "components/Pronunciations/AudioRecorder";
import Recorder from "components/Pronunciations/Recorder";
import theme from "types/theme";
import { newSense, simpleWord } from "types/word";
import { firstGlossText } from "types/wordUtilities";
import { defaultWritingSystem, newWritingSystem } from "types/writingSystem";

export const exitButtonId = "exit-to-domain-tree";

interface DataEntryTableProps extends WithTranslation {
  semanticDomain: SemanticDomainTreeNode;
  treeIsOpen?: boolean;
  openTree: () => void;
  getWordsFromBackend: () => Promise<Word[]>;
  showExistingData: () => void;
  isSmallScreen?: boolean;
  hideQuestions: () => void;
}

interface WordAccess {
  word: Word;
  senseIndex: number;
}

interface DataEntryTableState {
  existingWords: Word[];
  recentlyAddedWords: WordAccess[];
  isReady: boolean;
  suggestVerns: boolean;
  analysisLang: WritingSystem;
  vernacularLang: WritingSystem;
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
    return { ...existingWord, senses: updatedSenses };
  }
}

export function addSenseToWord(
  semanticDomain: SemanticDomain,
  existingWord: Word,
  gloss: string,
  language: string
): Word {
  const word: Word = { ...existingWord, senses: [...existingWord.senses] };
  word.senses.push(newSense(gloss, language, semanticDomain));
  return word;
}

/**
 * A data entry table containing recent word entries
 */
export class DataEntryTable extends React.Component<
  DataEntryTableProps,
  DataEntryTableState
> {
  constructor(props: DataEntryTableProps) {
    super(props);
    this.state = {
      existingWords: [],
      recentlyAddedWords: [],
      isReady: false,
      suggestVerns: true,
      analysisLang: defaultWritingSystem,
      vernacularLang: newWritingSystem("qaa", "Unknown"),
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

  async componentDidUpdate(prevProps: DataEntryTableProps) {
    if (this.props.treeIsOpen && !prevProps.treeIsOpen) {
      await this.exitGracefully();
    }
  }

  async getProjectSettings(): Promise<void> {
    const proj = await backend.getProject();
    const suggestVerns = proj.autocompleteSetting === AutocompleteSetting.On;
    const analysisLang = proj.analysisWritingSystems[0] ?? defaultWritingSystem;
    const vernacularLang = proj.vernacularWritingSystem;
    this.setState({ analysisLang, vernacularLang, suggestVerns });
  }

  /** Finished with this page of words, select new semantic domain */
  // TODO: Implement
  submit(e?: React.FormEvent<HTMLFormElement>) {
    if (e) {
      e.preventDefault();
    }
  }

  // Use this before updating any word on the backend,
  // to make sure that word doesn't get edited by two different functions
  defunctWord(wordId: string): void {
    const defunctWordIds = this.state.defunctWordIds;
    if (!defunctWordIds.includes(wordId)) {
      defunctWordIds.push(wordId);
      this.setState({ defunctWordIds });
    }
  }

  async addNewWord(
    wordToAdd: Word,
    audioURLs: string[],
    insertIndex?: number,
    ignoreRecent?: boolean
  ): Promise<void> {
    wordToAdd.note.language = this.state.analysisLang.bcp47;

    // Check if word is duplicate to existing word.
    const dupId = await backend.getDuplicateId(wordToAdd);
    if (dupId) {
      await this.addDuplicateWord(wordToAdd, audioURLs, dupId, ignoreRecent);
      return;
    }

    const addedWord = await backend.createWord(wordToAdd);
    const wordId = await this.addAudiosToBackend(addedWord.id, audioURLs);
    await this.updateExisting();

    if (ignoreRecent) {
      return;
    }

    const word = await backend.getWord(wordId);
    this.addToDisplay({ word, senseIndex: 0 }, insertIndex);
  }

  async addDuplicateWord(
    wordToAdd: Word,
    audioURLs: string[],
    duplicatedId: string,
    ignoreRecent?: boolean
  ): Promise<void> {
    const updatedWord = await backend.updateDuplicate(duplicatedId, wordToAdd);
    const wordId = await this.addAudiosToBackend(updatedWord.id, audioURLs);
    await this.updateExisting();

    if (ignoreRecent) {
      return;
    }

    this.addOrReplaceInDisplay(duplicatedId, await backend.getWord(wordId));
  }

  /** Update the word in the backend and the frontend */
  async updateWordBackAndFront(
    wordToUpdate: Word,
    senseIndex: number,
    audioURLs?: string[]
  ): Promise<void> {
    let word = await this.updateWordInBackend(wordToUpdate);
    if (audioURLs && audioURLs.length) {
      const wordId = await this.addAudiosToBackend(word.id, audioURLs);
      word = await backend.getWord(wordId);
    }

    this.addToDisplay({ word, senseIndex }, undefined, () => {
      this.replaceInDisplay(wordToUpdate.id, word);
    });
  }

  async updateWordBackAndFrontSimple(wordToUpdate: Word): Promise<void> {
    const updatedWord = await this.updateWordInBackend(wordToUpdate);
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
            this.props.t("addWords.senseInWord") +
              `: ${existingWord.vernacular}, ${gloss}`
          );
          return;
        } else {
          const updatedWord = addSemanticDomainToSense(
            this.props.semanticDomain,
            existingWord,
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
      this.state.analysisLang.bcp47
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
      updatedWordId = await backend.uploadAudio(updatedWordId, audioFile);
      URL.revokeObjectURL(audioURL);
    }
    return updatedWordId;
  }

  async addAudioToRecentWord(
    oldWordId: string,
    audioFile: File
  ): Promise<void> {
    this.defunctWord(oldWordId);
    await backend.uploadAudio(oldWordId, audioFile).then(async (newWordId) => {
      await backend.getWord(newWordId).then(async (w) => {
        this.replaceInDisplay(oldWordId, w);
        await this.updateExisting();
      });
    });
  }

  async deleteAudioFromRecentWord(
    oldWordId: string,
    fileName: string
  ): Promise<void> {
    this.defunctWord(oldWordId);
    await backend.deleteAudio(oldWordId, fileName).then(async (newWordId) => {
      await backend.getWord(newWordId).then(async (w) => {
        this.replaceInDisplay(oldWordId, w);
        await this.updateExisting();
      });
    });
  }

  async updateWordInBackend(wordToUpdate: Word): Promise<Word> {
    this.defunctWord(wordToUpdate.id);
    const updatedWord = await backend.updateWord(wordToUpdate);
    await this.updateExisting();
    return updatedWord;
  }

  async updateExisting(): Promise<void> {
    if (!this.state.isFetchingFrontier) {
      this.setState({ isFetchingFrontier: true });
      const existingWords = await this.props.getWordsFromBackend();
      const isFetchingFrontier = false;
      this.setState({ existingWords, isFetchingFrontier });
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
    const recentSense: Sense = { ...recentWord.senses[senseIndex] };

    this.removeRecentEntry(entryIndex);

    if (recentSense.semanticDomains.length > 1) {
      // If there is more than one semantic domain in this sense, only remove the domain
      const updatedSemanticDomains: SemanticDomain[] =
        recentSense.semanticDomains.filter(
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
  ): Promise<void> {
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
      const word = simpleWord(newVern, firstGlossText(oldSense));
      word.id = "";
      await this.undoRecentEntry(entryIndex).then(async () => {
        await this.addNewWord(word, [], entryIndex);
      });
    }
  }

  async updateRecentEntryGloss(entryIndex: number, def: string): Promise<void> {
    const oldEntry = this.state.recentlyAddedWords[entryIndex];
    const oldWord = oldEntry.word;
    const senseIndex = oldEntry.senseIndex;
    const oldSense = oldWord.senses[senseIndex];
    const oldGloss = oldSense.glosses[0];

    if (oldWord.senses.length === 1 && oldSense.semanticDomains.length === 1) {
      // The word can simply be updated as it stands
      const newSense: Sense = {
        ...oldSense,
        glosses: [{ ...oldGloss, def }],
      };
      await this.updateSense(oldWord, senseIndex, newSense);
    } else {
      // This is a modification that has to be retracted and replaced with a new entry
      await this.undoRecentEntry(entryIndex).then(async (wordId) => {
        await this.updateWordWithNewGloss(wordId, def);
      });
    }
  }

  async updateRecentEntryNote(
    entryIndex: number,
    newText: string
  ): Promise<void> {
    const oldEntry = this.state.recentlyAddedWords[entryIndex];
    const oldWord = oldEntry.word;
    const oldNote = oldWord.note;
    if (newText !== oldNote.text) {
      const updatedNote: Note = { ...oldNote, text: newText };
      const updatedWord: Word = { ...oldWord, note: updatedNote };
      await this.updateWordBackAndFrontSimple(updatedWord);
    }
  }

  removeRecentEntry(entryIndex: number): void {
    this.setState((prevState) => {
      const recentlyAddedWords = [...prevState.recentlyAddedWords];
      recentlyAddedWords.splice(entryIndex, 1);
      return { recentlyAddedWords };
    });
  }

  /** Update a vern in a word and replace every displayed instance of that word. */
  async updateVernacular(word: Word, vernacular: string): Promise<void> {
    const updatedWord: Word = { ...word, vernacular };
    await this.updateWordInBackend(updatedWord).then((updatedWord) =>
      this.replaceInDisplay(word.id, updatedWord)
    );
  }

  /** Update a sense in a word and replace every displayed instance of that word. */
  async updateSense(
    word: Word,
    senseIndex: number,
    updatedSense: Sense
  ): Promise<string> {
    const senses = [...word.senses];
    senses.splice(senseIndex, 1, updatedSense);
    const updatedWord: Word = { ...word, senses };
    return await this.updateWordInBackend(updatedWord).then((w) => {
      this.replaceInDisplay(word.id, w);
      return w.id;
    });
  }

  /** Remove a sense from a word and replace every displayed instance of that word. */
  async removeSense(word: Word, senseIndex: number): Promise<string> {
    const senses = [...word.senses];
    senses.splice(senseIndex, 1);
    const updatedWord: Word = { ...word, senses };
    return await this.updateWordInBackend(updatedWord).then((w) => {
      this.replaceInDisplay(word.id, w, senseIndex);
      return w.id;
    });
  }

  /** Add one-sense word to the display of recent entries. */
  addToDisplay(
    wordAccess: WordAccess,
    insertIndex?: number,
    callback?: () => void
  ): void {
    this.setState((prevState) => {
      const recentlyAddedWords = [...prevState.recentlyAddedWords];
      if (
        insertIndex !== undefined &&
        insertIndex < recentlyAddedWords.length
      ) {
        recentlyAddedWords.splice(insertIndex, 0, wordAccess);
      } else {
        recentlyAddedWords.push(wordAccess);
      }
      return { recentlyAddedWords };
    }, callback ?? (() => {}));
  }

  /** Replace every displayed instance of a word, or add if not already there. */
  addOrReplaceInDisplay(oldWordId: string, word: Word): void {
    this.setState((prevState) => {
      const recentlyAddedWords = [...prevState.recentlyAddedWords];
      let defunctWordIds = prevState.defunctWordIds;

      if (recentlyAddedWords.find((w) => w.word.id === oldWordId)) {
        recentlyAddedWords.forEach((entry) => {
          if (entry.word.id === oldWordId) {
            entry.word = word;
          }
        });
        defunctWordIds = defunctWordIds.filter((id) => id !== oldWordId);
      } else {
        const thisDomId = this.props.semanticDomain.id;
        word.senses.forEach((sense, senseIndex) => {
          if (sense.semanticDomains.find((dom) => dom.id === thisDomId)) {
            recentlyAddedWords.push({ word, senseIndex });
          }
        });
      }

      return { recentlyAddedWords, defunctWordIds };
    });
  }

  /** Replace every displayed instance of a word.
   * If removedSenseIndex is provided, that sense was removed. */
  replaceInDisplay(
    oldWordId: string,
    word: Word,
    removedSenseIndex?: number
  ): void {
    this.setState((prevState) => {
      const recentlyAddedWords = [...prevState.recentlyAddedWords];
      recentlyAddedWords.forEach((entry, index) => {
        if (entry.word.id === oldWordId) {
          let senseIndex = entry.senseIndex;
          if (
            removedSenseIndex !== undefined &&
            senseIndex >= removedSenseIndex
          ) {
            senseIndex--;
          }
          const newEntry: WordAccess = { ...entry, word, senseIndex };
          recentlyAddedWords.splice(index, 1, newEntry);
        }
      });
      const defunctWordIds = prevState.defunctWordIds.filter(
        (id) => id !== oldWordId
      );
      return { recentlyAddedWords, defunctWordIds };
    });
  }

  /** Delete specified word and clear from recent words. */
  async deleteWord(word: Word): Promise<void> {
    this.defunctWord(word.id);
    await backend
      .deleteFrontierWord(word.id)
      .then(async () => await this.updateExisting());
  }

  /** Submit un-submitted word before resetting. */
  async exitGracefully(): Promise<void> {
    // Check if there is a new word, but user exited without pressing enter
    if (this.refNewEntry.current) {
      const newEntry = this.refNewEntry.current.state.newEntry;
      if (!newEntry.senses.length) {
        newEntry.senses.push(
          newSense(undefined, undefined, this.props.semanticDomain)
        );
      }
      const newEntryAudio = this.refNewEntry.current.state.audioFileURLs;
      if (newEntry?.vernacular) {
        await this.addNewWord(newEntry, newEntryAudio, undefined, true);
        this.refNewEntry.current.resetState();
      }
    }

    // Reset everything
    this.props.hideQuestions();
    this.setState({ defunctWordIds: [], recentlyAddedWords: [] });
  }

  render() {
    return (
      <form onSubmit={(e?: React.FormEvent<HTMLFormElement>) => this.submit(e)}>
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
              {this.props.t("addWords.vernacular")}
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
              {this.props.t("addWords.glosses")}
            </Typography>
          </Grid>

          {this.state.recentlyAddedWords.map((wordAccess, index) => (
            <Grid item xs={12} key={index}>
              <RecentEntry
                key={wordAccess.word.id + "_" + wordAccess.senseIndex}
                rowIndex={index}
                entry={wordAccess.word}
                senseIndex={wordAccess.senseIndex}
                updateGloss={(newDef: string) =>
                  this.updateRecentEntryGloss(index, newDef)
                }
                updateNote={(newText: string) =>
                  this.updateRecentEntryNote(index, newText)
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
                focusNewEntry={() => {
                  if (this.refNewEntry.current) {
                    this.refNewEntry.current.focus(FocusTarget.Vernacular);
                  }
                }}
                analysisLang={this.state.analysisLang}
                vernacularLang={this.state.vernacularLang}
                disabled={this.state.defunctWordIds.includes(
                  wordAccess.word.id
                )}
              />
            </Grid>
          ))}

          <Grid item xs={12}>
            <NewEntry
              ref={this.refNewEntry}
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
              vernacularLang={this.state.vernacularLang}
            />
          </Grid>
        </Grid>

        <Grid container justifyContent="space-between" spacing={3}>
          <Grid item>
            {this.props.isSmallScreen ? (
              <Button
                id="toggle-existing-data"
                style={{ marginTop: theme.spacing(2) }}
                onClick={this.props.showExistingData}
              >
                <ListIcon fontSize={"medium"} color={"inherit"} />
              </Button>
            ) : null}
          </Grid>
          <Grid item>
            <Button
              id={exitButtonId}
              type="submit"
              variant="contained"
              color={this.state.isReady ? "primary" : "secondary"}
              style={{ marginTop: theme.spacing(2) }}
              endIcon={<ExitToApp />}
              tabIndex={-1}
              onClick={this.props.openTree}
            >
              {this.props.t("buttons.exit")}
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }
}

export default withTranslation()(DataEntryTable);
