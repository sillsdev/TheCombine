import { ReactElement } from "react";

import { Pronunciation } from "api/models";
import { deleteAudio, getWord, updateWord, uploadAudio } from "backend";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { FileWithSpeakerId, updateSpeakerInAudio } from "types/word";

export default function PronunciationsCell(props: CellProps): ReactElement {
  const wordId = props.rowData.id;

  const deleteAudioHandle = async (fileName: string): Promise<void> => {
    const newId = await deleteAudio(wordId, fileName);
    if (props.replaceWord) {
      await props.replaceWord(wordId, newId);
    }
  };

  const replaceAudioHandle = async (pro: Pronunciation): Promise<void> => {
    const word = await getWord(wordId);
    const audio = updateSpeakerInAudio(word.audio, pro);
    if (audio) {
      const newId = (await updateWord({ ...word, audio })).id;
      if (props.replaceWord) {
        await props.replaceWord(wordId, newId);
      }
    }
  };

  const uploadAudioHandle = async (file: FileWithSpeakerId): Promise<void> => {
    const newId = await uploadAudio(wordId, file);
    if (props.replaceWord) {
      await props.replaceWord(wordId, newId);
    }
  };

  return (
    <PronunciationsBackend
      audio={props.rowData.audio}
      wordId={wordId}
      deleteAudio={deleteAudioHandle}
      replaceAudio={replaceAudioHandle}
      uploadAudio={uploadAudioHandle}
    />
  );
}
