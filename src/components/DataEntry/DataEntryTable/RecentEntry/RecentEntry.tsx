import { Grid } from "@material-ui/core";
import React from "react";

import { Sense, Word, WritingSystem } from "api/models";
import {
  DeleteEntry,
  EntryNote,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import Pronunciations from "components/Pronunciations/PronunciationsComponent";
import Recorder from "components/Pronunciations/Recorder";
import theme from "types/theme";
import { firstGlossText, newGloss } from "types/word";

const idAffix = "recent-entry";

interface RecentEntryProps {
  rowIndex: number;
  entry: Word;
  senseIndex: number;
  updateGloss: (gloss: string) => void;
  updateNote: (newText: string) => Promise<void>;
  updateVern: (newVernacular: string, targetWordId?: string) => void;
  removeEntry: () => void;
  addAudioToWord: (wordId: string, audioFile: File) => void;
  deleteAudioFromWord: (wordId: string, fileName: string) => void;
  recorder: Recorder;
  focusNewEntry: () => void;
  analysisLang: WritingSystem;
  vernacularLang: WritingSystem;
}

interface RecentEntryState {
  vernacular: string;
  gloss: string;
  hovering: boolean;
}

/**
 * Displays a recently entered word that a user can still edit
 */
export default class RecentEntry extends React.Component<
  RecentEntryProps,
  RecentEntryState
> {
  constructor(props: RecentEntryProps) {
    super(props);

    const sense: Sense = { ...props.entry.senses[props.senseIndex] };
    if (sense.glosses.length < 1) {
      sense.glosses.push(newGloss("", this.props.analysisLang.bcp47));
    }

    this.state = {
      vernacular: props.entry.vernacular,
      gloss: firstGlossText(sense),
      hovering: false,
    };
  }

  updateGlossField(gloss: string) {
    this.setState({ gloss });
  }

  updateVernField(newValue?: string): Word[] {
    this.setState({ vernacular: newValue ?? "" });
    return [];
  }

  conditionallyUpdateGloss() {
    if (
      firstGlossText(this.props.entry.senses[this.props.senseIndex]) !==
      this.state.gloss
    ) {
      this.props.updateGloss(this.state.gloss);
    }
  }

  conditionallyUpdateVern() {
    if (this.props.entry.vernacular !== this.state.vernacular) {
      this.props.updateVern(this.state.vernacular);
    }
  }

  focusOnNewEntry = () => {
    this.props.focusNewEntry();
  };

  render() {
    return (
      <Grid
        id={`${idAffix}-${this.props.rowIndex}`}
        container
        onMouseEnter={() => this.setState({ hovering: true })}
        onMouseLeave={() => this.setState({ hovering: false })}
        alignItems="center"
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
            onBlur={() => {
              this.conditionallyUpdateVern();
            }}
            handleEnterAndTab={() => {
              if (this.state.vernacular) {
                this.focusOnNewEntry();
              }
            }}
            vernacularLang={this.props.vernacularLang}
            textFieldId={`${idAffix}-${this.props.rowIndex}-vernacular`}
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
            gloss={this.state.gloss}
            updateGlossField={(newValue: string) =>
              this.updateGlossField(newValue)
            }
            onBlur={() => {
              this.conditionallyUpdateGloss();
            }}
            handleEnterAndTab={() => {
              if (this.state.gloss) {
                this.focusOnNewEntry();
              }
            }}
            analysisLang={this.props.analysisLang}
            textFieldId={`${idAffix}-${this.props.rowIndex}-gloss`}
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
          <EntryNote
            noteText={this.props.entry.note.text}
            updateNote={this.props.updateNote}
            buttonId={`${idAffix}-${this.props.rowIndex}-note`}
          />
        </Grid>
        <Grid
          item
          xs={2}
          style={{
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            position: "relative",
          }}
        >
          <Pronunciations
            wordId={this.props.entry.id}
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
            <DeleteEntry
              removeEntry={() => this.props.removeEntry()}
              buttonId={`${idAffix}-${this.props.rowIndex}-delete`}
              confirmId={"addWords.deleteRowWarning"}
              wordId={this.props.entry.id}
            />
          )}
        </Grid>
      </Grid>
    );
  }
}
