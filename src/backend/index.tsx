import axios from "axios";
import { Word, State, Merge } from "../types/word";
import { User } from "../types/user";
import { Project } from "../types/project";
import { authHeader } from "../components/Login/AuthHeaders";
import { Goal } from "../types/goals";
import { UserEdit } from "../types/userEdit";

const backendServer = axios.create({ baseURL: "https://localhost:5001/v1" });

export async function createWord(word: Word): Promise<Word> {
  return await backendServer.post("projects/words", word).then(resp => {
    return { ...word, id: resp.data };
  });
}

export async function getWord(id: string): Promise<Word> {
  return await backendServer
    .get("projects/words/" + id)
    .then(resp => resp.data);
}

export async function getAllWords(): Promise<Word[]> {
  return await backendServer.get("projects/words").then(resp => resp.data);
}

export async function mergeWords(words: Word[], type: State): Promise<string> {
  let ids = words.map(word => word.id);
  let root = ids[0];
  let children = ids.filter(word => word !== root);
  let merge: Merge = {
    parent: root,
    children,
    mergeType: type,
    time: Date.now().toString()
  };
  return await backendServer
    .put("projects/words", merge)
    .then(resp => resp.data);
}

export async function updateWord(word: Word): Promise<Word> {
  return await backendServer
    .put("projects/words/" + word.id, word)
    .then(resp => {
      return { ...word, id: resp.data };
    });
}

export async function deleteWord(word: Word): Promise<Word> {
  return await backendServer.delete("projects/words/" + word.id).then(resp => {
    return { ...word, id: resp.data };
  });
}

export async function getFrontierWords(): Promise<Word[]> {
  return await backendServer
    .get("projects/words/frontier")
    .then(resp => resp.data);
}

export async function addUser(user: User): Promise<User> {
  return await backendServer
    .post("users", user, { headers: authHeader() })
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
      "users/authenticate",
      { Username: username, Password: password },
      { headers: authHeader() }
    )
    .then(resp => JSON.stringify(resp.data));
}

export async function getAllUsers(): Promise<User[]> {
  return await backendServer.get("users").then(resp => resp.data);
}

export async function getUser(id: string): Promise<User> {
  return await backendServer.get("users/" + id).then(resp => resp.data);
}

export async function updateUser(user: User): Promise<User> {
  return await backendServer.put("users/" + user.id, user).then(resp => {
    return { ...user, id: resp.data };
  });
}

export async function createProject(project: Project): Promise<Project> {
  return await backendServer
    .post("projects", project, { headers: authHeader() })
    .then(resp => {
      return { ...project, id: resp.data };
    });
}

export async function getAllProjects(): Promise<Project[]> {
  return await backendServer.get("projects").then(resp => resp.data);
}

export async function getProject(id: string): Promise<Project> {
  return await backendServer.get("projects/" + id).then(resp => resp.data);
}

export async function updateProject(project: Project) {
  await backendServer.put("projects/" + project.id, project);
}

export async function uploadLift(project: Project, lift: File) {
  let data = new FormData();
  data.append("file", lift);
  await backendServer.post("projects/words/upload", data, {
    headers: { ...authHeader(), "Content-Type": "multipart/form-data" }
  });
}

export async function uploadMp3(project: Project, mp3: File) {
  let data = new FormData();
  data.append("file", mp3);
  await backendServer.post("projects/words/upload/audio", data, {
    headers: { ...authHeader(), "content-type": "application/json" }
  });
}

export async function addGoalToUserEdit(
  userEditId: string,
  goal: Goal
): Promise<Goal> {
  let goalType: string;
  switch (goal.name) {
    case "CreateCharInv":
      goalType = "0";
      break;
    case "ValidateChars":
      goalType = "1";
      break;
    case "CreateStrWordInv":
      goalType = "2";
      break;
    case "ValidateStrWords":
      goalType = "3";
      break;
    case "MergeDups":
      goalType = "4";
      break;
    case "SpellcheckGloss":
      goalType = "5";
      break;
    case "ViewFinal":
      goalType = "6";
      break;
    case "HandleFlags":
      goalType = "7";
      break;
    default:
      goalType = "8";
      break;
  }
  let stepData: string = goal.steps.toString();
  let userEditTuple = { goalType, stepData };
  return await backendServer
    .post(`projects/useredits/${userEditId}`, userEditTuple, {
      headers: { ...authHeader() }
    })
    .then(resp => {
      console.log(resp);
      return resp.data;
    });
}

export async function getUserEditById(index: string): Promise<UserEdit> {
  return await backendServer.get(`projects/useredits/${index}`).then(resp => {
    return resp.data;
  });
}

export async function getAllUserEdits(): Promise<Goal[]> {
  return await backendServer.get("projects/useredits").then(resp => {
    console.log(resp);
    return resp.data;
  });
}
