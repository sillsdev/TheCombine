import { memo, ReactElement } from "react";

import * as backend from "backend";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import Recorder from "components/Pronunciations/Recorder";

interface PronunciationProps {
  wordId: string;
  pronunciationFiles: string[];
  recorder?: Recorder;
  deleteAudio?: (wordId: string, fileName: string) => void;
  getAudioUrl?: (wordId: string, fileName: string) => string;
  uploadAudio?: (wordId: string, audioFile: File) => void;
}

/** Audio recording/playing component */
export function Pronunciations(props: PronunciationProps): ReactElement {
  const audioButtons: ReactElement[] = props.pronunciationFiles.map(
    (fileName) => (
      <AudioPlayer
        key={fileName}
        wordId={props.wordId}
        fileName={fileName}
        pronunciationUrl={
          props.getAudioUrl
            ? props.getAudioUrl(props.wordId, fileName)
            : backend.getAudioUrl(props.wordId, fileName)
        }
        deleteAudio={props.deleteAudio}
      />
    )
  );
  return (
    <>
      <AudioRecorder
        wordId={props.wordId}
        recorder={props.recorder}
        uploadAudio={props.uploadAudio}
      />
      {audioButtons}
    </>
  );
}

// Memoize to decrease unnecessary fetching of audio files.
// https://dmitripavlutin.com/use-react-memo-wisely/#11-custom-equality-check-of-props
function pronunciationPropsAreEqual(
  prev: PronunciationProps,
  next: PronunciationProps
): boolean {
  return (
    prev.wordId === next.wordId &&
    JSON.stringify(prev.pronunciationFiles) ===
      JSON.stringify(next.pronunciationFiles)
  );
}

export default memo(Pronunciations, pronunciationPropsAreEqual);
