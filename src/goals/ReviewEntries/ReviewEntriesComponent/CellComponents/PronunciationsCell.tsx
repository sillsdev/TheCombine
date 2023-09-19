import Pronunciations from "components/Pronunciations";
import {
  deleteAudio,
  uploadAudio,
} from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesActions";
import { useAppDispatch } from "types/hooks";

interface PronunciationsCellProps {
  audioFunctions?: {
    addNewAudio: (file: File) => void;
    delNewAudio: (url: string) => void;
    delOldAudio: (fileName: string) => void;
  };
  pronunciationFiles: string[];
  pronunciationsNew?: string[];
  wordId: string;
}

export default function PronunciationsCell(props: PronunciationsCellProps) {
  const dispatch = useAppDispatch();
  const dispatchDelete = (wordId: string, fileName: string) =>
    dispatch(deleteAudio(wordId, fileName));
  const dispatchUpload = (oldWordId: string, audioFile: File) =>
    dispatch(uploadAudio(oldWordId, audioFile));

  const { addNewAudio, delNewAudio, delOldAudio } = props.audioFunctions ?? {};

  return props.audioFunctions ? (
    <Pronunciations
      audioInFrontend
      pronunciationFiles={props.pronunciationsNew ?? []}
      spacer={
        <Pronunciations
          pronunciationFiles={props.pronunciationFiles}
          wordId={props.wordId}
          deleteAudio={(_, fileName: string) => delOldAudio!(fileName)}
        />
      }
      wordId={""}
      deleteAudio={(_, fileName: string) => delNewAudio!(fileName)}
      uploadAudio={(_, audioFile: File) => addNewAudio!(audioFile)}
    />
  ) : (
    <Pronunciations
      pronunciationFiles={props.pronunciationFiles}
      wordId={props.wordId}
      deleteAudio={dispatchDelete}
      uploadAudio={dispatchUpload}
    />
  );
}
