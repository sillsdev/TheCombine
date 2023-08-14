import { emptySplitApi as api } from "./emptyApi";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
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
  useGetProjectUserRolesQuery,
  useDeleteProjectUserRolesMutation,
  useCreateUserRoleMutation,
  useGetUserRoleQuery,
  useDeleteUserRoleMutation,
  useUpdateUserRolePermissionsMutation,
} = injectedRtkApi;
