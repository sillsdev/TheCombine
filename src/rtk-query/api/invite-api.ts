import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    emailInviteToProject: build.mutation<
      EmailInviteToProjectApiResponse,
      EmailInviteToProjectApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/invite`,
        method: "PUT",
        body: queryArg.emailInviteData,
      }),
    }),
    validateToken: build.mutation<
      ValidateTokenApiResponse,
      ValidateTokenApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/invite/${queryArg.projectId}/validate/${queryArg.token}`,
        method: "PUT",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export type EmailInviteToProjectApiResponse = /** status 200 Success */ string;
export type EmailInviteToProjectApiArg = {
  emailInviteData: EmailInviteData;
};
export type ValidateTokenApiResponse =
  /** status 200 Success */ EmailInviteStatus;
export type ValidateTokenApiArg = {
  projectId: string;
  token: string;
};
export type EmailInviteData = {
  emailAddress: string;
  message: string;
  projectId: string;
  domain: string;
};
export type EmailInviteStatus = {
  isTokenValid: boolean;
  isUserRegistered: boolean;
};
export const { useEmailInviteToProjectMutation, useValidateTokenMutation } =
  injectedRtkApi;
