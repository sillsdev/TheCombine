import { ReactElement } from "react";

import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";

interface PronunciationFrontendProps {
  pronunciationFiles: string[];
  elemBetweenRecordAndPlay?: ReactElement;
  deleteAudio: (fileName: string) => void;
  uploadAudio: (audioFile: File) => void;
  onClick?: () => void;
}

/** Audio recording/playing component for audio being recorded and held in the frontend. */
export default function PronunciationsFrontend(
  props: PronunciationFrontendProps
): ReactElement {
  const audioButtons: ReactElement[] = props.pronunciationFiles.map(
    (fileName) => (
      <AudioPlayer
        fileName={fileName}
        key={fileName}
        pronunciationUrl={fileName}
        deleteAudio={props.deleteAudio}
        onClick={props.onClick}
      />
    )
  );

  return (
    <>
      <AudioRecorder
        wordId={""}
        uploadAudio={props.uploadAudio}
        onClick={props.onClick}
      />
      {props.elemBetweenRecordAndPlay}
      {audioButtons}
    </>
  );
}
