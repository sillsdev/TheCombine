import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import AudioPlayer from "./AudioPlayer";
import AudioRecorder from "./AudioRecorder";
import * as Backend from "../../backend";
import theme from "../../types/theme";
import { Recorder } from "./Recorder";

export interface PronunciationProps {
  wordId: string;
  pronunciationFiles: string[];
  refreshWord?: (oldId: string, newId: string) => void;
  deleteAudio?: (wordId: string, fileName: string) => void;
  uploadAudio?: (wordId: string, audioFile: File) => void;
  recorder?: Recorder;
}

export interface PronunciationState {
  updatePronunciationFiles: boolean;
}

/** Audio recording/playing component */
export class Pronunciations extends React.Component<
  PronunciationProps & LocalizeContextProps,
  PronunciationState
> {
  constructor(props: PronunciationProps & LocalizeContextProps) {
    super(props);
    this.state = {
      updatePronunciationFiles: false,
    };
    this.updateAudio = this.updateAudio.bind(this);
  }

  updateAudio(updatedPronunciationFiles: string[]) {
    this.setState({
      updatePronunciationFiles: !this.state.updatePronunciationFiles,
    });
  }

  render() {
    let audioButtons;
    if (this.props.pronunciationFiles === null) {
      audioButtons = null;
    } else {
      audioButtons = this.props.pronunciationFiles.map((file) => {
        return (
          <AudioPlayer
            key={file}
            wordId={this.props.wordId}
            fileName={file}
            pronunciationUrl={Backend.getAudioUrl(this.props.wordId, file)}
            deleteAudio={this.props.deleteAudio}
          />
        );
      });
    }
    return (
      <div
        className="pronunciationAudio"
        style={{ paddingRight: theme.spacing(1) }}
      >
        <AudioRecorder
          key={this.props.wordId}
          wordId={this.props.wordId}
          recorder={this.props.recorder}
          uploadAudio={this.props.uploadAudio}
        />
        {audioButtons}
      </div>
    );
  }
}

export default withLocalize(Pronunciations);
