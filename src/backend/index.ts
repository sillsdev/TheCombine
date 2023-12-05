import axios, { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";
import { Base64 } from "js-base64";
import { enqueueSnackbar } from "notistack";

import * as Api from "api";
import { BASE_PATH } from "api/base";
import {
  BannerType,
  ChartRootData,
  EmailInviteStatus,
  MergeUndoIds,
  MergeWords,
  Permission,
  Project,
  Role,
  SemanticDomainCount,
  SemanticDomainFull,
  SemanticDomainTreeNode,
  SemanticDomainUserCount,
  SiteBanner,
  User,
  UserEdit,
  UserRole,
  Word,
} from "api/models";
import * as LocalStorage from "backend/localStorage";
import router from "browserRouter";
import authHeader from "components/Login/AuthHeaders";
import { Goal, GoalStep } from "types/goals";
import { Path } from "types/path";
import { RuntimeConfig } from "types/runtimeConfig";
import { Bcp47Code } from "types/writingSystem";
import { convertGoalToEdit } from "utilities/goalUtilities";

export const baseURL = `${RuntimeConfig.getInstance().baseUrl()}`;
const apiBaseURL = `${baseURL}/v1`;
const config_parameters: Api.ConfigurationParameters = { basePath: baseURL };
const config = new Api.Configuration(config_parameters);

/** A list of URL suffixes for which the frontend explicitly handles errors
 * and the blanket error pop ups should be suppressed.*/
const whiteListedErrorUrls = ["users/authenticate"];

// Create an axios instance to allow for attaching interceptors to it.
const axiosInstance = axios.create({ baseURL: apiBaseURL });
axiosInstance.interceptors.response.use(undefined, (err: AxiosError) => {
  // Any status codes that falls outside the range of 2xx cause this function to
  // trigger.
  if (err.config === undefined) {
    return Promise.reject(err);
  }
  const url = err.config.url;
  const response = err.response;
  if (response) {
    const status = response.status;
    if (status === StatusCodes.UNAUTHORIZED) {
      router.navigate(Path.Login);
    }

    // Check for fatal errors (4xx-5xx).
    if (
      status >= StatusCodes.BAD_REQUEST &&
      status <= StatusCodes.NETWORK_AUTHENTICATION_REQUIRED
    ) {
      // Suppress error pop-ups for URLs the frontend already explicitly
      // handles.
      if (
        url !== undefined &&
        whiteListedErrorUrls.some((whiteListedUrl) =>
          url.endsWith(whiteListedUrl)
        )
      ) {
        return Promise.reject(err);
      }

      console.error(err);
      enqueueSnackbar(`${status} ${response.statusText}\n${err.config.url}`);
    }
  } else {
    // Handle if backend is not reachable.
    console.error(err);
    enqueueSnackbar(
      `Unable to connect to server. Check your network settings.\n${url}`
    );
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
const semanticDomainApi = new Api.SemanticDomainApi(
  config,
  BASE_PATH,
  axiosInstance
);
const statisticsApi = new Api.StatisticsApi(config, BASE_PATH, axiosInstance);
const userApi = new Api.UserApi(config, BASE_PATH, axiosInstance);
const userEditApi = new Api.UserEditApi(config, BASE_PATH, axiosInstance);
const userRoleApi = new Api.UserRoleApi(config, BASE_PATH, axiosInstance);
const wordApi = new Api.WordApi(config, BASE_PATH, axiosInstance);

// Backend controllers receiving a file via a "[FromForm] FileUpload fileUpload" param
// have the internal fields expanded by openapi-generator as params in our Api.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function fileUpload(file: File) {
  return { file, filePath: "", name: "" };
}

function defaultOptions(): object {
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

export async function uploadAvatar(
  userId: string,
  imgFile: File
): Promise<void> {
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
    const image = Base64.btoa(
      new Uint8Array(resp.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    return `data:${resp.headers["content-type"].toLowerCase()};base64,${image}`;
  } catch (err) {
    // Avatar fetching can fail if hasAvatar=True but the avatar path is broken.
    // Avoid opening a toast because a different user's avatar could cause this
    // issue, which is not actionable by the current user. The toast could
    // block further UI actions.
    console.error(err);
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
  role: Role,
  emailAddress: string,
  message: string
): Promise<string> {
  const domain = window.location.origin;
  const resp = await inviteApi.emailInviteToProject(
    { emailInviteData: { emailAddress, message, projectId, role, domain } },
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

/** Upload a LIFT file during project creation to get vernacular ws options. */
export async function uploadLiftAndGetWritingSystems(
  liftFile: File
): Promise<Api.WritingSystem[]> {
  const resp = await liftApi.uploadLiftFileAndGetWritingSystems(
    { projectId: "nonempty", ...fileUpload(liftFile) },
    { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } }
  );
  return resp.data;
}

/** Add data from a LIFT file that was uploaded earlier in the project's creation. */
export async function finishUploadLift(projectId: string): Promise<number> {
  const options = { headers: authHeader() };
  return (await liftApi.finishUploadLiftFile({ projectId }, options)).data;
}

/** Upload a LIFT file and add its data to the specified project. */
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
export async function exportLift(projectId: string): Promise<string> {
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

/** After downloading a LIFT file, clear it from the backend.
 * The backend deletes by user, not by project,
 * but a nonempty projectId in the url is still required.
 */
export async function deleteLift(): Promise<void> {
  await liftApi.deleteLiftFile({ projectId: "nonempty" }, defaultOptions());
}

/** Check if the current project doesn't already have uploaded data. */
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

/** Restores words that were previously merged and deletes the merge result. */
export async function undoMerge(wordIds: MergeUndoIds): Promise<boolean> {
  const params = {
    projectId: LocalStorage.getProjectId(),
    mergeUndoIds: wordIds,
  };
  return (await mergeApi.undoMerge(params, defaultOptions())).data;
}

/** Adds a list of wordIds to current project's merge blacklist. */
export async function blacklistAdd(wordIds: string[]): Promise<void> {
  await mergeApi.blacklistAdd(
    { projectId: LocalStorage.getProjectId(), requestBody: wordIds },
    defaultOptions()
  );
}

/** Adds a list of wordIds to current project's merge graylist */
export async function graylistAdd(wordIds: string[]): Promise<void> {
  await mergeApi.graylistAdd(
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

/** Get list of deferred potential duplicates from graylist for merging. */
export async function getGraylistEntries(maxLists: number): Promise<Word[][]> {
  const projectId = LocalStorage.getProjectId();
  const userId = LocalStorage.getUserId();
  const resp = await mergeApi.getGraylistEntries(
    { projectId, maxLists, userId },
    defaultOptions()
  );
  return resp.data;
}

/* ProjectController.cs */

export async function getAllProjects(): Promise<Project[]> {
  return (await projectApi.getAllProjects(defaultOptions())).data;
}

export async function getAllProjectUsers(projectId?: string): Promise<User[]> {
  const params = { projectId: projectId ?? LocalStorage.getProjectId() };
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
      enqueueSnackbar(`Unable to fetch Project: ${projectId}`);
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

/* SemanticDomainController.cs */

export async function getSemanticDomainFull(
  id: string,
  lang?: string
): Promise<SemanticDomainFull | undefined> {
  const response = await semanticDomainApi.getSemanticDomainFull(
    { id, lang: lang ? lang : Bcp47Code.Default },
    defaultOptions()
  );
  // The backend response for this methods returns null rather than undefined.
  return response.data ?? undefined;
}

export async function getSemanticDomainTreeNode(
  id: string,
  lang?: string
): Promise<SemanticDomainTreeNode | undefined> {
  const response = await semanticDomainApi.getSemanticDomainTreeNode(
    { id, lang: lang ? lang : Bcp47Code.Default },
    defaultOptions()
  );
  // The backend response for this methods returns null rather than undefined.
  return response.data ?? undefined;
}

export async function getSemanticDomainTreeNodeByName(
  name: string,
  lang?: string
): Promise<SemanticDomainTreeNode | undefined> {
  const response = await semanticDomainApi.getSemanticDomainTreeNodeByName(
    { name, lang: lang ? lang : Bcp47Code.Default },
    defaultOptions()
  );
  // The backend response for this methods returns null rather than undefined.
  return response.data ?? undefined;
}

/* StatisticsController.cs */

export async function getSemanticDomainCounts(
  projectId: string,
  lang?: string
): Promise<Array<SemanticDomainCount> | undefined> {
  const response = await statisticsApi.getSemanticDomainCounts(
    { projectId: projectId, lang: lang ? lang : Bcp47Code.Default },
    defaultOptions()
  );
  // The backend response for this methods returns null rather than undefined.
  return response.data ?? undefined;
}

export async function getSemanticDomainUserCount(
  projectId: string,
  lang?: string
): Promise<Array<SemanticDomainUserCount> | undefined> {
  const response = await statisticsApi.getSemanticDomainUserCounts(
    { projectId: projectId, lang: lang ? lang : Bcp47Code.Default },
    defaultOptions()
  );
  // The backend response for this methods returns null rather than undefined.
  return response.data ?? undefined;
}

export async function getLineChartRootData(
  projectId: string
): Promise<ChartRootData | undefined> {
  const response = await statisticsApi.getLineChartRootData(
    { projectId: projectId },
    defaultOptions()
  );
  // The backend response for this methods returns null rather than undefined.
  return response.data ?? undefined;
}

export async function getProgressEstimationLineChartRoot(
  projectId: string
): Promise<ChartRootData | undefined> {
  const response = await statisticsApi.getProgressEstimationLineChartRoot(
    { projectId: projectId },
    defaultOptions()
  );
  // The backend response for this methods returns null rather than undefined.
  return response.data ?? undefined;
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

export async function validateResetToken(token: string): Promise<boolean> {
  return (await userApi.validateResetToken({ token })).data;
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

/** Returns true if the email address is in use already. */
export async function isEmailTaken(email: string): Promise<boolean> {
  return (await userApi.isEmailUnavailable({ email })).data;
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

export async function isSiteAdmin(): Promise<boolean> {
  return (await userApi.isUserSiteAdmin(defaultOptions())).data;
}

/* UserEditController.cs */

/** Returns guid of added goal, or of updated goal
 * if goal with same guid already exists in the UserEdit */
export async function addGoalToUserEdit(
  userEditId: string,
  goal: Goal
): Promise<string> {
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
  editGuid: string,
  step: GoalStep,
  stepIndex?: number // If undefined, step will be added to end.
): Promise<number> {
  const projectId = LocalStorage.getProjectId();
  const stepString = JSON.stringify(step);
  const userEditStepWrapper = { editGuid, stepString, stepIndex };
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

/* UserRoleController.cs */

export async function getUserRoles(projectId?: string): Promise<UserRole[]> {
  const params = { projectId: projectId ?? LocalStorage.getProjectId() };
  return (await userRoleApi.getProjectUserRoles(params, defaultOptions())).data;
}

export async function getCurrentPermissions(): Promise<Permission[]> {
  const params = { projectId: LocalStorage.getProjectId() };
  return (await userRoleApi.getCurrentPermissions(params, defaultOptions()))
    .data;
}

export async function hasPermission(perm: Permission): Promise<boolean> {
  const params = { body: perm, projectId: LocalStorage.getProjectId() };
  return (await userRoleApi.hasPermission(params, defaultOptions())).data;
}

export async function addOrUpdateUserRole(
  projectId: string,
  role: Role,
  userId: string
): Promise<string> {
  const projectRole = { projectId, role };
  const params = { projectId, projectRole, userId };
  return (await userRoleApi.updateUserRole(params, defaultOptions())).data;
}

export async function removeUserRole(
  projectId: string,
  userId: string
): Promise<void> {
  const params = { projectId, userId };
  await userRoleApi.deleteUserRole(params, defaultOptions());
}

/* WordController.cs */

export async function createWord(word: Word): Promise<Word> {
  const params = { projectId: LocalStorage.getProjectId(), word };
  word.id = (await wordApi.createWord(params, defaultOptions())).data;
  return word;
}

export async function deleteFrontierWord(wordId: string): Promise<string> {
  const params = { projectId: LocalStorage.getProjectId(), wordId };
  return (await wordApi.deleteFrontierWord(params, defaultOptions())).data;
}

export async function getDuplicateId(word: Word): Promise<string> {
  const params = { projectId: LocalStorage.getProjectId(), word };
  return (await wordApi.getDuplicateId(params, defaultOptions())).data;
}

export async function getFrontierWords(): Promise<Word[]> {
  const params = { projectId: LocalStorage.getProjectId() };
  return (await wordApi.getProjectFrontierWords(params, defaultOptions())).data;
}

export async function getWord(wordId: string): Promise<Word> {
  const params = { projectId: LocalStorage.getProjectId(), wordId };
  return (await wordApi.getWord(params, defaultOptions())).data;
}

export async function isFrontierNonempty(projectId?: string): Promise<boolean> {
  const params = { projectId: projectId ?? LocalStorage.getProjectId() };
  return (await wordApi.isFrontierNonempty(params, defaultOptions())).data;
}

export async function isInFrontier(
  wordId: string,
  projectId?: string
): Promise<boolean> {
  projectId = projectId || LocalStorage.getProjectId();
  const params = { projectId, wordId };
  return (await wordApi.isInFrontier(params, defaultOptions())).data;
}

export async function updateDuplicate(
  dupId: string,
  word: Word
): Promise<Word> {
  const params = { projectId: LocalStorage.getProjectId(), dupId, word };
  const resp = await wordApi.updateDuplicate(params, defaultOptions());
  return await getWord(resp.data);
}

export async function updateWord(word: Word): Promise<Word> {
  const resp = await wordApi.updateWord(
    { projectId: LocalStorage.getProjectId(), wordId: word.id, word },
    defaultOptions()
  );
  return { ...word, id: resp.data };
}
