import { ReactElement } from "react";

import { Pronunciation } from "api/models";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import PronunciationsFrontend from "components/Pronunciations/PronunciationsFrontend";
import {
  deleteAudio,
  uploadAudio,
} from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import { useAppDispatch } from "types/hooks";

interface PronunciationsCellProps {
  audioFunctions?: {
    addNewAudio: (file: File) => void;
    delNewAudio: (url: string) => void;
    delOldAudio: (fileName: string) => void;
  };
  audio: Pronunciation[];
  audioNew?: Pronunciation[];
  wordId: string;
}

export default function PronunciationsCell(
  props: PronunciationsCellProps
): ReactElement {
  const dispatch = useAppDispatch();
  const dispatchDelete = (fileName: string): Promise<void> =>
    dispatch(deleteAudio(props.wordId, fileName));
  const dispatchUpload = (audioFile: File): Promise<void> =>
    dispatch(uploadAudio(props.wordId, audioFile));

  const { addNewAudio, delNewAudio, delOldAudio } = props.audioFunctions ?? {};

  return props.audioFunctions ? (
    <PronunciationsFrontend
      elemBetweenRecordAndPlay={
        <PronunciationsBackend
          audio={props.audio}
          overrideMemo
          playerOnly
          wordId={props.wordId}
          deleteAudio={delOldAudio!}
        />
      }
      audio={props.audioNew ?? []}
      deleteAudio={delNewAudio!}
      uploadAudio={addNewAudio!}
    />
  ) : (
    <PronunciationsBackend
      audio={props.audio}
      wordId={props.wordId}
      deleteAudio={dispatchDelete}
      uploadAudio={dispatchUpload}
    />
  );
}
