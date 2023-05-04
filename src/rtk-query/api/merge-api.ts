import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    undoMerge: build.mutation<UndoMergeApiResponse, UndoMergeApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/merge/undo`,
        method: "PUT",
        body: queryArg.mergeUndoIds,
      }),
    }),
    getPotentialDuplicates: build.query<
      GetPotentialDuplicatesApiResponse,
      GetPotentialDuplicatesApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/merge/dups/${queryArg.maxInList}/${queryArg.maxLists}/${queryArg.userId}`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export type UndoMergeApiResponse = /** status 200 Success */ boolean;
export type UndoMergeApiArg = {
  projectId: string;
  mergeUndoIds: MergeUndoIds;
};
export type GetPotentialDuplicatesApiResponse =
  /** status 200 Success */ Word[][];
export type GetPotentialDuplicatesApiArg = {
  projectId: string;
  maxInList: number;
  maxLists: number;
  userId: string;
};
export type MergeUndoIds = {
  parentIds: string[];
  childIds: string[];
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
export const { useUndoMergeMutation, useGetPotentialDuplicatesQuery } =
  injectedRtkApi;
