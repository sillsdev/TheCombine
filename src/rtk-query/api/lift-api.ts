import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    uploadLiftFile: build.mutation<
      UploadLiftFileApiResponse,
      UploadLiftFileApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/lift/upload`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    exportLiftFile: build.query<
      ExportLiftFileApiResponse,
      ExportLiftFileApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/lift/export`,
      }),
    }),
    downloadLiftFile: build.query<
      DownloadLiftFileApiResponse,
      DownloadLiftFileApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/lift/download`,
      }),
    }),
    deleteLiftFile: build.query<
      DeleteLiftFileApiResponse,
      DeleteLiftFileApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/lift/deleteexport`,
      }),
    }),
    canUploadLift: build.query<CanUploadLiftApiResponse, CanUploadLiftApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/lift/check`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export type UploadLiftFileApiResponse = /** status 200 Success */ number;
export type UploadLiftFileApiArg = {
  projectId: string;
  body: {
    File: Blob;
    Name: string;
    FilePath: string;
  };
};
export type ExportLiftFileApiResponse = /** status 200 Success */ string;
export type ExportLiftFileApiArg = {
  projectId: string;
};
export type DownloadLiftFileApiResponse = /** status 200 Success */ Blob;
export type DownloadLiftFileApiArg = {
  projectId: string;
};
export type DeleteLiftFileApiResponse = /** status 200 Success */ string;
export type DeleteLiftFileApiArg = {
  projectId: string;
};
export type CanUploadLiftApiResponse = /** status 200 Success */ boolean;
export type CanUploadLiftApiArg = {
  projectId: string;
};
export const {
  useUploadLiftFileMutation,
  useExportLiftFileQuery,
  useDownloadLiftFileQuery,
  useDeleteLiftFileQuery,
  useCanUploadLiftQuery,
} = injectedRtkApi;
