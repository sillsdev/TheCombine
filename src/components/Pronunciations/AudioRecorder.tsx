import React from "react";
import { Translate } from "react-localize-redux";
import { toast, ToastContainer } from "react-toastify";

import Recorder from "components/Pronunciations/Recorder";
import RecorderIcon from "components/Pronunciations/RecorderIcon";

// Style ToastContainer.
import "react-toastify/dist/ReactToastify.min.css";

interface RecorderProps {
  wordId: string;
  recorder?: Recorder;
  uploadAudio?: (wordId: string, audioFile: File) => void;
}

export function getFileNameForWord(wordId: string): string {
  const fourCharParts = wordId.match(/.{1,6}/g);
  const compressed = fourCharParts?.map((i) =>
    Number("0x" + i).toString(36)
  ) ?? ["unknownword"];
  return compressed.join("") + "_" + new Date().getTime().toString(36);
}

export default function AudioRecorder(props: RecorderProps) {
  const recorder = props.recorder ?? new Recorder();

  function startRecording() {
    recorder.startRecording();
  }

  function stopRecording() {
    recorder
      .stopRecording()
      .then(() => {
        const blob = recorder.getBlob();
        const fileName = getFileNameForWord(props.wordId);
        const file = new File([blob], fileName, {
          type: blob.type,
          lastModified: Date.now(),
        });
        if (props.uploadAudio) {
          props.uploadAudio(props.wordId, file);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(<Translate id="pronunciations.noMicAccess" />);
      });
  }

  return (
    <React.Fragment>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <RecorderIcon
        wordId={props.wordId}
        startRecording={startRecording}
        stopRecording={stopRecording}
      />
    </React.Fragment>
  );
}
