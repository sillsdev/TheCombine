import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    downloadAvatar: build.query<
      DownloadAvatarApiResponse,
      DownloadAvatarApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/users/${queryArg.userId}/avatar/download`,
      }),
    }),
    uploadAvatar: build.mutation<UploadAvatarApiResponse, UploadAvatarApiArg>({
      query: (queryArg) => ({
        url: `/v1/users/${queryArg.userId}/avatar/upload`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export type DownloadAvatarApiResponse = /** status 200 Success */ Blob;
export type DownloadAvatarApiArg = {
  userId: string;
};
export type UploadAvatarApiResponse = unknown;
export type UploadAvatarApiArg = {
  userId: string;
  body: {
    File: Blob;
    Name: string;
    FilePath: string;
  };
};
export const { useDownloadAvatarQuery, useUploadAvatarMutation } =
  injectedRtkApi;
