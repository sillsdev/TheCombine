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
  getAudioUrl?: (wordId: string, fileName: string) => string;
  uploadAudio?: (wordId: string, audioFile: File) => void;
}

/** Audio recording/playing component */
export class Pronunciations extends React.Component<
  PronunciationProps & LocalizeContextProps
> {
  /* Only update if wordId or list of files changes
   * This decreases unnecessary fetching of audio files
   */
  shouldComponentUpdate(nextProps: PronunciationProps) {
    return (
      nextProps.wordId !== this.props.wordId ||
      JSON.stringify(nextProps.pronunciationFiles) !==
        JSON.stringify(this.props.pronunciationFiles)
    );
  }

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
            pronunciationUrl={
              this.props.getAudioUrl
                ? this.props.getAudioUrl(this.props.wordId, fileName)
                : Backend.getAudioUrl(this.props.wordId, fileName)
            }
            deleteAudio={this.props.deleteAudio}
          />
        );
      });
    }
    return (
      <div className="pronunciationAudio">
        <AudioRecorder
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
