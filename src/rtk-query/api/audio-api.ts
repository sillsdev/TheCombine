import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    downloadAudioFile: build.query<
      DownloadAudioFileApiResponse,
      DownloadAudioFileApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words/${queryArg.wordId}/audio/download/${queryArg.fileName}`,
      }),
    }),
    uploadAudioFile: build.mutation<
      UploadAudioFileApiResponse,
      UploadAudioFileApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words/${queryArg.wordId}/audio/upload`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    deleteAudioFile: build.mutation<
      DeleteAudioFileApiResponse,
      DeleteAudioFileApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words/${queryArg.wordId}/audio/delete/${queryArg.fileName}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export type DownloadAudioFileApiResponse = /** status 200 Success */ Blob;
export type DownloadAudioFileApiArg = {
  projectId: string;
  wordId: string;
  fileName: string;
};
export type UploadAudioFileApiResponse = /** status 200 Success */ string;
export type UploadAudioFileApiArg = {
  projectId: string;
  wordId: string;
  body: {
    File: Blob;
    Name: string;
    FilePath: string;
  };
};
export type DeleteAudioFileApiResponse = /** status 200 Success */ string;
export type DeleteAudioFileApiArg = {
  projectId: string;
  wordId: string;
  fileName: string;
};
export const {
  useDownloadAudioFileQuery,
  useUploadAudioFileMutation,
  useDeleteAudioFileMutation,
} = injectedRtkApi;
