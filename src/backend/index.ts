import axios, { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";

import * as Api from "api";
import {
  BannerType,
  EmailInviteStatus,
  MergeUndoIds,
  MergeWords,
  Permission,
  Project,
  SiteBanner,
  User,
  UserEdit,
  UserRole,
  Word,
} from "api/models";
import { BASE_PATH } from "api/base";
import * as LocalStorage from "backend/localStorage";
import history, { Path } from "browserHistory";
import authHeader from "components/Login/AuthHeaders";
import Swal from "sweetalert2";
import { Goal, GoalStep } from "types/goals";
import { convertGoalToEdit } from "types/goalUtilities";
import { RuntimeConfig } from "types/runtimeConfig";

export const baseURL = `${RuntimeConfig.getInstance().baseUrl()}`;
const apiBaseURL = `${baseURL}/v1`;
const config_parameters: Api.ConfigurationParameters = { basePath: baseURL };
const config = new Api.Configuration(config_parameters);

// Create an axios instance to allow for attaching interceptors to it.
const axiosInstance = axios.create({ baseURL: apiBaseURL });
axiosInstance.interceptors.response.use(undefined, (err: AxiosError) => {
  // Any status codes that falls outside the range of 2xx cause this function to
  // trigger.
  const url = err.config.url;
  const errorToast = Swal.mixin({
    toast: true,
    position: "bottom",
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    icon: "error",
    showCancelButton: true,
    cancelButtonText: "Dismiss",
  });

  const response = err.response;
  if (response) {
    const status = response.status;
    if (status === StatusCodes.UNAUTHORIZED) {
      history.push(Path.Login);
    }

    // Check for fatal errors (4xx-5xx).
    if (
      status >= StatusCodes.BAD_REQUEST &&
      status <= StatusCodes.NETWORK_AUTHENTICATION_REQUIRED
    ) {
      errorToast.fire({
        title: `${status} ${response.statusText}`,
        text: `${response.data}\n${err.config.url}`,
      });
    }
  } else {
    // Handle if backend is not reachable.
    errorToast.fire({
      title: `${err.message}`,
      text: `Unable to connect to server. Check your network settings.\n${url}`,
    });
  }

  return Promise.reject(err);
});

// Configured OpenAPI interfaces.
const audioApi = new Api.AudioApi(config, BASE_PATH, axiosInstance);
const avatarApi = new Api.AvatarApi(config, BASE_PATH, axiosInstance);
const bannerApi = new Api.BannerApi(config, BASE_PATH, axiosInstance);
const inviteApi = new Api.InviteApi(config, BASE_PATH, axiosInstance);
const liftApi = new Api.LiftApi(config, BASE_PATH, axiosInstance);
const mergeApi = new Api.MergeApi(config, BASE_PATH, axiosInstance);
const projectApi = new Api.ProjectApi(config, BASE_PATH, axiosInstance);
const userApi = new Api.UserApi(config, BASE_PATH, axiosInstance);
const userEditApi = new Api.UserEditApi(config, BASE_PATH, axiosInstance);
const userRoleApi = new Api.UserRoleApi(config, BASE_PATH, axiosInstance);
const wordApi = new Api.WordApi(config, BASE_PATH, axiosInstance);

// Backend controllers receiving a file via a "[FromForm] FileUpload fileUpload" param
// have the internal fields expanded by openapi-generator as params in our Api.
function fileUpload(file: File) {
  return { file, filePath: "", name: "" };
}

function defaultOptions() {
  return { headers: authHeader() };
}

/* AudioController.cs */

export async function uploadAudio(
  wordId: string,
  audioFile: File
): Promise<string> {
  const projectId = LocalStorage.getProjectId();
  const resp = await audioApi.uploadAudioFile(
    { projectId, wordId, ...fileUpload(audioFile) },
    { headers: { ...authHeader(), "content-type": "application/json" } }
  );
  return resp.data;
}

export async function deleteAudio(
  wordId: string,
  fileName: string
): Promise<string> {
  const params = { projectId: LocalStorage.getProjectId(), wordId, fileName };
  return (await audioApi.deleteAudioFile(params, defaultOptions())).data;
}

// Use of the returned url acts as an HttpGet.
export function getAudioUrl(wordId: string, fileName: string): string {
  return `${apiBaseURL}/projects/${LocalStorage.getProjectId()}/words/${wordId}/audio/download/${fileName}`;
}

/* AvatarController.cs */

export async function uploadAvatar(userId: string, imgFile: File) {
  const headers = { ...authHeader(), "content-type": "application/json" };
  await avatarApi.uploadAvatar({ userId, ...fileUpload(imgFile) }, { headers });
  if (userId === LocalStorage.getUserId()) {
    LocalStorage.setAvatar(await avatarSrc(userId));
  }
}

/** Returns the string to display the image inline in Base64 <img src= */
export async function avatarSrc(userId: string): Promise<string> {
  const options = { headers: authHeader(), responseType: "arraybuffer" };
  try {
    const resp = await avatarApi.downloadAvatar({ userId }, options);
    const image = Buffer.from(resp.data, "base64").toString("base64");
    return `data:${resp.headers["content-type"].toLowerCase()};base64,${image}`;
  } catch (e) {
    // Avatar fetching can fail if hasAvatar=True but the avatar path is broken.
    console.error(e);
    return "";
  }
}

/* BannerController.cs */

/**
 * Get the Banners from the backend.
 *
 * Note: This function does not require authentication. Anonymous users can
 * pull the banners since their purpose is to help give more context about
 * the server.
 */
export async function getBannerText(type: BannerType): Promise<string> {
  return (await bannerApi.getBanner({ type })).data.text;
}

export async function updateBanner(siteBanner: SiteBanner): Promise<boolean> {
  return (await bannerApi.updateBanner({ siteBanner }, defaultOptions())).data;
}

/* InviteController.cs */

export async function emailInviteToProject(
  projectId: string,
  emailAddress: string,
  message: string
): Promise<string> {
  const domain = window.location.origin;
  const resp = await inviteApi.emailInviteToProject(
    { emailInviteData: { emailAddress, message, projectId, domain } },
    defaultOptions()
  );
  return resp.data;
}

export async function validateLink(
  projectId: string,
  token: string
): Promise<EmailInviteStatus> {
  return (await inviteApi.validateToken({ projectId, token }, defaultOptions()))
    .data;
}

/* LiftController.cs */

export async function uploadLift(
  projectId: string,
  liftFile: File
): Promise<number> {
  const resp = await liftApi.uploadLiftFile(
    { projectId, ...fileUpload(liftFile) },
    { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } }
  );
  return resp.data;
}

/** Tell the backend to create a LIFT file for the project. */
export async function exportLift(projectId: string) {
  return (await liftApi.exportLiftFile({ projectId }, defaultOptions())).data;
}

/** After the backend confirms that a LIFT file is ready, download it. */
export async function downloadLift(projectId: string): Promise<string> {
  /** For details on how to download binary files with axios, see:
   *  https://github.com/axios/axios/issues/1392#issuecomment-447263985  */
  const headers = { ...authHeader(), Accept: "application/zip" };
  const resp = await liftApi.downloadLiftFile(
    { projectId },
    { headers, responseType: "blob" }
  );
  return URL.createObjectURL(
    new Blob([resp.request.response], { type: "application/zip" })
  );
}

/** After downloading a LIFT file, clear it from the backend. */
export async function deleteLift(projectId?: string) {
  projectId = projectId ? projectId : LocalStorage.getProjectId();
  await liftApi.deleteLiftFile({ projectId }, defaultOptions());
}

export async function canUploadLift(): Promise<boolean> {
  const projectId = LocalStorage.getProjectId();
  return (await liftApi.canUploadLift({ projectId }, defaultOptions())).data;
}

/* MergeController.cs */

/** Returns array of ids of the post-merge words. */
export async function mergeWords(mergeWords: MergeWords[]): Promise<string[]> {
  const params = { projectId: LocalStorage.getProjectId(), mergeWords };
  return (await mergeApi.mergeWords(params, defaultOptions())).data;
}

export async function undoMerge(wordIds: MergeUndoIds) {
  const params = {
    projectId: LocalStorage.getProjectId(),
    mergeUndoIds: wordIds,
  };
  return (await mergeApi.undoMerge(params, defaultOptions())).data;
}

/** Adds a list of wordIds to current project's merge blacklist. */
export async function blacklistAdd(wordIds: string[]) {
  await mergeApi.blacklistAdd(
    { projectId: LocalStorage.getProjectId(), requestBody: wordIds },
    defaultOptions()
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
    defaultOptions()
  );
  return resp.data;
}

/* ProjectController.cs */

export async function getAllProjects(): Promise<Project[]> {
  return (await projectApi.getAllProjects(defaultOptions())).data;
}

export async function getAllUsersInCurrentProject(): Promise<User[]> {
  const params = { projectId: LocalStorage.getProjectId() };
  return (await projectApi.getAllProjectUsers(params, defaultOptions())).data;
}

export async function createProject(project: Project): Promise<Project> {
  const resp = await projectApi.createProject({ project }, defaultOptions());
  const user = resp.data.user;
  if (user.id === LocalStorage.getUserId()) {
    LocalStorage.setCurrentUser(user);
  }
  return resp.data.project;
}

export async function getAllActiveProjectsByUser(
  userId: string
): Promise<Project[]> {
  const projectIds = Object.keys((await getUser(userId)).projectRoles);
  const projects: Project[] = [];
  for (const projectId of projectIds) {
    try {
      await getProject(projectId).then(
        (project) => project.isActive && projects.push(project)
      );
    } catch (err) {
      /** If there was an error, the project probably was manually deleted
       from the database or is ill-formatted. */
      console.error(err);
    }
  }
  return projects;
}

export async function getProject(projectId?: string): Promise<Project> {
  projectId = projectId ? projectId : LocalStorage.getProjectId();
  return (await projectApi.getProject({ projectId }, defaultOptions())).data;
}

export async function getProjectName(projectId?: string): Promise<string> {
  return (await getProject(projectId)).name;
}

/** Updates project and returns id of updated project. */
export async function updateProject(project: Project): Promise<string> {
  const params = { projectId: project.id, project };
  return (await projectApi.updateProject(params, defaultOptions())).data;
}

/** Archives specified project and returns id. */
export async function archiveProject(projectId: string): Promise<string> {
  const project = await getProject(projectId);
  project.isActive = false;
  return await updateProject(project);
}

/** Restores specified archived project and returns id. */
export async function restoreProject(projectId: string): Promise<string> {
  const project = await getProject(projectId);
  project.isActive = true;
  return await updateProject(project);
}

/** Returns a boolean indicating whether the specified project name is already taken. */
export async function projectDuplicateCheck(
  projectName: string
): Promise<boolean> {
  return (
    await projectApi.projectDuplicateCheck({ projectName }, defaultOptions())
  ).data;
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
  const resp = await userApi.createUser({ user }, defaultOptions());
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
    defaultOptions()
  );
  const user = resp.data;
  LocalStorage.setCurrentUser(user);
  if (user.hasAvatar) {
    LocalStorage.setAvatar(await avatarSrc(user.id));
  }
  return user;
}

export async function getAllUsers(): Promise<User[]> {
  return (await userApi.getAllUsers(defaultOptions())).data;
}

export async function getUser(userId: string): Promise<User> {
  return (await userApi.getUser({ userId }, defaultOptions())).data;
}

export async function getUserByEmail(email: string): Promise<User> {
  return (await userApi.getUserByEmail({ email }, defaultOptions())).data;
}

export async function updateUser(user: User): Promise<User> {
  const resp = await userApi.updateUser(
    { userId: user.id, user },
    defaultOptions()
  );
  const updatedUser = { ...user, id: resp.data };
  if (updatedUser.id === LocalStorage.getUserId()) {
    LocalStorage.setCurrentUser(updatedUser);
  }
  return updatedUser;
}

export async function deleteUser(userId: string): Promise<string> {
  return (await userApi.deleteUser({ userId }, defaultOptions())).data;
}

/* UserEditController.cs */

/** Returns index of added goal, or of updated goal
 * if goal with same guid already exists in the UserEdit */
export async function addGoalToUserEdit(
  userEditId: string,
  goal: Goal
): Promise<number> {
  const edit = convertGoalToEdit(goal);
  const resp = await userEditApi.updateUserEditGoal(
    { projectId: LocalStorage.getProjectId(), userEditId, edit },
    defaultOptions()
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
    defaultOptions()
  );
  return resp.data;
}

/** Returns User with updated .workedProjects */
export async function createUserEdit(): Promise<User> {
  const resp = await userEditApi.createUserEdit(
    { projectId: LocalStorage.getProjectId() },
    defaultOptions()
  );
  const user = resp.data;
  LocalStorage.setCurrentUser(user);
  return user;
}

export async function getUserEditById(
  projectId: string,
  userEditId: string
): Promise<UserEdit> {
  return (
    await userEditApi.getUserEdit({ projectId, userEditId }, defaultOptions())
  ).data;
}

/** Returns array with every UserEdit for the current project. */
export async function getAllUserEdits(): Promise<UserEdit[]> {
  const params = { projectId: LocalStorage.getProjectId() };
  return (await userEditApi.getProjectUserEdits(params, defaultOptions())).data;
}

/* UserRoleController.cs */

export async function getUserRoles(): Promise<UserRole[]> {
  const params = { projectId: LocalStorage.getProjectId() };
  return (await userRoleApi.getProjectUserRoles(params, defaultOptions())).data;
}

export async function getUserRole(userRoleId: string): Promise<UserRole> {
  const params = { projectId: LocalStorage.getProjectId(), userRoleId };
  return (await userRoleApi.getUserRole(params, defaultOptions())).data;
}

export async function addOrUpdateUserRole(
  permission: Permission[],
  userId: string
): Promise<string> {
  const params = { projectId: LocalStorage.getProjectId(), userId, permission };
  return (await userRoleApi.updateUserRolePermissions(params, defaultOptions()))
    .data;
}

export async function removeUserRole(
  permission: Permission[],
  userId: string
): Promise<void> {
  const params = {
    projectId: LocalStorage.getProjectId(),
    userId,
    permission,
  };
  await userRoleApi.deleteUserRole(params, defaultOptions());
}

/* WordController.cs */

export async function createWord(word: Word): Promise<Word> {
  const projectId = LocalStorage.getProjectId();
  const resp = await wordApi.createWord({ projectId, word }, defaultOptions());
  return { ...word, id: resp.data };
}

export async function deleteFrontierWord(wordId: string): Promise<string> {
  const params = { projectId: LocalStorage.getProjectId(), wordId };
  return (await wordApi.deleteFrontierWord(params, defaultOptions())).data;
}

export async function getWord(wordId: string): Promise<Word> {
  const params = { projectId: LocalStorage.getProjectId(), wordId };
  return (await wordApi.getWord(params, defaultOptions())).data;
}

export async function getAllWords(): Promise<Word[]> {
  const projectId = LocalStorage.getProjectId();
  return (await wordApi.getProjectWords({ projectId }, defaultOptions())).data;
}

export async function isFrontierNonempty(projectId?: string): Promise<boolean> {
  const params = { projectId: projectId ?? LocalStorage.getProjectId() };
  return (await wordApi.isFrontierNonempty(params, defaultOptions())).data;
}

export async function getFrontierWords(): Promise<Word[]> {
  const params = { projectId: LocalStorage.getProjectId() };
  return (await wordApi.getProjectFrontierWords(params, defaultOptions())).data;
}

export async function updateWord(word: Word): Promise<Word> {
  const resp = await wordApi.updateWord(
    { projectId: LocalStorage.getProjectId(), wordId: word.id, word },
    defaultOptions()
  );
  return { ...word, id: resp.data };
}
