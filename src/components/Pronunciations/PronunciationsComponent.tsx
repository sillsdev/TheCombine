import React from "react";
import {
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import AudioPlayer from "./AudioPlayer";
import AudioRecorder from "./AudioRecorder";
import * as Backend from "../../backend";

export interface PronunciationProps {
  wordId: string;
  pronunciationFiles: string[];
  wordUpdated?: (oldId: string, newId: string)=>void;
}

/** Audio recording/playing component */
export class Pronunciations extends React.Component<PronunciationProps & LocalizeContextProps> {
  render() {
    let audioButtons;
    if (this.props.pronunciationFiles === undefined) {
      audioButtons = null;
    } else {
      audioButtons = this.props.pronunciationFiles.map(file => {
        return <AudioPlayer key={file} pronunciationUrl={Backend.getAudioUrl(this.props.wordId, file)} />;
      });
    }
    return (
      <div className="pronunciationAudio" style={{ paddingRight: "2em" }}>
        <AudioRecorder
          wordId={this.props.wordId}
          translate={this.props.translate}
          recordingFinished={this.props.wordUpdated}
        />
        {audioButtons}
      </div>
    );
  }
}

export default withLocalize(Pronunciations);
