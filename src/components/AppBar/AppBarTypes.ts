import { Path } from "types/path";
import { themeColors } from "types/theme";

export const buttonMinHeight = 40;
export const appBarHeight = 64;

export interface TabProps {
  currentTab: Path;
}

export function tabColor(currentTab: Path, tabName: Path): string {
  return currentTab.indexOf(tabName) !== -1
    ? themeColors.darkShade
    : themeColors.lightShade;
}

export function shortenName(name: string, maxLength: number): string {
  if (maxLength < 7) {
    maxLength = 7;
    console.warn("shortenName() cannot be used with maxLength < 7.");
  }
  if (name.length <= maxLength) {
    return name;
  }
  const halfLength = (maxLength - 3) / 2;
  const front = name.substring(0, halfLength);
  const back = name.substring(name.length - halfLength);
  return `${front}...${back}`;
}
