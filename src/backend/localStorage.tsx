import { Hash } from "../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { User } from "../types/user";

enum localStorageKeys {
  //dataEntryTempAudio = "dataEntryTempAudio",
  user = "user",
  mergeDupsBlacklist = "mergeDupsBlacklist",
  projectId = "projectId",
}
/*
export function addAudio(audioFile: File) {
  const audioString = localStorage.getItem(localStorageKeys.dataEntryTempAudio);
  let audioFiles: File[] = audioString ? JSON.parse(audioString) : [];
  audioFiles.push(audioFile);
  const updatedAudioString = JSON.stringify(audioFiles);
  localStorage.setItem(localStorageKeys.dataEntryTempAudio, updatedAudioString);
}

export function clearAllAudio() {
  localStorage.removeItem(localStorageKeys.dataEntryTempAudio);
}

export function getAudio(): File[] {
  const audioString = localStorage.getItem(localStorageKeys.dataEntryTempAudio);
  return audioString ? JSON.parse(audioString) : [];
}
*/
export function getCurrentUser(): User | null {
  const user = localStorage.getItem(localStorageKeys.user);
  return user ? JSON.parse(user) : null;
}

export function getMergeDupsBlacklist(): Hash<boolean> {
  const blacklist = localStorage.getItem(localStorageKeys.mergeDupsBlacklist);
  return blacklist ? JSON.parse(blacklist) : {};
}

export function getProjectId(): string {
  return localStorage.getItem(localStorageKeys.projectId) || "";
}
/*
export function removeAudioByIndex(index: number) {
  const audioString = localStorage.getItem(localStorageKeys.dataEntryTempAudio);
  let audioFiles: File[] = audioString ? JSON.parse(audioString) : [];
  if (index < audioFiles.length) {
    audioFiles.splice(index, 1);
  }
  const updatedAudioString = JSON.stringify(audioFiles);
  localStorage.setItem(localStorageKeys.dataEntryTempAudio, updatedAudioString);
}

export function removeAudio(fileName: string) {
  const audioString = localStorage.getItem(localStorageKeys.dataEntryTempAudio);
  const audioFiles: File[] = audioString ? JSON.parse(audioString) : [];
  const updatedAudioFiles = audioFiles.filter((file) => file.name !== fileName);
  const updatedAudioString = JSON.stringify(updatedAudioFiles);
  localStorage.setItem(localStorageKeys.dataEntryTempAudio, updatedAudioString);
}
*/
export function removeCurrentUser() {
  localStorage.removeItem(localStorageKeys.user);
}

export function removeProjectId() {
  localStorage.removeItem(localStorageKeys.projectId);
}

export function setCurrentUser(user: User) {
  const userString = JSON.stringify(user);
  localStorage.setItem(localStorageKeys.user, userString);
}

export function setMergeDupsBlacklist(blacklist: Hash<boolean>) {
  const blacklistString = JSON.stringify(blacklist);
  localStorage.setItem(localStorageKeys.mergeDupsBlacklist, blacklistString);
}

export function setProjectId(id: string) {
  localStorage.setItem(localStorageKeys.projectId, id);
}
