import { ReactElement } from "react";

import { Pronunciation } from "api/models";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import { FileWithSpeakerId } from "types/word";

interface PronunciationsFrontendProps {
  audio: Pronunciation[];
  elemBetweenRecordAndPlay?: ReactElement;
  deleteAudio: (fileName: string) => void;
  replaceAudio: (audio: Pronunciation) => void;
  uploadAudio: (file: FileWithSpeakerId) => void;
  onClick?: () => void;
}

/** Audio recording/playing component for audio being recorded and held in the frontend. */
export default function PronunciationsFrontend(
  props: PronunciationsFrontendProps
): ReactElement {
  const audioButtons: ReactElement[] = props.audio.map((a) => (
    <AudioPlayer
      audio={a}
      deleteAudio={props.deleteAudio}
      key={a.fileName}
      onClick={props.onClick}
      updateAudioSpeaker={(id) =>
        props.replaceAudio({ ...a, speakerId: id ?? "" })
      }
    />
  ));

  return (
    <>
      <AudioRecorder onClick={props.onClick} uploadAudio={props.uploadAudio} />
      {props.elemBetweenRecordAndPlay}
      {audioButtons}
    </>
  );
}
