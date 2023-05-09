import Pronunciations from "components/Pronunciations/PronunciationsComponent";
import Recorder from "components/Pronunciations/Recorder";
import {
  deleteAudio,
  uploadAudio,
} from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesActions";
import { useAppDispatch } from "types/hooks";

interface PronunciationsCellProps {
  wordId: string;
  pronunciationFiles: string[];
  recorder?: Recorder;
}

/** Used to connect the pronunciation component to the deleteAudio and uploadAudio actions */
export default function PronunciationsCell(props: PronunciationsCellProps) {
  const dispatch = useAppDispatch();
  const dispatchDelete = (wordId: string, fileName: string) =>
    dispatch(deleteAudio(wordId, fileName));
  const dispatchUpload = (oldWordId: string, audioFile: File) =>
    dispatch(uploadAudio(oldWordId, audioFile));

  return (
    <Pronunciations
      wordId={props.wordId}
      pronunciationFiles={props.pronunciationFiles}
      recorder={props.recorder}
      deleteAudio={dispatchDelete}
      uploadAudio={dispatchUpload}
    />
  );
}
