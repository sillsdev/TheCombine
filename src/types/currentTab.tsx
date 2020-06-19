import { shade } from "./theme";

export enum CurrentTab {
  DataCleanup,
  DataEntry,
  PageNotFound,
  ProjectSettings,
  ProjectScreen,
  UserSettings,
}

export function tabColor(currentTab: CurrentTab, tabName: CurrentTab) {
  const colors = ["inherit", shade];
  if (currentTab === tabName) {
    return colors[1];
  } else return colors[0];
}
