import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllProjectUsers: build.query<
      GetAllProjectUsersApiResponse,
      GetAllProjectUsersApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/users`,
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
    getSemanticDomainUserCounts: build.query<
      GetSemanticDomainUserCountsApiResponse,
      GetSemanticDomainUserCountsApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/statistics/GetSemanticDomainUserCounts`,
        params: { lang: queryArg.lang },
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
    getAllUsers: build.query<GetAllUsersApiResponse, GetAllUsersApiArg>({
      query: () => ({ url: `/v1/users` }),
    }),
    createUser: build.mutation<CreateUserApiResponse, CreateUserApiArg>({
      query: (queryArg) => ({
        url: `/v1/users`,
        method: "POST",
        body: queryArg.user,
      }),
    }),
    getUser: build.query<GetUserApiResponse, GetUserApiArg>({
      query: (queryArg) => ({ url: `/v1/users/${queryArg.userId}` }),
    }),
    updateUser: build.mutation<UpdateUserApiResponse, UpdateUserApiArg>({
      query: (queryArg) => ({
        url: `/v1/users/${queryArg.userId}`,
        method: "PUT",
        body: queryArg.user,
      }),
    }),
    deleteUser: build.mutation<DeleteUserApiResponse, DeleteUserApiArg>({
      query: (queryArg) => ({
        url: `/v1/users/${queryArg.userId}`,
        method: "DELETE",
      }),
    }),
    getUserByEmail: build.query<
      GetUserByEmailApiResponse,
      GetUserByEmailApiArg
    >({
      query: (queryArg) => ({ url: `/v1/users/getemail/${queryArg.email}` }),
    }),
    checkUsername: build.query<CheckUsernameApiResponse, CheckUsernameApiArg>({
      query: (queryArg) => ({
        url: `/v1/users/isusernametaken/${queryArg.username}`,
      }),
    }),
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
    getProjectUserRoles: build.query<
      GetProjectUserRolesApiResponse,
      GetProjectUserRolesApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/userroles`,
      }),
    }),
    deleteProjectUserRoles: build.mutation<
      DeleteProjectUserRolesApiResponse,
      DeleteProjectUserRolesApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/userroles`,
        method: "DELETE",
      }),
    }),
    createUserRole: build.mutation<
      CreateUserRoleApiResponse,
      CreateUserRoleApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/userroles`,
        method: "POST",
        body: queryArg.userRole,
      }),
    }),
    getUserRole: build.query<GetUserRoleApiResponse, GetUserRoleApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/userroles/${queryArg.userRoleId}`,
      }),
    }),
    deleteUserRole: build.mutation<
      DeleteUserRoleApiResponse,
      DeleteUserRoleApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/userroles/${queryArg.userId}`,
        method: "DELETE",
      }),
    }),
    updateUserRolePermissions: build.mutation<
      UpdateUserRolePermissionsApiResponse,
      UpdateUserRolePermissionsApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/userroles/${queryArg.userId}`,
        method: "PUT",
        body: queryArg.body,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as enhancedApi };
export type GetAllProjectUsersApiResponse = /** status 200 Success */ User[];
export type GetAllProjectUsersApiArg = {
  projectId: string;
};
export type GetWordsPerDayPerUserCountsApiResponse =
  /** status 200 Success */ WordsPerDayPerUserCount[];
export type GetWordsPerDayPerUserCountsApiArg = {
  projectId: string;
};
export type GetSemanticDomainUserCountsApiResponse =
  /** status 200 Success */ SemanticDomainUserCount[];
export type GetSemanticDomainUserCountsApiArg = {
  projectId: string;
  lang?: string;
};
export type ResetPasswordRequestApiResponse = unknown;
export type ResetPasswordRequestApiArg = {
  passwordResetRequestData: PasswordResetRequestData;
};
export type ResetPasswordApiResponse = unknown;
export type ResetPasswordApiArg = {
  passwordResetData: PasswordResetData;
};
export type GetAllUsersApiResponse = /** status 200 Success */ User[];
export type GetAllUsersApiArg = void;
export type CreateUserApiResponse = /** status 200 Success */ string;
export type CreateUserApiArg = {
  user: User;
};
export type GetUserApiResponse = /** status 200 Success */ User;
export type GetUserApiArg = {
  userId: string;
};
export type UpdateUserApiResponse = /** status 200 Success */ string;
export type UpdateUserApiArg = {
  userId: string;
  user: User;
};
export type DeleteUserApiResponse = /** status 200 Success */ string;
export type DeleteUserApiArg = {
  userId: string;
};
export type GetUserByEmailApiResponse = /** status 200 Success */ User;
export type GetUserByEmailApiArg = {
  email: string;
};
export type CheckUsernameApiResponse = /** status 200 Success */ boolean;
export type CheckUsernameApiArg = {
  username: string;
};
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
export type GetProjectUserRolesApiResponse =
  /** status 200 Success */ UserRole[];
export type GetProjectUserRolesApiArg = {
  projectId: string;
};
export type DeleteProjectUserRolesApiResponse =
  /** status 200 Success */ boolean;
export type DeleteProjectUserRolesApiArg = {
  projectId: string;
};
export type CreateUserRoleApiResponse = /** status 200 Success */ string;
export type CreateUserRoleApiArg = {
  projectId: string;
  userRole: UserRole;
};
export type GetUserRoleApiResponse = /** status 200 Success */ UserRole;
export type GetUserRoleApiArg = {
  projectId: string;
  userRoleId: string;
};
export type DeleteUserRoleApiResponse = /** status 200 Success */ boolean;
export type DeleteUserRoleApiArg = {
  projectId: string;
  userId: string;
};
export type UpdateUserRolePermissionsApiResponse =
  /** status 200 Success */ string;
export type UpdateUserRolePermissionsApiArg = {
  projectId: string;
  userId: string;
  body: Permission[];
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
export type WordsPerDayPerUserCount = {
  dateTime: string;
  userNameCountDictionary: {
    [key: string]: number;
  };
};
export type SemanticDomainUserCount = {
  id: string;
  username?: string | null;
  domainSet: string[];
  domainCount?: number;
  wordCount?: number;
};
export type PasswordResetRequestData = {
  domain: string;
  emailOrUsername: string;
};
export type PasswordResetData = {
  newPassword: string;
  token: string;
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
export type UserEditStepWrapper = {
  goalIndex: number;
  stepString: string;
  stepIndex?: number | null;
};
export type Permission =
  | "WordEntry"
  | "MergeAndReviewEntries"
  | "ImportExport"
  | "DeleteEditSettingsAndUsers"
  | "Owner";
export type UserRole = {
  id: string;
  permissions: Permission[];
  projectId: string;
};
export const {
  useGetAllProjectUsersQuery,
  useGetWordsPerDayPerUserCountsQuery,
  useGetSemanticDomainUserCountsQuery,
  useResetPasswordRequestMutation,
  useResetPasswordMutation,
  useGetAllUsersQuery,
  useCreateUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserByEmailQuery,
  useCheckUsernameQuery,
  useGetProjectUserEditsQuery,
  useCreateUserEditMutation,
  useGetUserEditQuery,
  useUpdateUserEditGoalMutation,
  useUpdateUserEditStepMutation,
  useDeleteUserEditMutation,
  useGetProjectUserRolesQuery,
  useDeleteProjectUserRolesMutation,
  useCreateUserRoleMutation,
  useGetUserRoleQuery,
  useDeleteUserRoleMutation,
  useUpdateUserRolePermissionsMutation,
} = injectedRtkApi;
