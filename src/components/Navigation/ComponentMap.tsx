import React from "react";
import { GoalTimeline } from "../GoalTimeline/GoalTimelineComponent";
import { MergeDups } from "../../goals/MergeDupGoal/MergeDups";
import MergeDupStep from "../../goals/MergeDupGoal/MergeDupStep";
import MergeDupComponent from "../../goals/MergeDupGoal/component";
import SpellCheckGlossComponent from "../../goals/SpellCheckGloss/component";
import HandleFlagsComponent from "../../goals/HandleFlags/component";
import { SpellCheckGloss } from "../../goals/SpellCheckGloss/SpellCheckGloss";
import { HandleFlags } from "../../goals/HandleFlags/HandleFlags";
import CreateStrWordInvComponent from "../../goals/CreateStrWordInv/component";
import CreateCharInvComponent from "../../goals/CreateCharInv/component";
import ValidateCharsComponent from "../../goals/ValidateChars/component";
import ValidateStrWordsComponent from "../../goals/ValidateStrWords/component";
import ViewFinalComponent from "../../goals/ViewFinal/component";
import { CreateStrWordInv } from "../../goals/CreateStrWordInv/CreateStrWordInv";
import { CreateCharInv } from "../../goals/CreateCharInv/CreateCharInv";
import { ValidateChars } from "../../goals/ValidateChars/ValidateChars";
import { ValidateStrWords } from "../../goals/ValidateStrWords/ValidateStrWords";
import { ViewFinal } from "../../goals/ViewFinal/ViewFinal";

export const ComponentMap: Map<number, JSX.Element> = new Map();

ComponentMap.set(0, <GoalTimeline />);
ComponentMap.set(1, <CreateCharInvComponent goal={new CreateCharInv([])} />);
ComponentMap.set(
  2,
  <CreateStrWordInvComponent goal={new CreateStrWordInv([])} />
);
ComponentMap.set(3, <HandleFlagsComponent goal={new HandleFlags([])} />);
ComponentMap.set(
  4,
  <MergeDupComponent goal={new MergeDups([<MergeDupStep />])} />
);
ComponentMap.set(
  5,
  <SpellCheckGlossComponent goal={new SpellCheckGloss([])} />
);
ComponentMap.set(6, <ValidateCharsComponent goal={new ValidateChars([])} />);
ComponentMap.set(
  7,
  <ValidateStrWordsComponent goal={new ValidateStrWords([])} />
);
ComponentMap.set(8, <ViewFinalComponent goal={new ViewFinal([])} />);
