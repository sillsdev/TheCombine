import { ReactElement } from "react";

import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";

interface PronunciationFrontendProps {
  pronunciationFiles: string[];
  elemBetweenRecordAndPlay?: ReactElement;
  deleteAudio: (fileName: string) => void;
  uploadAudio: (audioFile: File) => void;
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
      />
    )
  );

  return (
    <>
      <AudioRecorder wordId={""} uploadAudio={props.uploadAudio} />
      {props.elemBetweenRecordAndPlay}
      {audioButtons}
    </>
  );
}
