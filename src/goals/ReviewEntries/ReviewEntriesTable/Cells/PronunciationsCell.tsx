import { type ReactElement } from "react";

import { type Pronunciation } from "api/models";
import { deleteAudio, getWord, updateWord, uploadAudio } from "backend";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { type FileWithSpeakerId, updateSpeakerInAudio } from "types/word";

export default function PronunciationsCell(props: CellProps): ReactElement {
  const wordId = props.word.id;

  const deleteAudioHandle = async (fileName: string): Promise<void> => {
    const newId = await deleteAudio(wordId, fileName);
    if (props.replace) {
      await props.replace(wordId, newId);
    }
  };

  const replaceAudioHandle = async (pro: Pronunciation): Promise<void> => {
    const word = await getWord(wordId);
    const audio = updateSpeakerInAudio(word.audio, pro);
    if (audio) {
      const newId = (await updateWord({ ...word, audio })).id;
      if (props.replace) {
        await props.replace(wordId, newId);
      }
    }
  };

  const uploadAudioHandle = async (file: FileWithSpeakerId): Promise<void> => {
    const newId = await uploadAudio(wordId, file);
    if (props.replace) {
      await props.replace(wordId, newId);
    }
  };

  return (
    <PronunciationsBackend
      audio={props.word.audio}
      wordId={wordId}
      deleteAudio={deleteAudioHandle}
      replaceAudio={replaceAudioHandle}
      uploadAudio={uploadAudioHandle}
    />
  );
}
