import { ReactElement } from "react";

import { Pronunciation } from "api/models";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import PronunciationsFrontend from "components/Pronunciations/PronunciationsFrontend";
import {
  deleteAudio,
  uploadAudio,
} from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

interface PronunciationsCellProps {
  audioFunctions?: {
    addNewAudio: (file: File, speakerId?: string) => void;
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
  const speakerId = useAppSelector(
    (state: StoreState) => state.currentProjectState.speaker?.id
  );
  const dispatchDelete = (fileName: string): Promise<void> =>
    dispatch(deleteAudio(props.wordId, fileName));
  const dispatchUpload = (audioFile: File): Promise<void> =>
    dispatch(uploadAudio(props.wordId, audioFile, speakerId));

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
      uploadAudio={(file: File) => addNewAudio!(file, speakerId)}
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
