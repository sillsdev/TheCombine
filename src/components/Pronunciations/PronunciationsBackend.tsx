import { memo, ReactElement } from "react";

import { getAudioUrl } from "backend";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";

interface PronunciationsBackendProps {
  playerOnly?: boolean;
  overrideMemo?: boolean;
  pronunciationFiles: string[];
  wordId: string;
  deleteAudio: (fileName: string) => void;
  uploadAudio?: (audioFile: File) => void;
}

/** Audio recording/playing component for backend audio. */
export function PronunciationsBackend(
  props: PronunciationsBackendProps
): ReactElement {
  if (props.playerOnly && props.uploadAudio) {
    console.warn("uploadAudio is defined but unused since playerOnly is true");
  }
  if (!props.playerOnly && !props.uploadAudio) {
    console.warn("uploadAudio undefined; playerOnly should be set to true");
  }

  const audioButtons: ReactElement[] = props.pronunciationFiles.map(
    (fileName) => (
      <AudioPlayer
        fileName={fileName}
        key={fileName}
        pronunciationUrl={getAudioUrl(props.wordId, fileName)}
        deleteAudio={props.deleteAudio}
      />
    )
  );

  return (
    <>
      {!props.playerOnly && !!props.uploadAudio && (
        <AudioRecorder wordId={props.wordId} uploadAudio={props.uploadAudio} />
      )}
      {audioButtons}
    </>
  );
}

// Memoize to decrease unnecessary fetching of audio files.
// https://dmitripavlutin.com/use-react-memo-wisely/#11-custom-equality-check-of-props
function propsAreEqual(
  prev: PronunciationsBackendProps,
  next: PronunciationsBackendProps
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

export default memo(PronunciationsBackend, propsAreEqual);
