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
    getWordsPerDayPerUserCounts: build.query<
      GetWordsPerDayPerUserCountsApiResponse,
      GetWordsPerDayPerUserCountsApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/statistics/GetWordsPerDayPerUserCounts`,
      }),
    }),
    resetPasswordRequest: build.mutation<
      ResetPasswordRequestApiResponse,
      ResetPasswordRequestApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/users/forgot`,
        method: "POST",
        body: queryArg.passwordResetRequestData,
      }),
    }),
    resetPassword: build.mutation<
      ResetPasswordApiResponse,
      ResetPasswordApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/users/forgot/reset`,
        method: "POST",
        body: queryArg.passwordResetData,
      }),
    }),
    deleteProjectWords: build.mutation<
      DeleteProjectWordsApiResponse,
      DeleteProjectWordsApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words`,
        method: "DELETE",
      }),
    }),
    getProjectWords: build.query<
      GetProjectWordsApiResponse,
      GetProjectWordsApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words`,
      }),
    }),
    createWord: build.mutation<CreateWordApiResponse, CreateWordApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words`,
        method: "POST",
        body: queryArg.word,
      }),
    }),
    deleteFrontierWord: build.mutation<
      DeleteFrontierWordApiResponse,
      DeleteFrontierWordApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words/frontier/${queryArg.wordId}`,
        method: "DELETE",
      }),
    }),
    getWord: build.query<GetWordApiResponse, GetWordApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words/${queryArg.wordId}`,
      }),
    }),
    updateWord: build.mutation<UpdateWordApiResponse, UpdateWordApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words/${queryArg.wordId}`,
        method: "PUT",
        body: queryArg.word,
      }),
    }),
    getProjectFrontierWords: build.query<
      GetProjectFrontierWordsApiResponse,
      GetProjectFrontierWordsApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words/frontier`,
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
export type GetWordsPerDayPerUserCountsApiResponse =
  /** status 200 Success */ WordsPerDayPerUserCount[];
export type GetWordsPerDayPerUserCountsApiArg = {
  projectId: string;
};
export type ResetPasswordRequestApiResponse = unknown;
export type ResetPasswordRequestApiArg = {
  passwordResetRequestData: PasswordResetRequestData;
};
export type ResetPasswordApiResponse = unknown;
export type ResetPasswordApiArg = {
  passwordResetData: PasswordResetData;
};
export type DeleteProjectWordsApiResponse = /** status 200 Success */ boolean;
export type DeleteProjectWordsApiArg = {
  projectId: string;
};
export type GetProjectWordsApiResponse = /** status 200 Success */ Word[];
export type GetProjectWordsApiArg = {
  projectId: string;
};
export type CreateWordApiResponse = /** status 200 Success */ string;
export type CreateWordApiArg = {
  projectId: string;
  word: Word;
};
export type DeleteFrontierWordApiResponse = /** status 200 Success */ string;
export type DeleteFrontierWordApiArg = {
  projectId: string;
  wordId: string;
};
export type GetWordApiResponse = /** status 200 Success */ Word;
export type GetWordApiArg = {
  projectId: string;
  wordId: string;
};
export type UpdateWordApiResponse = /** status 200 Success */ string;
export type UpdateWordApiArg = {
  projectId: string;
  wordId: string;
  word: Word;
};
export type GetProjectFrontierWordsApiResponse =
  /** status 200 Success */ Word[];
export type GetProjectFrontierWordsApiArg = {
  projectId: string;
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
export type WordsPerDayPerUserCount = {
  dateTime: string;
  userNameCountDictionary: {
    [key: string]: number;
  };
};
export type PasswordResetRequestData = {
  domain: string;
  emailOrUsername: string;
};
export type PasswordResetData = {
  newPassword: string;
  token: string;
};
export const {
  useMergeWordsMutation,
  useGetWordsPerDayPerUserCountsQuery,
  useResetPasswordRequestMutation,
  useResetPasswordMutation,
  useDeleteProjectWordsMutation,
  useGetProjectWordsQuery,
  useCreateWordMutation,
  useDeleteFrontierWordMutation,
  useGetWordQuery,
  useUpdateWordMutation,
  useGetProjectFrontierWordsQuery,
} = injectedRtkApi;
