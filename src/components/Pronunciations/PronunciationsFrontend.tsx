import { ReactElement } from "react";

import { Pronunciation } from "api/models";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import { FileWithSpeakerId } from "types/word";

interface PronunciationFrontendProps {
  audio: Pronunciation[];
  elemBetweenRecordAndPlay?: ReactElement;
  deleteAudio: (fileName: string) => void;
  uploadAudio: (file: FileWithSpeakerId) => void;
  onClick?: () => void;
}

/** Audio recording/playing component for audio being recorded and held in the frontend. */
export default function PronunciationsFrontend(
  props: PronunciationFrontendProps
): ReactElement {
  const audioButtons: ReactElement[] = props.audio.map((a) => (
    <AudioPlayer
      fileName={a.fileName}
      key={a.fileName}
      pronunciationUrl={a.fileName}
      deleteAudio={props.deleteAudio}
      onClick={props.onClick}
    />
  ));

  return (
    <>
      <AudioRecorder
        id={""}
        uploadAudio={props.uploadAudio}
        onClick={props.onClick}
      />
      {props.elemBetweenRecordAndPlay}
      {audioButtons}
    </>
  );
}
