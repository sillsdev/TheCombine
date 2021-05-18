import axios from "axios";
import { StatusCodes } from "http-status-codes";

import * as Api from "api";
import * as LocalStorage from "backend/localStorage";
import history, { Path } from "browserHistory";
import authHeader from "components/Login/AuthHeaders";
import { EmailInviteStatus } from "types/invite";
import { Goal, GoalStep } from "types/goals";
import { convertGoalToEdit } from "types/goalUtilities";
import { Project } from "types/project";
import { RuntimeConfig } from "types/runtimeConfig";
import SemanticDomainWithSubdomains from "types/SemanticDomain";
import { User } from "types/user";
import { UserEdit } from "types/userEdit";
import { UserRole } from "types/userRole";
import { MergeWords, Word } from "types/word";

export const baseURL = `${RuntimeConfig.getInstance().baseUrl()}`;
const apiBaseURL = `${baseURL}/v1`;
const config_parameters: Api.ConfigurationParameters = { basePath: baseURL };
const config = new Api.Configuration(config_parameters);

// Configured OpenAPI interfaces.
//const audioApi = new Api.AudioApi();
//const avatarApi = new Api.AvatarApi();
//const inviteApi = new Api.InviteApi();
//const liftApi = new Api.LiftApi();
//const mergeApi = new Api.MergeApi();
//const projectApi = new Api.ProjectApi();
const userApi = new Api.UserApi(config);
//const userEditApi = new Api.UserEditApi(config);
//const userRoleApi = new Api.UserRoleApi(config);
const wordApi = new Api.WordApi(config);

// TODO: Remove this once converted fully to OpenAPI.
const backendServer = axios.create({
  baseURL: apiBaseURL,
});

backendServer.interceptors.response.use(
  (resp) => {
    if (resp.data.updatedUser) {
      LocalStorage.setCurrentUser(resp.data.updatedUser);
    }
    delete resp.data.updatedUser;
    return resp;
  },
  (err) => {
    if (err.response && err.response.status === StatusCodes.UNAUTHORIZED) {
      history.push(Path.Login);
    }
    return Promise.reject(err);
  }
);

/* Function in this file match up to functions in Backend/Controllers/. */

/* AudioController.cs */

export async function uploadAudio(
  wordId: string,
  audioFile: File
): Promise<string> {
  let data = new FormData();
  data.append("file", audioFile);
  let resp = await backendServer.post(
    `projects/${LocalStorage.getProjectId()}/words/${wordId}/audio/upload`,
    data,
    {
      headers: { ...authHeader(), "content-type": "application/json" },
    }
  );
  return resp.data;
}

export async function deleteAudio(
  wordId: string,
  fileName: string
): Promise<string> {
  let resp = await backendServer.delete(
    `projects/${LocalStorage.getProjectId()}/words/${wordId}/audio/delete/${fileName}`,
    { headers: authHeader() }
  );
  return resp.data;
}

export function getAudioUrl(wordId: string, fileName: string): string {
  return `${apiBaseURL}/projects/${LocalStorage.getProjectId()}/words/${wordId}/audio/download/${fileName}`;
}

/* AvatarController.cs */

export async function uploadAvatar(userId: string, img: File): Promise<string> {
  let data = new FormData();
  data.append("file", img);
  let resp = await backendServer.post(`users/${userId}/avatar/upload`, data, {
    headers: { ...authHeader(), "content-type": "application/json" },
  });
  return resp.data;
}

/** Returns the string to display the image inline in Base64 <img src= */
export async function avatarSrc(userId: string): Promise<string> {
  let resp = await backendServer.get(`users/${userId}/avatar/download`, {
    headers: authHeader(),
    responseType: "arraybuffer",
  });
  let image = btoa(
    new Uint8Array(resp.data).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );
  return `data:${resp.headers["content-type"].toLowerCase()};base64,${image}`;
}

/* InviteController.cs */

export async function emailInviteToProject(
  projectId: string,
  emailAddress: string,
  message: string
): Promise<string> {
  let resp = await backendServer.put(
    `invite`,
    {
      EmailAddress: emailAddress,
      Message: message,
      ProjectId: projectId,
      Domain: window.location.origin,
    },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function validateLink(
  projectId: string,
  token: string
): Promise<EmailInviteStatus> {
  let resp = await backendServer.put(
    `invite/${projectId}/validate/${token}`,
    "",
    { headers: authHeader() }
  );
  return resp.data;
}

/* LiftController.cs */

export async function uploadLift(
  project: Project,
  lift: File
): Promise<number> {
  let data = new FormData();
  data.append("file", lift);
  let resp = await backendServer.post(
    `projects/${project.id}/lift/upload`,
    data,
    {
      headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    }
  );
  return parseInt(resp.toString());
}

/** Tell the backend to create a LIFT file for the project. */
export async function exportLift(projectId: string) {
  let resp = await backendServer.get(`projects/${projectId}/lift/export`, {
    headers: authHeader(),
  });
  return resp.data;
}
/** After the backend confirms that a LIFT file is ready, download it. */
export async function downloadLift(projectId: string): Promise<string> {
  /** For details on how to download binary files with axios, see:
   *  https://github.com/axios/axios/issues/1392#issuecomment-447263985  */
  let resp = await backendServer.get(`projects/${projectId}/lift/download`, {
    headers: { ...authHeader(), Accept: "application/zip" },
    responseType: "blob",
  });
  return URL.createObjectURL(
    new Blob([resp.request.response], { type: "application/zip" })
  );
}
/** After downloading a LIFT file, clear it from the backend. */
export async function deleteLift(projectId?: string) {
  let projectIdToDelete = projectId ? projectId : LocalStorage.getProjectId();
  await backendServer.get(`projects/${projectIdToDelete}/lift/deleteexport`, {
    headers: authHeader(),
  });
}

export async function canUploadLift(): Promise<boolean> {
  let resp = await backendServer.get(
    `projects/${LocalStorage.getProjectId()}/lift/check`,
    { headers: authHeader() }
  );
  return resp.data;
}

/* MergeController.cs */

/** Returns array of ids of the post-merge words. */
export async function mergeWords(
  mergeWordsArray: MergeWords[]
): Promise<string[]> {
  const resp = await backendServer.put(
    `projects/${LocalStorage.getProjectId()}/merge`,
    mergeWordsArray,
    { headers: authHeader() }
  );
  return resp.data;
}

/** Adds a list of wordIds to current project's merge blacklist. */
export async function blacklistAdd(wordIds: string[]) {
  await backendServer.put(
    `/projects/${LocalStorage.getProjectId()}/merge/blacklist/add`,
    wordIds,
    { headers: authHeader() }
  );
}

/** Get list of potential duplicates for merging. */
export async function getDuplicates(
  maxInList: number,
  maxLists: number
): Promise<Word[][]> {
  const response = await backendServer.get(
    `/projects/${LocalStorage.getProjectId()}/merge/dups/${maxInList}/${maxLists}/${LocalStorage.getUserId()}`,
    { headers: authHeader() }
  );
  return response.data;
}

/* ProjectController.cs */

export async function getAllProjects(): Promise<Project[]> {
  let resp = await backendServer.get(`projects`, { headers: authHeader() });
  return resp.data;
}

export async function getAllUsersInCurrentProject(): Promise<User[]> {
  let resp = await backendServer.get(
    `projects/${LocalStorage.getProjectId()}/users`,
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getSemanticDomains(): Promise<
  SemanticDomainWithSubdomains[]
> {
  let resp = await backendServer.get(
    `projects/${LocalStorage.getProjectId()}/semanticdomains`,
    { headers: authHeader() }
  );
  return resp.data;
}

export async function createProject(project: Project): Promise<Project> {
  let resp = await backendServer.post(`projects/`, project, {
    headers: authHeader(),
  });
  return { ...resp.data };
}

export async function getAllActiveProjectsByUser(
  userId: string
): Promise<Project[]> {
  const user: User = await getUser(userId);
  const projectIds: string[] = Object.keys(user.projectRoles);
  let projects: Project[] = [];
  for (const projectId of projectIds) {
    try {
      await getProject(projectId).then((project) => {
        project.isActive && projects.push(project);
      });
    } catch (err) {
      /** If there was an error, the project probably was manually deleted
       from the database or is ill-formatted. */
      console.log(err);
    }
  }
  return projects;
}

export async function getProject(id?: string): Promise<Project> {
  if (!id) {
    id = LocalStorage.getProjectId();
  }
  let resp = await backendServer.get(`projects/${id}`, {
    headers: authHeader(),
  });
  return resp.data;
}

export async function getProjectName(id?: string): Promise<string> {
  return (await getProject(id)).name;
}

export async function updateProject(project: Project) {
  let resp = await backendServer.put(`projects/${project.id}`, project, {
    headers: authHeader(),
  });
  return resp.data;
}

export async function archiveProject(id: string) {
  let project = await backendServer.get(`projects/${id}`, {
    headers: authHeader(),
  });
  project.data.isActive = false;
  let resp = await backendServer.put(`projects/${id}`, project.data, {
    headers: authHeader(),
  });
  return resp.data;
}

export async function restoreProject(id: string) {
  let project = await backendServer.get(`projects/${id}`, {
    headers: authHeader(),
  });
  project.data.isActive = true;
  let resp = await backendServer.put(`projects/${id}`, project.data, {
    headers: authHeader(),
  });
  return resp.data;
}

export async function projectDuplicateCheck(
  projectName: string
): Promise<boolean> {
  let resp = await backendServer.get(`projects/duplicate/${projectName}`, {
    headers: authHeader(),
  });
  return resp.data;
}

/* UserController.cs */

export async function resetPasswordRequest(
  emailOrUsername: string
): Promise<boolean> {
  const domain = window.location.origin;
  return await userApi
    .v1UsersForgotPost({
      passwordResetRequestData: { domain, emailOrUsername },
    })
    .then(() => true)
    .catch(() => false);
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<boolean> {
  return await userApi
    .v1UsersForgotResetPost({ passwordResetData: { token, newPassword } })
    .then(() => true)
    .catch(() => false);
}

/** Returns the created user with id assigned on creation. */
export async function addUser(user: User): Promise<User> {
  const resp = await userApi.v1UsersPost({ user }, { headers: authHeader() });
  return { ...user, id: resp.data };
}

/** Returns true if the username is in use already. */
export async function isUsernameTaken(username: string): Promise<boolean> {
  return (await userApi.v1UsersIsusernametakenUsernameGet({ username })).data;
}

/** Returns true if the email address is in use already. */
export async function isEmailTaken(email: string): Promise<boolean> {
  return (await userApi.v1UsersIsemailtakenEmailGet({ email })).data;
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<User> {
  const resp = await userApi.v1UsersAuthenticatePost(
    { credentials: { username, password } },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getAllUsers(): Promise<User[]> {
  return (await userApi.v1UsersGet({ headers: authHeader() })).data;
}

export async function getUser(id: string): Promise<User> {
  return (await backendServer.get(`users/${id}`, { headers: authHeader() }))
    .data;
}

export async function updateUser(user: User): Promise<User> {
  const resp = await userApi.v1UsersUserIdPut(
    { userId: user.id, user },
    { headers: authHeader() }
  );
  return { ...user, id: resp.data };
}

export async function deleteUser(userId: string): Promise<string> {
  return (
    await userApi.v1UsersUserIdDelete({ userId }, { headers: authHeader() })
  ).data;
}

/* UserEditController.cs */

/** Returns index of added goal, or of updated goal
 * if goal with same guid already exists in the UserEdit */
export async function addGoalToUserEdit(
  userEditId: string,
  goal: Goal
): Promise<number> {
  const edit = convertGoalToEdit(goal);
  const projectId = LocalStorage.getProjectId();
  const resp = await backendServer.post(
    `projects/${projectId}/useredits/${userEditId}`,
    edit,
    { headers: authHeader() }
  );
  return resp.data;
}

/** Returns index of step within specified goal */
export async function addStepToGoal(
  userEditId: string,
  goalIndex: number,
  step: GoalStep,
  stepIndex?: number // If undefined, step will be added to end.
): Promise<number> {
  const stepString = JSON.stringify(step);
  const stepEditTuple = { goalIndex, stepString, stepIndex };
  return await backendServer
    .put(
      `projects/${LocalStorage.getProjectId()}/useredits/${userEditId}`,
      stepEditTuple,
      { headers: authHeader() }
    )
    .then((resp) => {
      return resp.data;
    });
}

/** Returns User with updated .workedProjects */
export async function createUserEdit(): Promise<User> {
  let resp = await backendServer.post(
    `projects/${LocalStorage.getProjectId()}/useredits`,
    "",
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getUserEditById(
  projId: string,
  index: string
): Promise<UserEdit> {
  let resp = await backendServer.get(`projects/${projId}/useredits/${index}`, {
    headers: authHeader(),
  });
  return resp.data;
}

/** Returns array with every UserEdit for the current project */
export async function getAllUserEdits(): Promise<UserEdit[]> {
  let resp = await backendServer.get(
    `projects/${LocalStorage.getProjectId()}/useredits`,
    { headers: authHeader() }
  );
  return resp.data;
}

/* UserRoleController.cs */

export async function getUserRoles(): Promise<UserRole[]> {
  let resp = await backendServer.get(
    `projects/${LocalStorage.getProjectId()}/userroles`,
    { headers: authHeader() }
  );
  return resp.data;
}

export async function addUserRole(
  permissions: number[],
  user: User
): Promise<void> {
  await backendServer.put(
    `projects/${LocalStorage.getProjectId()}/userroles/${user.id}`,
    permissions,
    { headers: authHeader() }
  );
}

/* WordController.cs */

export async function createWord(word: Word): Promise<Word> {
  const resp = await wordApi.v1ProjectsProjectIdWordsPost(
    { projectId: LocalStorage.getProjectId(), word },
    { headers: authHeader() }
  );
  return { ...word, id: resp.data };
}

export async function deleteFrontierWord(wordId: string): Promise<string> {
  const resp = await wordApi.v1ProjectsProjectIdWordsFrontierWordIdDelete(
    { projectId: LocalStorage.getProjectId(), wordId },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getWord(wordId: string): Promise<Word> {
  const resp = await wordApi.v1ProjectsProjectIdWordsWordIdGet(
    { projectId: LocalStorage.getProjectId(), wordId },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getAllWords(): Promise<Word[]> {
  const resp = await wordApi.v1ProjectsProjectIdWordsGet(
    { projectId: LocalStorage.getProjectId() },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getFrontierWords(): Promise<Word[]> {
  const resp = await wordApi.v1ProjectsProjectIdWordsFrontierGet(
    { projectId: LocalStorage.getProjectId() },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function updateWord(word: Word): Promise<Word> {
  const resp = await wordApi.v1ProjectsProjectIdWordsWordIdPut(
    { projectId: LocalStorage.getProjectId(), wordId: word.id, word },
    { headers: authHeader() }
  );
  return { ...word, id: resp.data };
}
