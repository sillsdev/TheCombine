import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    mergeWords: build.mutation<MergeWordsApiResponse, MergeWordsApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/merge`,
        method: "PUT",
        body: queryArg.body,
      }),
    }),
    undoMerge: build.mutation<UndoMergeApiResponse, UndoMergeApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/merge/undo`,
        method: "PUT",
        body: queryArg.mergeUndoIds,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export type MergeWordsApiResponse = /** status 200 Success */ string[];
export type MergeWordsApiArg = {
  projectId: string;
  body: MergeWords[];
};
export type UndoMergeApiResponse = /** status 200 Success */ boolean;
export type UndoMergeApiArg = {
  projectId: string;
  mergeUndoIds: MergeUndoIds;
};
export type Definition = {
  language: string;
  text: string;
};
export type Gloss = {
  language: string;
  def: string;
};
export type SemanticDomain = {
  mongoId?: string | null;
  guid: string;
  name: string;
  id: string;
  lang: string;
  userId?: string | null;
  created?: string | null;
};
export type Status =
  | "Active"
  | "Deleted"
  | "Duplicate"
  | "Protected"
  | "Separate";
export type Sense = {
  guid: string;
  definitions: Definition[];
  glosses: Gloss[];
  semanticDomains: SemanticDomain[];
  accessibility: Status;
};
export type Note = {
  language: string;
  text: string;
};
export type Flag = {
  active: boolean;
  text: string;
};
export type Word = {
  id: string;
  guid: string;
  vernacular: string;
  plural?: string | null;
  senses: Sense[];
  audio: string[];
  created: string;
  modified: string;
  accessibility: Status;
  history: string[];
  partOfSpeech?: string | null;
  editedBy?: string[] | null;
  otherField?: string | null;
  projectId: string;
  note: Note;
  flag: Flag;
};
export type MergeSourceWord = {
  srcWordId: string;
  getAudio: boolean;
};
export type MergeWords = {
  parent: Word;
  children: MergeSourceWord[];
  deleteOnly: boolean;
};
export type MergeUndoIds = {
  parentIds: string[];
  childIds: string[];
};
export const { useMergeWordsMutation, useUndoMergeMutation } = injectedRtkApi;
