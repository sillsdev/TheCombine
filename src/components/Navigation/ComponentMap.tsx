import React from "react";
import { GoalTimeline } from "../GoalTimeline/GoalTimelineComponent";
import MergeDupDisplay from "../../goals/MergeDupGoal/MergeDupDisplay";
import { MergeDups } from "../../goals/MergeDupGoal/MergeDups";
import MergeDupStep from "../../goals/MergeDupGoal/MergeDupStep";

export const ComponentMap: Map<string, JSX.Element> = new Map();

ComponentMap.set("goalTimeline", <GoalTimeline />);
ComponentMap.set(
  "mergeDups",
  <MergeDupDisplay goal={new MergeDups([<MergeDupStep />])} />
);
