import { uploadAudio } from "backend";

/** Generate a timestamp-based file name for the given `wordId`. */
export function getFileNameForWord(wordId: string): string {
  const fourCharParts = wordId.match(/.{1,6}/g);
  const compressed = fourCharParts?.map((i) =>
    Number("0x" + i).toString(36)
  ) ?? ["unknownWord"];
  return compressed.join("") + "_" + new Date().getTime().toString(36);
}

/** Given an audio file `url` that was generated with `URL.createObjectURL()`,
 * add that audio file to the word with the given `wordId`.
 * Return the id of the updated word. */
export async function uploadFileFromUrl(
  wordId: string,
  url: string,
  speakerId = ""
): Promise<string> {
  const audioBlob = await fetch(url).then((result) => result.blob());
  const fileName = getFileNameForWord(wordId);
  const audioFile = new File([audioBlob], fileName, {
    type: audioBlob.type,
    lastModified: Date.now(),
  });
  const newId = await uploadAudio(wordId, audioFile, speakerId);
  URL.revokeObjectURL(url);
  return newId;
}
