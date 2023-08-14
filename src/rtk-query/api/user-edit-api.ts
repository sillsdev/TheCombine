import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjectUserEdits: build.query<
      GetProjectUserEditsApiResponse,
      GetProjectUserEditsApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/useredits`,
      }),
    }),
    createUserEdit: build.mutation<
      CreateUserEditApiResponse,
      CreateUserEditApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/useredits`,
        method: "POST",
      }),
    }),
    getUserEdit: build.query<GetUserEditApiResponse, GetUserEditApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/useredits/${queryArg.userEditId}`,
      }),
    }),
    updateUserEditGoal: build.mutation<
      UpdateUserEditGoalApiResponse,
      UpdateUserEditGoalApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/useredits/${queryArg.userEditId}`,
        method: "POST",
        body: queryArg.edit,
      }),
    }),
    updateUserEditStep: build.mutation<
      UpdateUserEditStepApiResponse,
      UpdateUserEditStepApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/useredits/${queryArg.userEditId}`,
        method: "PUT",
        body: queryArg.userEditStepWrapper,
      }),
    }),
    deleteUserEdit: build.mutation<
      DeleteUserEditApiResponse,
      DeleteUserEditApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/useredits/${queryArg.userEditId}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export type GetProjectUserEditsApiResponse =
  /** status 200 Success */ UserEdit[];
export type GetProjectUserEditsApiArg = {
  projectId: string;
};
export type CreateUserEditApiResponse = /** status 200 Success */ User;
export type CreateUserEditApiArg = {
  projectId: string;
};
export type GetUserEditApiResponse = /** status 200 Success */ UserEdit;
export type GetUserEditApiArg = {
  projectId: string;
  userEditId: string;
};
export type UpdateUserEditGoalApiResponse = /** status 200 Success */ number;
export type UpdateUserEditGoalApiArg = {
  projectId: string;
  userEditId: string;
  edit: Edit;
};
export type UpdateUserEditStepApiResponse = /** status 200 Success */ number;
export type UpdateUserEditStepApiArg = {
  projectId: string;
  userEditId: string;
  userEditStepWrapper: UserEditStepWrapper;
};
export type DeleteUserEditApiResponse = unknown;
export type DeleteUserEditApiArg = {
  projectId: string;
  userEditId: string;
};
export type Edit = {
  guid: string;
  goalType: number;
  stepData: string[];
  changes: string;
};
export type UserEdit = {
  id: string;
  edits: Edit[];
  projectId: string;
};
export type User = {
  id: string;
  avatar: string;
  hasAvatar: boolean;
  name: string;
  email: string;
  phone: string;
  otherConnectionField?: string | null;
  workedProjects: {
    [key: string]: string;
  };
  projectRoles: {
    [key: string]: string;
  };
  agreement?: boolean;
  password: string;
  username: string;
  uiLang?: string | null;
  token: string;
  isAdmin: boolean;
};
export type UserEditStepWrapper = {
  goalIndex: number;
  stepString: string;
  stepIndex?: number | null;
};
export const {
  useGetProjectUserEditsQuery,
  useCreateUserEditMutation,
  useGetUserEditQuery,
  useUpdateUserEditGoalMutation,
  useUpdateUserEditStepMutation,
  useDeleteUserEditMutation,
} = injectedRtkApi;
