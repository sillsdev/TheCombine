import { Grid } from "@material-ui/core";
import React from "react";

import theme from "../../../../types/theme";
import { SemanticDomain, Sense, Word } from "../../../../types/word";
import Pronunciations from "../../../Pronunciations/PronunciationsComponent";
import Recorder from "../../../Pronunciations/Recorder";
import GlossWithSuggestions from "../GlossWithSuggestions/GlossWithSuggestions";
import VernWithSuggestions from "../VernWithSuggestions/VernWithSuggestions";
import DeleteEntry from "./DeleteEntry/DeleteEntry";

interface RecentEntryProps {
  allVerns: string[];
  allWords: Word[];
  entry: Word;
  senseIndex: number;
  updateGloss: (newGloss: string) => void;
  updateVern: (newVernacular: string, targetWordId?: string) => void;
  removeEntry: () => void;
  addAudioToWord: (wordId: string, audioFile: File) => void;
  deleteAudioFromWord: (wordId: string, fileName: string) => void;
  semanticDomain: SemanticDomain;
  recorder: Recorder;
  focusNewEntry: () => void;
  analysisLang: string;
}

interface RecentEntryState {
  vernacular: string;
  gloss: string;
  //isDupVern: boolean;
  //wordId?: string;
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

    let sense: Sense = { ...props.entry.senses[props.senseIndex] };
    if (sense.glosses.length < 1)
      sense.glosses.push({ def: "", language: this.props.analysisLang });

    this.state = {
      vernacular: props.entry.vernacular,
      gloss: sense.glosses.length > 0 ? sense.glosses[0].def : "",
      //isDupVern: false,
      hovering: false,
    };
  }

  updateGlossField(gloss: string) {
    this.setState({ gloss });
  }

  updateVernField(newValue?: string): Word[] {
    let vernacular: string = "";
    let dupVernWords: Word[] = [];
    //let isDupVern: boolean = false;
    if (newValue) {
      vernacular = newValue;
      /*dupVernWords = this.props.allWords.filter(
        (word: Word) => word.vernacular === newValue
      );
      isDupVern = dupVernWords.length > 0;*/
    }
    this.setState({
      //isDupVern,
      vernacular,
    });
    return dupVernWords;
  }

  /*updateWordId(wordId?: string) {
    this.setState({ wordId });
  }*/

  conditionallyUpdateGloss() {
    if (
      this.props.entry.senses[this.props.senseIndex].glosses[0].def !==
      this.state.gloss
    )
      this.props.updateGloss(this.state.gloss);
  }

  conditionallyUpdateVern() {
    if (
      this.props.entry.vernacular !== this.state.vernacular //||
      //this.state.wordId !== undefined
    )
      this.props.updateVern(this.state.vernacular); //, this.state.wordId);
  }

  focusOnNewEntry = () => {
    this.props.focusNewEntry();
    //reference NewEntry's focus thing here
  };

  render() {
    return (
      <React.Fragment>
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
              updateWordId={(wordId?: string) => null} //this.updateWordId(wordId)}
              allVerns={[]}
              onBlur={() => {
                this.conditionallyUpdateVern();
              }}
              handleEnterAndTab={() => {
                if (this.state.vernacular) this.focusOnNewEntry();
              }}
              setActiveGloss={() => {}}
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
                if (this.state.gloss) this.focusOnNewEntry();
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
      </React.Fragment>
    );
  }
}
