import { memo, ReactElement } from "react";

import { Pronunciation } from "api/models";
import { getAudioUrl } from "backend";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import { FileWithSpeakerId } from "types/word";

interface PronunciationsBackendProps {
  audio: Pronunciation[];
  playerOnly?: boolean;
  overrideMemo?: boolean;
  wordId: string;
  deleteAudio: (fileName: string) => void;
  replaceAudio: (audio: Pronunciation) => void;
  uploadAudio?: (file: FileWithSpeakerId) => void;
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

  const audioButtons: ReactElement[] = props.audio.map((a) => (
    <AudioPlayer
      audio={a}
      deleteAudio={props.deleteAudio}
      key={a.fileName}
      pronunciationUrl={getAudioUrl(props.wordId, a.fileName)}
      updateAudioSpeaker={(id) =>
        props.replaceAudio({ ...a, speakerId: id ?? "" })
      }
    />
  ));

  return (
    <>
      {!props.playerOnly && !!props.uploadAudio && (
        <AudioRecorder id={props.wordId} uploadAudio={props.uploadAudio} />
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
    JSON.stringify(prev.audio) === JSON.stringify(next.audio)
  );
}

export default memo(PronunciationsBackend, propsAreEqual);
