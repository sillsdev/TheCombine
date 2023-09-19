import { uploadAudio } from "backend";
import { getFileNameForWord } from "components/Pronunciations/AudioRecorder";

/*export async function uploadFile(wordId: string, file: File): Promise<string> {
  const fileName = getFileNameForWord(wordId);
  const audioFile = new File([file.slice()], fileName, {
    type: file.type,
    lastModified: Date.now(),
  });
  const newId = await uploadAudio(wordId, audioFile);
  return newId;
}*/

export async function uploadFileFromUrl(
  wordId: string,
  url: string
): Promise<string> {
  const audioBlob = await fetch(url).then((result) => result.blob());
  const fileName = getFileNameForWord(wordId);
  const audioFile = new File([audioBlob], fileName, {
    type: audioBlob.type,
    lastModified: Date.now(),
  });
  const newId = await uploadAudio(wordId, audioFile);
  URL.revokeObjectURL(url);
  return newId;
}
