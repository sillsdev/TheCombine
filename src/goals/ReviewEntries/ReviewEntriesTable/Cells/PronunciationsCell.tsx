import { ReactElement } from "react";

import { Pronunciation } from "api/models";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import {
  deleteAudio,
  replaceAudio,
  uploadAudio,
} from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { useAppDispatch } from "types/hooks";
import { FileWithSpeakerId } from "types/word";

export default function PronunciationsCell(props: CellProps): ReactElement {
  const wordId = props.rowData.id;
  const dispatch = useAppDispatch();
  const dispatchDelete = (fileName: string): Promise<void> =>
    dispatch(deleteAudio(wordId, fileName));
  const dispatchReplace = (audio: Pronunciation): Promise<void> =>
    dispatch(replaceAudio(wordId, audio));
  const dispatchUpload = (file: FileWithSpeakerId): Promise<void> =>
    dispatch(uploadAudio(wordId, file));

  return (
    <PronunciationsBackend
      audio={props.rowData.audio}
      wordId={wordId}
      deleteAudio={dispatchDelete}
      replaceAudio={dispatchReplace}
      uploadAudio={dispatchUpload}
    />
  );
}
