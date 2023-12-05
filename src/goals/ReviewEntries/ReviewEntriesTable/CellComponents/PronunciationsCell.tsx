import { ReactElement } from "react";

import { Pronunciation } from "api/models";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import PronunciationsFrontend from "components/Pronunciations/PronunciationsFrontend";
import {
  deleteAudio,
  replaceAudio,
  uploadAudio,
} from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import { useAppDispatch } from "types/hooks";
import { FileWithSpeakerId } from "types/word";

interface PronunciationsCellProps {
  audioFunctions?: {
    addNewAudio: (file: FileWithSpeakerId) => void;
    delNewAudio: (url: string) => void;
    repNewAudio: (audio: Pronunciation) => void;
    delOldAudio: (fileName: string) => void;
    repOldAudio: (audio: Pronunciation) => void;
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
  const dispatchReplace = (audio: Pronunciation): Promise<void> =>
    dispatch(replaceAudio(props.wordId, audio));
  const dispatchUpload = (file: FileWithSpeakerId): Promise<void> =>
    dispatch(uploadAudio(props.wordId, file));

  const { addNewAudio, delNewAudio, repNewAudio, delOldAudio, repOldAudio } =
    props.audioFunctions ?? {};

  return props.audioFunctions ? (
    <PronunciationsFrontend
      elemBetweenRecordAndPlay={
        <PronunciationsBackend
          audio={props.audio}
          overrideMemo
          playerOnly
          wordId={props.wordId}
          deleteAudio={delOldAudio!}
          replaceAudio={repOldAudio!}
        />
      }
      audio={props.audioNew ?? []}
      deleteAudio={delNewAudio!}
      replaceAudio={repNewAudio!}
      uploadAudio={addNewAudio!}
    />
  ) : (
    <PronunciationsBackend
      audio={props.audio}
      wordId={props.wordId}
      deleteAudio={dispatchDelete}
      replaceAudio={dispatchReplace}
      uploadAudio={dispatchUpload}
    />
  );
}
