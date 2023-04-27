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
  }),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export type EmailInviteToProjectApiResponse = /** status 200 Success */ string;
export type EmailInviteToProjectApiArg = {
  emailInviteData: EmailInviteData;
};
export type EmailInviteData = {
  emailAddress: string;
  message: string;
  projectId: string;
  domain: string;
};
export const { useEmailInviteToProjectMutation } = injectedRtkApi;
