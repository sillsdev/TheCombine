import axios from "axios";
import { StatusCodes } from "http-status-codes";

import * as Api from "api";
import { BASE_PATH } from "api/base";
import * as LocalStorage from "backend/localStorage";
import history, { Path } from "browserHistory";
import authHeader from "components/Login/AuthHeaders";
import { EmailInviteStatus } from "types/invite";
import { Goal, GoalStep, UserEdit } from "types/goals";
import { convertGoalToEdit } from "types/goalUtilities";
import { Permission, Project, UserRole } from "types/project";
import { RuntimeConfig } from "types/runtimeConfig";
import { User } from "types/user";
import { MergeWords, Word } from "types/word";

export const baseURL = `${RuntimeConfig.getInstance().baseUrl()}`;
const apiBaseURL = `${baseURL}/v1`;
const config_parameters: Api.ConfigurationParameters = { basePath: baseURL };
const config = new Api.Configuration(config_parameters);

// Create an axios instance to allow for attaching interceptors to it.
const axiosInstance = axios.create({ baseURL: apiBaseURL });

axiosInstance.interceptors.response.use(undefined, (err) => {
  if (err.response && err.response.status === StatusCodes.UNAUTHORIZED) {
    history.push(Path.Login);
  }
  return Promise.reject(err);
});

// Configured OpenAPI interfaces.
//const audioApi = new Api.AudioApi(config, BASE_PATH, axiosInstance);
//const avatarApi = new Api.AvatarApi(config, BASE_PATH, axiosInstance);
//const inviteApi = new Api.InviteApi(config, BASE_PATH, axiosInstance);
//const liftApi = new Api.LiftApi(config, BASE_PATH, axiosInstance);
const mergeApi = new Api.MergeApi(config, BASE_PATH, axiosInstance);
const projectApi = new Api.ProjectApi(config, BASE_PATH, axiosInstance);
const userApi = new Api.UserApi(config, BASE_PATH, axiosInstance);
const userEditApi = new Api.UserEditApi(config, BASE_PATH, axiosInstance);
const userRoleApi = new Api.UserRoleApi(config, BASE_PATH, axiosInstance);
const wordApi = new Api.WordApi(config, BASE_PATH, axiosInstance);

// TODO: Remove this once converted fully to OpenAPI.
const backendServer = axios.create({ baseURL: apiBaseURL });

backendServer.interceptors.response.use(undefined, (err) => {
  if (err.response && err.response.status === StatusCodes.UNAUTHORIZED) {
    history.push(Path.Login);
  }
  return Promise.reject(err);
});

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
  const data = new FormData();
  data.append("file", img);
  const resp = await backendServer.post(`users/${userId}/avatar/upload`, data, {
    headers: { ...authHeader(), "content-type": "application/json" },
  });
  if (userId === LocalStorage.getUserId()) {
    LocalStorage.setAvatar(await avatarSrc(userId));
  }
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
export async function mergeWords(mergeWords: MergeWords[]): Promise<string[]> {
  const resp = await mergeApi.mergeWords(
    { projectId: LocalStorage.getProjectId(), mergeWords },
    { headers: authHeader() }
  );
  return resp.data;
}

/** Adds a list of wordIds to current project's merge blacklist. */
export async function blacklistAdd(wordIds: string[]) {
  await mergeApi.blacklistAdd(
    { projectId: LocalStorage.getProjectId(), requestBody: wordIds },
    { headers: authHeader() }
  );
}

/** Get list of potential duplicates for merging. */
export async function getDuplicates(
  maxInList: number,
  maxLists: number
): Promise<Word[][]> {
  const projectId = LocalStorage.getProjectId();
  const userId = LocalStorage.getUserId();
  const resp = await mergeApi.getPotentialDuplicates(
    { projectId, maxInList, maxLists, userId },
    { headers: authHeader() }
  );
  return resp.data;
}

/* ProjectController.cs */

export async function getAllProjects(): Promise<Project[]> {
  const resp = await projectApi.getAllProjects({ headers: authHeader() });
  return resp.data;
}

export async function getAllUsersInCurrentProject(): Promise<User[]> {
  const resp = await projectApi.getAllProjectUsers(
    { projectId: LocalStorage.getProjectId() },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function createProject(project: Project): Promise<Project> {
  const resp = await projectApi.createProject(
    { project },
    { headers: authHeader() }
  );
  const user = resp.data.user;
  if (user.id === LocalStorage.getUserId()) {
    LocalStorage.setCurrentUser(user);
  }
  return resp.data.project;
}

export async function getAllActiveProjectsByUser(
  userId: string
): Promise<Project[]> {
  const user = await getUser(userId);
  const projectIds = Object.keys(user.projectRoles);
  const projects: Project[] = [];
  for (const projectId of projectIds) {
    try {
      await getProject(projectId).then(
        (project) => project.isActive && projects.push(project)
      );
    } catch (err) {
      /** If there was an error, the project probably was manually deleted
       from the database or is ill-formatted. */
      console.log(err);
    }
  }
  return projects;
}

export async function getProject(id?: string): Promise<Project> {
  const resp = await projectApi.getProject(
    { projectId: id ?? LocalStorage.getProjectId() },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getProjectName(id?: string): Promise<string> {
  return (await getProject(id)).name;
}

/** Updates project and returns id of updated project. */
export async function updateProject(project: Project): Promise<string> {
  const resp = await projectApi.updateProject(
    { projectId: project.id, project },
    { headers: authHeader() }
  );
  return resp.data;
}

/** Archives specified project and returns id. */
export async function archiveProject(id: string): Promise<string> {
  const project = await getProject(id);
  project.isActive = false;
  return await updateProject(project);
}

/** Restores specified archived project and returns id. */
export async function restoreProject(id: string): Promise<string> {
  const project = await getProject(id);
  project.isActive = true;
  return await updateProject(project);
}

/** Returns a boolean indicating whether the specified project name is already taken. */
export async function projectDuplicateCheck(
  projectName: string
): Promise<boolean> {
  const resp = await projectApi.projectDuplicateCheck(
    { projectName },
    { headers: authHeader() }
  );
  return resp.data;
}

/* UserController.cs */

export async function resetPasswordRequest(
  emailOrUsername: string
): Promise<boolean> {
  const domain = window.location.origin;
  return await userApi
    .resetPasswordRequest({
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
    .resetPassword({ passwordResetData: { token, newPassword } })
    .then(() => true)
    .catch(() => false);
}

/** Returns the created user with id assigned on creation. */
export async function addUser(user: User): Promise<User> {
  const resp = await userApi.createUser({ user }, { headers: authHeader() });
  return { ...user, id: resp.data };
}

/** Returns true if the username is in use already. */
export async function isUsernameTaken(username: string): Promise<boolean> {
  return (await userApi.checkUsername({ username })).data;
}

/** Returns true if the email address is in use already. */
export async function isEmailTaken(email: string): Promise<boolean> {
  return (await userApi.checkEmail({ email })).data;
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<User> {
  const resp = await userApi.authenticate(
    { credentials: { username, password } },
    { headers: authHeader() }
  );
  const user = resp.data;
  LocalStorage.setCurrentUser(user);
  if (user.hasAvatar) {
    LocalStorage.setAvatar(await avatarSrc(user.id));
  }
  return user;
}

export async function getAllUsers(): Promise<User[]> {
  return (await userApi.getAllUsers({ headers: authHeader() })).data;
}

export async function getUser(id: string): Promise<User> {
  return (await backendServer.get(`users/${id}`, { headers: authHeader() }))
    .data;
}

export async function updateUser(user: User): Promise<User> {
  const resp = await userApi.updateUser(
    { userId: user.id, user },
    { headers: authHeader() }
  );
  const updatedUser = { ...user, id: resp.data };
  if (updatedUser.id === LocalStorage.getUserId()) {
    LocalStorage.setCurrentUser(updatedUser);
  }
  return updatedUser;
}

export async function deleteUser(userId: string): Promise<string> {
  return (await userApi.deleteUser({ userId }, { headers: authHeader() })).data;
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
  const resp = await userEditApi.updateUserEditGoal(
    { projectId, userEditId, edit },
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
  const projectId = LocalStorage.getProjectId();
  const stepString = JSON.stringify(step);
  const userEditStepWrapper = { goalIndex, stepString, stepIndex };
  const resp = await userEditApi.updateUserEditStep(
    { projectId, userEditId, userEditStepWrapper },
    { headers: authHeader() }
  );
  return resp.data;
}

/** Returns User with updated .workedProjects */
export async function createUserEdit(): Promise<User> {
  const resp = await userEditApi.createUserEdit(
    { projectId: LocalStorage.getProjectId() },
    { headers: authHeader() }
  );
  const user = resp.data;
  LocalStorage.setCurrentUser(user);
  return user;
}

export async function getUserEditById(
  projectId: string,
  userEditId: string
): Promise<UserEdit> {
  const resp = await userEditApi.getUserEdit(
    { projectId, userEditId },
    { headers: authHeader() }
  );
  return resp.data;
}

/** Returns array with every UserEdit for the current project. */
export async function getAllUserEdits(): Promise<UserEdit[]> {
  const resp = await userEditApi.getProjectUserEdits(
    { projectId: LocalStorage.getProjectId() },
    { headers: authHeader() }
  );
  return resp.data;
}

/* UserRoleController.cs */

export async function getUserRoles(): Promise<UserRole[]> {
  const resp = await userRoleApi.getProjectUserRoles(
    { projectId: LocalStorage.getProjectId() },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function addUserRole(
  permission: Permission[],
  userId: string
): Promise<string> {
  const projectId = LocalStorage.getProjectId();
  const resp = await userRoleApi.updateUserRolePermissions(
    { projectId, userId, permission },
    { headers: authHeader() }
  );
  return resp.data;
}

/* WordController.cs */

export async function createWord(word: Word): Promise<Word> {
  const resp = await wordApi.createWord(
    { projectId: LocalStorage.getProjectId(), word },
    { headers: authHeader() }
  );
  return { ...word, id: resp.data };
}

export async function deleteFrontierWord(wordId: string): Promise<string> {
  const resp = await wordApi.deleteFrontierWord(
    { projectId: LocalStorage.getProjectId(), wordId },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getWord(wordId: string): Promise<Word> {
  const resp = await wordApi.getWord(
    { projectId: LocalStorage.getProjectId(), wordId },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getAllWords(): Promise<Word[]> {
  const resp = await wordApi.getProjectWords(
    { projectId: LocalStorage.getProjectId() },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getFrontierWords(): Promise<Word[]> {
  const resp = await wordApi.getProjectFrontierWords(
    { projectId: LocalStorage.getProjectId() },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function updateWord(word: Word): Promise<Word> {
  const resp = await wordApi.updateWord(
    { projectId: LocalStorage.getProjectId(), wordId: word.id, word },
    { headers: authHeader() }
  );
  return { ...word, id: resp.data };
}
