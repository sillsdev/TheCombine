import { memo, ReactElement } from "react";

import { getAudioUrl } from "backend";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";

interface PronunciationProps {
  audioInFrontend?: boolean;
  pronunciationFiles: string[];
  overrideMemo?: boolean;
  spacer?: ReactElement;
  wordId: string;
  deleteAudio: (wordId: string, fileName: string) => void;
  uploadAudio?: (wordId: string, audioFile: File) => void;
}

/** Audio recording/playing component */
export function Pronunciations(props: PronunciationProps): ReactElement {
  const audioButtons: ReactElement[] = props.pronunciationFiles.map(
    (fileName) => (
      <AudioPlayer
        fileName={fileName}
        key={fileName}
        pronunciationUrl={
          props.audioInFrontend ? fileName : getAudioUrl(props.wordId, fileName)
        }
        deleteAudio={(fileName: string) =>
          props.deleteAudio(props.wordId, fileName)
        }
      />
    )
  );

  return (
    <>
      {!!props.uploadAudio && (
        <AudioRecorder wordId={props.wordId} uploadAudio={props.uploadAudio} />
      )}
      {props.spacer}
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
  if (next.overrideMemo) {
    return false;
  }
  return (
    prev.wordId === next.wordId &&
    JSON.stringify(prev.pronunciationFiles) ===
      JSON.stringify(next.pronunciationFiles)
  );
}

export default memo(Pronunciations, pronunciationPropsAreEqual);
