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
    getProjectUserEdits: build.query<
      GetProjectUserEditsApiResponse,
      GetProjectUserEditsApiArg
    >({
      query: (queryArg) => ({
        url: `/v1/projects/${queryArg.projectId}/useredits`,
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
export type EmailInviteToProjectApiResponse = /** status 200 Success */ string;
export type EmailInviteToProjectApiArg = {
  emailInviteData: EmailInviteData;
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
export type GetProjectUserEditsApiResponse =
  /** status 200 Success */ UserEdit[];
export type GetProjectUserEditsApiArg = {
  projectId: string;
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
export type DeleteProjectWordsApiResponse = /** status 200 Success */ boolean;
export type DeleteProjectWordsApiArg = {
  projectId: string;
};
export type GetProjectWordsApiResponse = /** status 200 Success */ Word[];
export type GetProjectWordsApiArg = {
  projectId: string;
};
export type GetProjectFrontierWordsApiResponse =
  /** status 200 Success */ Word[];
export type GetProjectFrontierWordsApiArg = {
  projectId: string;
};
export type EmailInviteData = {
  emailAddress: string;
  message: string;
  projectId: string;
  domain: string;
};
export type AutocompleteSetting = "Off" | "On";
export type WritingSystem = {
  name: string;
  bcp47: string;
  font: string;
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
export type Definition = {
  language: string;
  text: string;
};
export type Gloss = {
  language: string;
  def: string;
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
export const {
  useEmailInviteToProjectMutation,
  useGetAllProjectsQuery,
  useDeleteAllProjectsMutation,
  useCreateProjectMutation,
  useGetAllProjectUsersQuery,
  useGetProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectUserEditsQuery,
  useGetProjectUserRolesQuery,
  useDeleteProjectUserRolesMutation,
  useDeleteProjectWordsMutation,
  useGetProjectWordsQuery,
  useGetProjectFrontierWordsQuery,
} = injectedRtkApi;
