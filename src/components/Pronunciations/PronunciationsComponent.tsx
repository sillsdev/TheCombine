import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

import * as Backend from "../../backend";
import AudioPlayer from "./AudioPlayer";
import AudioRecorder from "./AudioRecorder";
import Recorder from "./Recorder";

export interface PronunciationProps {
  wordId: string;
  pronunciationFiles: string[];
  recorder?: Recorder;
  deleteAudio?: (wordId: string, fileName: string) => void;
  //getAudioUrl?: (wordId: string, fileName: string) => string;
  uploadAudio?: (wordId: string, audioFile: File) => void;
}

/** Audio recording/playing component */
export class Pronunciations extends React.Component<
  PronunciationProps & LocalizeContextProps
> {
  render() {
    let audioButtons;
    if (this.props.pronunciationFiles === null) {
      audioButtons = null;
    } else {
      audioButtons = this.props.pronunciationFiles.map((fileName) => {
        return (
          <AudioPlayer
            key={fileName}
            wordId={this.props.wordId}
            fileName={fileName}
            pronunciationUrl={Backend.getAudioUrl(this.props.wordId, fileName)}
            /*    this.props.getAudioUrl
                ? this.props.getAudioUrl(this.props.wordId, fileName)
                : Backend.getAudioUrl(this.props.wordId, fileName)
            }*/
            deleteAudio={this.props.deleteAudio}
          />
        );
      });
    }
    return (
      <div className="pronunciationAudio">
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
