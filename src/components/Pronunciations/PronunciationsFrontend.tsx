import { ReactElement } from "react";

import { Pronunciation } from "api/models";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import { FileWithSpeakerId } from "types/word";

interface PronunciationFrontendProps {
  audio: Pronunciation[];
  elemBetweenRecordAndPlay?: ReactElement;
  deleteAudio: (fileName: string) => void;
  replaceAudio: (audio: Pronunciation) => void;
  uploadAudio: (file: FileWithSpeakerId) => void;
  onClick?: () => void;
}

/** Audio recording/playing component for audio being recorded and held in the frontend. */
export default function PronunciationsFrontend(
  props: PronunciationFrontendProps
): ReactElement {
  const audioButtons: ReactElement[] = props.audio.map((a) => (
    <AudioPlayer
      audio={a}
      key={a.fileName}
      deleteAudio={props.deleteAudio}
      updateAudioSpeaker={(id) =>
        props.replaceAudio({ ...a, speakerId: id ?? "" })
      }
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
