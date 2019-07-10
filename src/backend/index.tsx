import axios from "axios";
import { Word, MergeWord } from "../types/word";
import { User } from "../types/user";
import { Project } from "../types/project";
import { authHeader } from "../components/Login/AuthHeaders";
import { Goal, GoalType } from "../types/goals";
import { UserEdit } from "../types/userEdit";

const backendServer = axios.create({ baseURL: "https://localhost:5001/v1" });

let projectId: string = "";

export function setProjectID(id: string) {
  projectId = id;
}

export function getProjectId(): string {
  return projectId;
}

export async function createWord(word: Word): Promise<Word> {
  return await backendServer
    .post(`projects/${projectId}/words`, word)
    .then(resp => {
      return { ...word, id: resp.data };
    });
}

export async function getWord(id: string): Promise<Word> {
  return await backendServer
    .get(`projects/${projectId}/words/${id}`)
    .then(resp => resp.data);
}

export async function getAllWords(): Promise<Word[]> {
  return await backendServer
    .get(`projects/${projectId}/words`)
    .then(resp => resp.data);
}

export async function mergeWords(
  parent: Word,
  children: MergeWord[]
): Promise<string> {
  parent.id = "";
  let childrenWords = children.map(child => {
    return { SrcWordID: child.wordID, SenseStates: child.senses };
  });
  let merge = {
    Parent: parent,
    ChildrenWords: childrenWords,
    Time: Date.now().toString()
  };
  return await backendServer
    .put(`projects/${projectId}/words`, merge)
    .then(resp => resp.data);
}

export async function updateWord(word: Word): Promise<Word> {
  return await backendServer
    .put(`projects/${projectId}/words/${word.id}`, word)
    .then(resp => {
      return { ...word, id: resp.data };
    });
}

export async function deleteWord(word: Word): Promise<Word> {
  return await backendServer
    .delete(`projects/${projectId}/words/${word.id}`)
    .then(resp => {
      return { ...word, id: resp.data };
    });
}

export async function getFrontierWords(): Promise<Word[]> {
  return await backendServer
    .get(`projects/${projectId}/words/frontier`)
    .then(resp => resp.data);
}

export async function addUser(user: User): Promise<User> {
  return await backendServer
    .post(`users`, user, { headers: authHeader() })
    .then(resp => {
      return { ...user, id: resp.data };
    });
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<string> {
  return await backendServer
    .post(
      `users/authenticate`,
      { Username: username, Password: password },
      { headers: authHeader() }
    )
    .then(resp => JSON.stringify(resp.data));
}

export async function getAllUsers(): Promise<User[]> {
  return await backendServer.get(`users`).then(resp => resp.data);
}

export async function getUser(id: string): Promise<User> {
  return await backendServer.get(`users/${id}`).then(resp => resp.data);
}

export async function updateUser(user: User): Promise<User> {
  return await backendServer.put(`users/${user.id}`, user).then(resp => {
    return { ...user, id: resp.data };
  });
}

export async function createProject(project: Project): Promise<Project> {
  return await backendServer
    .post(`projects/`, project, { headers: authHeader() })
    .then(resp => {
      return { ...project, id: resp.data };
    });
}

export async function getAllProjects(): Promise<Project[]> {
  return await backendServer.get(`projects`).then(resp => resp.data);
}

export async function getProject(id: string): Promise<Project> {
  return await backendServer.get(`projects/${id}`).then(resp => resp.data);
}

export async function updateProject(project: Project) {
  await backendServer.put(`projects/${project.id}`, project);
}

export async function uploadLift(project: Project, lift: File) {
  let data = new FormData();
  data.append("file", lift);
  await backendServer.post(`projects/${projectId}/words/upload`, data, {
    headers: { ...authHeader(), "Content-Type": "multipart/form-data" }
  });
}

export async function uploadMp3(project: Project, mp3: File) {
  let data = new FormData();
  data.append("file", mp3);
  await backendServer.post(`projects/${projectId}/words/upload/audio`, data, {
    headers: { ...authHeader(), "content-type": "application/json" }
  });
}

export async function addGoalToUserEdit(
  userEditId: string,
  goal: Goal
): Promise<Goal> {
  let goalType: string = goalNameToGoalTypeId(goal.name);
  let stepData: string = goal.steps.toString();
  let userEditTuple = { goalType: goalType, stepData: [stepData] };
  return await backendServer
    .post(`projects/${projectId}/useredits/${userEditId}`, userEditTuple, {
      headers: { ...authHeader() }
    })
    .then(resp => {
      return resp.data;
    });
}

function goalNameToGoalTypeId(goalName: string): string {
  let goalType: number;
  switch (goalName) {
    case "charInventory":
      goalType = GoalType.CreateCharInv;
      break;
    case "validateChars":
      goalType = GoalType.ValidateChars;
      break;
    case "createStrWordInv":
      goalType = GoalType.CreateStrWordInv;
      break;
    case "validateStrWords":
      goalType = GoalType.ValidateStrWords;
      break;
    case "mergeDups":
      goalType = GoalType.MergeDups;
      break;
    case "spellCheckGloss":
      goalType = GoalType.SpellcheckGloss;
      break;
    case "viewFinal":
      goalType = GoalType.ViewFind;
      break;
    case "handleFlags":
      goalType = GoalType.HandleFlags;
      break;
    default:
      goalType = 8;
      break;
  }

  return goalType.toString();
}

export async function createUserEdit(): Promise<string> {
  return await backendServer
    .post(`projects/${projectId}/useredits`)
    .then(resp => {
      console.log(resp.data);
      return resp.data;
    });
}

export async function getUserEditById(index: string): Promise<UserEdit> {
  return await backendServer
    .get(`projects/${projectId}/useredits/${index}`)
    .then(resp => {
      return resp.data;
    });
}

export async function getAllUserEdits(): Promise<Goal[]> {
  return await backendServer
    .get(`projects/${projectId}/useredits`)
    .then(resp => {
      return resp.data;
    });
}
