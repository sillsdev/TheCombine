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
    getBanner: build.query<GetBannerApiResponse, GetBannerApiArg>({
      query: (queryArg) => ({
        url: `/v1/banner`,
        params: { type: queryArg["type"] },
      }),
    }),
    updateBanner: build.mutation<UpdateBannerApiResponse, UpdateBannerApiArg>({
      query: (queryArg) => ({
        url: `/v1/banner`,
        method: "PUT",
        body: queryArg.siteBanner,
      }),
    }),
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
    mergeWords: build.mutation<MergeWordsApiResponse, MergeWordsApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/merge`,
        method: "PUT",
        body: queryArg.body,
      }),
    }),
    undoMerge: build.mutation<UndoMergeApiResponse, UndoMergeApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/merge/undo`,
        method: "PUT",
        body: queryArg.mergeUndoIds,
      }),
    }),
    blacklistAdd: build.mutation<BlacklistAddApiResponse, BlacklistAddApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/merge/blacklist/add`,
        method: "PUT",
        body: queryArg.body,
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
    getAllProjects: build.query<
      GetAllProjectsApiResponse,
      GetAllProjectsApiArg
    >({
      query: () => ({ url: `/v1/projects` }),
    }),
    deleteAllProjects: build.mutation<
      DeleteAllProjectsApiResponse,
      DeleteAllProjectsApiArg
    >({
      query: () => ({ url: `/v1/projects`, method: "DELETE" }),
    }),
    createProject: build.mutation<
      CreateProjectApiResponse,
      CreateProjectApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects`,
        method: "POST",
        body: queryArg.project,
      }),
    }),
    getAllProjectUsers: build.query<
      GetAllProjectUsersApiResponse,
      GetAllProjectUsersApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/users`,
      }),
    }),
    getProject: build.query<GetProjectApiResponse, GetProjectApiArg>({
      query: (queryArg) => ({ url: `/v1/projects/${queryArg.projectId}` }),
    }),
    updateProject: build.mutation<
      UpdateProjectApiResponse,
      UpdateProjectApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}`,
        method: "PUT",
        body: queryArg.project,
      }),
    }),
    deleteProject: build.mutation<
      DeleteProjectApiResponse,
      DeleteProjectApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}`,
        method: "DELETE",
      }),
    }),
    putChars: build.mutation<PutCharsApiResponse, PutCharsApiArg>({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/characters`,
        method: "PUT",
        body: queryArg.project,
      }),
    }),
    projectDuplicateCheck: build.query<
      ProjectDuplicateCheckApiResponse,
      ProjectDuplicateCheckApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/duplicate/${queryArg.projectName}`,
      }),
    }),
    getSemanticDomainFull: build.query<
      GetSemanticDomainFullApiResponse,
      GetSemanticDomainFullApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/semanticdomain/domainFull`,
        params: { id: queryArg.id, lang: queryArg.lang },
      }),
    }),
    getSemanticDomainTreeNode: build.query<
      GetSemanticDomainTreeNodeApiResponse,
      GetSemanticDomainTreeNodeApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/semanticdomain/domainTreeNode`,
        params: { id: queryArg.id, lang: queryArg.lang },
      }),
    }),
    getSemanticDomainTreeNodeByName: build.query<
      GetSemanticDomainTreeNodeByNameApiResponse,
      GetSemanticDomainTreeNodeByNameApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/semanticdomain/domainByName`,
        params: { name: queryArg.name, lang: queryArg.lang },
      }),
    }),
    getAllSemanticDomainTreeNodes: build.query<
      GetAllSemanticDomainTreeNodesApiResponse,
      GetAllSemanticDomainTreeNodesApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/semanticdomain/domainGetAll`,
        params: { lang: queryArg.lang },
      }),
    }),
    getSemanticDomainCounts: build.query<
      GetSemanticDomainCountsApiResponse,
      GetSemanticDomainCountsApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/statistics/GetSemanticDomainCounts`,
        params: { lang: queryArg.lang },
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
    getProgressEstimationLineChartRoot: build.query<
      GetProgressEstimationLineChartRootApiResponse,
      GetProgressEstimationLineChartRootApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/statistics/GetProgressEstimationLineChartRoot`,
      }),
    }),
    getLineChartRootData: build.query<
      GetLineChartRootDataApiResponse,
      GetLineChartRootDataApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/statistics/GetLineChartRootData`,
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
    authenticate: build.mutation<AuthenticateApiResponse, AuthenticateApiArg>({
      query: (queryArg) => ({
        url: `/v1/users/authenticate`,
        method: "POST",
        body: queryArg.credentials,
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
    checkEmail: build.query<CheckEmailApiResponse, CheckEmailApiArg>({
      query: (queryArg) => ({
        url: `/v1/users/isemailtaken/${queryArg.email}`,
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
    isFrontierNonempty: build.query<
      IsFrontierNonemptyApiResponse,
      IsFrontierNonemptyApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words/isfrontiernonempty`,
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
    getDuplicateId: build.mutation<
      GetDuplicateIdApiResponse,
      GetDuplicateIdApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words/getduplicateid`,
        method: "POST",
        body: queryArg.word,
      }),
    }),
    updateDuplicate: build.mutation<
      UpdateDuplicateApiResponse,
      UpdateDuplicateApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/words/${queryArg.dupId}`,
        method: "POST",
        body: queryArg.word,
        params: { userId: queryArg.userId },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as backendApi };
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
export type GetBannerApiResponse = /** status 200 Success */ SiteBanner;
export type GetBannerApiArg = {
  type?: BannerType;
};
export type UpdateBannerApiResponse = /** status 200 Success */ boolean;
export type UpdateBannerApiArg = {
  siteBanner: SiteBanner;
};
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
export type MergeWordsApiResponse = /** status 200 Success */ string[];
export type MergeWordsApiArg = {
  projectId: string;
  body: MergeWords[];
};
export type UndoMergeApiResponse = /** status 200 Success */ boolean;
export type UndoMergeApiArg = {
  projectId: string;
  mergeUndoIds: MergeUndoIds;
};
export type BlacklistAddApiResponse = /** status 200 Success */ string[];
export type BlacklistAddApiArg = {
  projectId: string;
  body: string[];
};
export type GetPotentialDuplicatesApiResponse =
  /** status 200 Success */ Word[][];
export type GetPotentialDuplicatesApiArg = {
  projectId: string;
  maxInList: number;
  maxLists: number;
  userId: string;
};
export type GetAllProjectsApiResponse = /** status 200 Success */ Project[];
export type GetAllProjectsApiArg = void;
export type DeleteAllProjectsApiResponse = /** status 200 Success */ boolean;
export type DeleteAllProjectsApiArg = void;
export type CreateProjectApiResponse =
  /** status 200 Success */ UserCreatedProject;
export type CreateProjectApiArg = {
  project: Project;
};
export type GetAllProjectUsersApiResponse = /** status 200 Success */ User[];
export type GetAllProjectUsersApiArg = {
  projectId: string;
};
export type GetProjectApiResponse = /** status 200 Success */ Project;
export type GetProjectApiArg = {
  projectId: string;
};
export type UpdateProjectApiResponse = /** status 200 Success */ string;
export type UpdateProjectApiArg = {
  projectId: string;
  project: Project;
};
export type DeleteProjectApiResponse = unknown;
export type DeleteProjectApiArg = {
  projectId: string;
};
export type PutCharsApiResponse = /** status 200 Success */ Project;
export type PutCharsApiArg = {
  projectId: string;
  project: Project;
};
export type ProjectDuplicateCheckApiResponse =
  /** status 200 Success */ boolean;
export type ProjectDuplicateCheckApiArg = {
  projectName: string;
};
export type GetSemanticDomainFullApiResponse =
  /** status 200 Success */ SemanticDomainFull;
export type GetSemanticDomainFullApiArg = {
  id?: string;
  lang?: string;
};
export type GetSemanticDomainTreeNodeApiResponse =
  /** status 200 Success */ SemanticDomainTreeNode;
export type GetSemanticDomainTreeNodeApiArg = {
  id?: string;
  lang?: string;
};
export type GetSemanticDomainTreeNodeByNameApiResponse =
  /** status 200 Success */ SemanticDomainTreeNode;
export type GetSemanticDomainTreeNodeByNameApiArg = {
  name?: string;
  lang?: string;
};
export type GetAllSemanticDomainTreeNodesApiResponse =
  /** status 200 Success */ SemanticDomainTreeNode;
export type GetAllSemanticDomainTreeNodesApiArg = {
  lang?: string;
};
export type GetSemanticDomainCountsApiResponse =
  /** status 200 Success */ SemanticDomainCount[];
export type GetSemanticDomainCountsApiArg = {
  projectId: string;
  lang?: string;
};
export type GetWordsPerDayPerUserCountsApiResponse =
  /** status 200 Success */ WordsPerDayPerUserCount[];
export type GetWordsPerDayPerUserCountsApiArg = {
  projectId: string;
};
export type GetProgressEstimationLineChartRootApiResponse =
  /** status 200 Success */ ChartRootData;
export type GetProgressEstimationLineChartRootApiArg = {
  projectId: string;
};
export type GetLineChartRootDataApiResponse =
  /** status 200 Success */ ChartRootData;
export type GetLineChartRootDataApiArg = {
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
export type AuthenticateApiResponse = /** status 200 Success */ User;
export type AuthenticateApiArg = {
  credentials: Credentials;
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
export type CheckEmailApiResponse = /** status 200 Success */ boolean;
export type CheckEmailApiArg = {
  email: string;
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
export type IsFrontierNonemptyApiResponse = /** status 200 Success */ boolean;
export type IsFrontierNonemptyApiArg = {
  projectId: string;
};
export type GetProjectFrontierWordsApiResponse =
  /** status 200 Success */ Word[];
export type GetProjectFrontierWordsApiArg = {
  projectId: string;
};
export type GetDuplicateIdApiResponse = /** status 200 Success */ string;
export type GetDuplicateIdApiArg = {
  projectId: string;
  word: Word;
};
export type UpdateDuplicateApiResponse = /** status 200 Success */ string;
export type UpdateDuplicateApiArg = {
  projectId: string;
  dupId: string;
  userId?: string;
  word: Word;
};
export type BannerType = "None" | "Login" | "Announcement";
export type SiteBanner = {
  type: BannerType;
  text: string;
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
export type MergeUndoIds = {
  parentIds: string[];
  childIds: string[];
};
export type AutocompleteSetting = "Off" | "On";
export type WritingSystem = {
  name: string;
  bcp47: string;
  font: string;
};
export type CustomField = {
  name: string;
  type: string;
};
export type EmailInvite = {
  email: string;
  token: string;
  expireTime: string;
};
export type Project = {
  id: string;
  name: string;
  isActive: boolean;
  liftImported: boolean;
  definitionsEnabled: boolean;
  autocompleteSetting: AutocompleteSetting;
  semDomWritingSystem: WritingSystem;
  vernacularWritingSystem: WritingSystem;
  analysisWritingSystems: WritingSystem[];
  semanticDomains: SemanticDomain[];
  validCharacters: string[];
  rejectedCharacters: string[];
  customFields?: CustomField[] | null;
  wordFields?: string[] | null;
  partsOfSpeech?: string[] | null;
  inviteTokens: EmailInvite[];
  workshopSchedule?: string[] | null;
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
export type UserCreatedProject = {
  project: Project;
  user: User;
};
export type SemanticDomainFull = {
  mongoId?: string | null;
  guid: string;
  name: string;
  id: string;
  lang: string;
  userId?: string | null;
  created?: string | null;
  description: string;
  questions: string[];
};
export type SemanticDomainTreeNode = {
  mongoId?: string | null;
  lang: string;
  guid: string;
  name: string;
  id: string;
  previous?: SemanticDomain;
  next?: SemanticDomain;
  parent?: SemanticDomain;
  children: SemanticDomain[];
};
export type SemanticDomainCount = {
  semanticDomainTreeNode: SemanticDomainTreeNode;
  count: number;
};
export type WordsPerDayPerUserCount = {
  dateTime: string;
  userNameCountDictionary: {
    [key: string]: number;
  };
};
export type Dataset = {
  userName: string;
  data: number[];
};
export type ChartRootData = {
  dates: string[];
  datasets: Dataset[];
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
export type Credentials = {
  username: string;
  password: string;
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
  useDownloadAudioFileQuery,
  useUploadAudioFileMutation,
  useDeleteAudioFileMutation,
  useDownloadAvatarQuery,
  useUploadAvatarMutation,
  useGetBannerQuery,
  useUpdateBannerMutation,
  useEmailInviteToProjectMutation,
  useValidateTokenMutation,
  useUploadLiftFileMutation,
  useExportLiftFileQuery,
  useDownloadLiftFileQuery,
  useDeleteLiftFileQuery,
  useCanUploadLiftQuery,
  useMergeWordsMutation,
  useUndoMergeMutation,
  useBlacklistAddMutation,
  useGetPotentialDuplicatesQuery,
  useGetAllProjectsQuery,
  useDeleteAllProjectsMutation,
  useCreateProjectMutation,
  useGetAllProjectUsersQuery,
  useGetProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  usePutCharsMutation,
  useProjectDuplicateCheckQuery,
  useGetSemanticDomainFullQuery,
  useGetSemanticDomainTreeNodeQuery,
  useGetSemanticDomainTreeNodeByNameQuery,
  useGetAllSemanticDomainTreeNodesQuery,
  useGetSemanticDomainCountsQuery,
  useGetWordsPerDayPerUserCountsQuery,
  useGetProgressEstimationLineChartRootQuery,
  useGetLineChartRootDataQuery,
  useGetSemanticDomainUserCountsQuery,
  useResetPasswordRequestMutation,
  useResetPasswordMutation,
  useGetAllUsersQuery,
  useCreateUserMutation,
  useAuthenticateMutation,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserByEmailQuery,
  useCheckUsernameQuery,
  useCheckEmailQuery,
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
  useDeleteProjectWordsMutation,
  useGetProjectWordsQuery,
  useCreateWordMutation,
  useDeleteFrontierWordMutation,
  useGetWordQuery,
  useUpdateWordMutation,
  useIsFrontierNonemptyQuery,
  useGetProjectFrontierWordsQuery,
  useGetDuplicateIdMutation,
  useUpdateDuplicateMutation,
} = injectedRtkApi;
