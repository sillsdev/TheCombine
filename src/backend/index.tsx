import axios from "axios";

import * as LocalStorage from "backend/localStorage";
import history, { Path } from "browserHistory";
import authHeader from "components/Login/AuthHeaders";
import { Goal, GoalStep } from "types/goals";
import { convertGoalToEdit } from "types/goalUtilities";
import { Project } from "types/project";
import { RuntimeConfig } from "types/runtimeConfig";
import SemanticDomainWithSubdomains from "types/SemanticDomain";
import { User } from "types/user";
import { UserEdit } from "types/userEdit";
import { UserRole } from "types/userRole";
import { MergeWord, Word } from "types/word";

export const baseURL = `${RuntimeConfig.getInstance().baseUrl()}`;
const apiBaseURL = `${baseURL}/v1`;

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
    if (err.response && err.response.status === 401) {
      history.push(Path.Login);
    }
    return Promise.reject(err);
  }
);

export async function resetPasswordRequest(
  emailOrUsername: string
): Promise<boolean> {
  return await backendServer
    .post("users/forgot", {
      domain: window.location.origin,
      emailOrUsername: emailOrUsername,
    })
    .then(() => true)
    .catch(() => false);
}

export async function resetPassword(
  token: string,
  password: string
): Promise<boolean> {
  return await backendServer
    .post(`users/forgot/reset`, {
      token: token,
      newPassword: password,
    })
    .then(() => true)
    .catch(() => false);
}

export async function createWord(word: Word): Promise<Word> {
  let resp = await backendServer.post(
    `projects/${LocalStorage.getProjectId()}/words`,
    word,
    { headers: authHeader() }
  );
  return { ...word, id: resp.data };
}

export async function getWord(id: string): Promise<Word> {
  let resp = await backendServer.get(
    `projects/${LocalStorage.getProjectId()}/words/${id}`,
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getAllWords(): Promise<Word[]> {
  let resp = await backendServer.get(
    `projects/${LocalStorage.getProjectId()}/words`,
    { headers: authHeader() }
  );
  return resp.data;
}

export async function mergeWords(
  parent: Word,
  children: MergeWord[]
): Promise<string[]> {
  parent = JSON.parse(JSON.stringify(parent));
  parent.id = "";
  let childrenWords = children.map((child) => ({
    SrcWordID: child.wordID,
    SenseStates: child.senses,
  }));
  let mergeWords = {
    Parent: parent,
    ChildrenWords: childrenWords,
  };
  let resp = await backendServer.put(
    `projects/${LocalStorage.getProjectId()}/words`,
    mergeWords,
    { headers: authHeader() }
  );
  return resp.data;
}

export async function updateWord(word: Word): Promise<Word> {
  let resp = await backendServer.put(
    `projects/${LocalStorage.getProjectId()}/words/${word.id}`,
    word,
    { headers: authHeader() }
  );
  return { ...word, id: resp.data };
}

export async function deleteWord(id: string): Promise<string> {
  let resp = await backendServer.delete(
    `projects/${LocalStorage.getProjectId()}/words/${id}`,
    { headers: authHeader() }
  );
  return resp.data;
}

export async function deleteFrontierWord(id: string): Promise<string> {
  let resp = await backendServer.delete(
    `projects/${LocalStorage.getProjectId()}/words/frontier/${id}`,
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getFrontierWords(): Promise<Word[]> {
  let resp = await backendServer.get(
    `projects/${LocalStorage.getProjectId()}/words/frontier`,
    { headers: authHeader() }
  );
  return resp.data;
}

export async function addUser(user: User): Promise<User> {
  let resp = await backendServer.post(`users`, user, { headers: authHeader() });
  return { ...user, id: resp.data };
}

/** returns true if the username is in use already */
export function isUsernameTaken(username: string): Promise<boolean> {
  return backendServer
    .post(`users/checkusername/${username}`)
    .then(() => false)
    .catch((err) => err.response && err.response.status === 400);
}

/** returns true if the email address is in use already */
export function isEmailTaken(emailAddress: string): Promise<boolean> {
  return backendServer
    .post(`users/checkemail/${emailAddress}`)
    .then(() => false)
    .catch((err) => err.response && err.response.status === 400);
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<User> {
  let resp = await backendServer.post(
    `users/authenticate`,
    { Username: username, Password: password },
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getAllUsers(): Promise<User[]> {
  let projectId: string = LocalStorage.getProjectId();
  /* If an admin user tries to get the list of users,
   the current projectId may be an empty string,
   which causes a 404 error. */
  projectId = projectId ? projectId : "_";
  let resp = await backendServer.get(`users/projects/${projectId}/allusers`, {
    headers: authHeader(),
  });
  return resp.data;
}

export async function getAllUsersInCurrentProject(): Promise<User[]> {
  let resp = await backendServer.get(
    `projects/${LocalStorage.getProjectId()}/users`,
    { headers: authHeader() }
  );
  return resp.data;
}

// ToDo: Remove this function after used on live server.
export async function populateAllGuids() {
  const resp = await backendServer.get("projects/populateguids/words", {
    headers: authHeader(),
  });
  return resp.data;
}

export async function getUser(id: string): Promise<User> {
  let resp = await backendServer.get(`users/${id}`, { headers: authHeader() });
  return resp.data;
}

export async function updateUser(user: User): Promise<User> {
  let resp = await backendServer.put(`users/${user.id}`, user, {
    headers: authHeader(),
  });
  return { ...user, id: resp.data };
}

export async function deleteUser(userId: string): Promise<string> {
  let resp = await backendServer.delete(`users/${userId}`, {
    headers: authHeader(),
  });
  return resp.data;
}

export async function createProject(project: Project): Promise<Project> {
  let resp = await backendServer.post(`projects/`, project, {
    headers: authHeader(),
  });
  return { ...resp.data };
}

export async function getAllProjects(): Promise<Project[]> {
  let resp = await backendServer.get(`projects`, { headers: authHeader() });
  return resp.data;
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

export async function uploadLift(
  project: Project,
  lift: File
): Promise<number> {
  let data = new FormData();
  data.append("file", lift);
  let resp = await backendServer.post(
    `projects/${project.id}/words/upload`,
    data,
    {
      headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    }
  );
  return parseInt(resp.toString());
}

// Tell the backend to create a LIFT file for the project
export async function exportLift(projectId: string) {
  let resp = await backendServer.get(`projects/${projectId}/words/export`, {
    headers: authHeader(),
  });
  return resp.data;
}
// After the backend confirms that a LIFT file is ready, download it
export async function downloadLift(projectId: string): Promise<string> {
  // For details on how to download binary files with axios, see:
  //    https://github.com/axios/axios/issues/1392#issuecomment-447263985
  let resp = await backendServer.get(`projects/${projectId}/words/download`, {
    headers: { ...authHeader(), Accept: "application/zip" },
    responseType: "blob",
  });
  return URL.createObjectURL(
    new Blob([resp.request.response], { type: "application/zip" })
  );
}
// After downloading a LIFT file, clear it from the backend
export async function deleteLift(projectId?: string) {
  let projectIdToDelete = projectId ? projectId : LocalStorage.getProjectId();
  await backendServer.get(`projects/${projectIdToDelete}/words/deleteexport`, {
    headers: authHeader(),
  });
}

export async function uploadAudio(
  wordId: string,
  audioFile: File
): Promise<string> {
  let data = new FormData();
  data.append("file", audioFile);
  let resp = await backendServer.post(
    `projects/${LocalStorage.getProjectId()}/words/${wordId}/upload/audio`,
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
  return `${apiBaseURL}/projects/${LocalStorage.getProjectId()}/words/${wordId}/download/audio/${fileName}`;
}

export async function uploadAvatar(userId: string, img: File): Promise<string> {
  let data = new FormData();
  data.append("file", img);
  let resp = await backendServer.post(`users/${userId}/upload/avatar`, data, {
    headers: { ...authHeader(), "content-type": "application/json" },
  });
  return resp.data;
}

/** Returns the string to display the image inline in Base64 <img src= */
export async function avatarSrc(userId: string): Promise<string> {
  let resp = await backendServer.get(`users/${userId}/download/avatar`, {
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

export async function getSemanticDomains(): Promise<
  SemanticDomainWithSubdomains[]
> {
  let resp = await backendServer.get(
    `projects/${LocalStorage.getProjectId()}/semanticdomains`,
    { headers: authHeader() }
  );
  return resp.data;
}

export async function getUserRoles(): Promise<UserRole[]> {
  let resp = await backendServer.get(
    `projects/${LocalStorage.getProjectId()}/userroles`,
    { headers: authHeader() }
  );
  return resp.data;
}

export async function canUploadLift(): Promise<boolean> {
  let resp = await backendServer.get(
    `projects/${LocalStorage.getProjectId()}/liftcheck`,
    { headers: authHeader() }
  );
  return resp.data;
}

export async function addUserRole(
  permissions: number[],
  user: User
): Promise<void> {
  await backendServer.put(
    `projects/${LocalStorage.getProjectId()}/users/${user.id}`,
    permissions,
    { headers: authHeader() }
  );
}

export async function emailInviteToProject(
  projectId: string,
  emailAddress: string,
  message: string
): Promise<string> {
  let resp = await backendServer.put(
    `projects/invite`,
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
): Promise<boolean[]> {
  let resp = await backendServer.put(
    `projects/invite/${projectId}/validate/${token}`,
    "",
    { headers: authHeader() }
  );
  return resp.data;
}
