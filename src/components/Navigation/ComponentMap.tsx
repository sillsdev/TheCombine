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

export const ComponentMap: Map<string, JSX.Element> = new Map();

ComponentMap.set("goalTimeline", <GoalTimeline />);
ComponentMap.set(
  "createCharInv",
  <CreateCharInvComponent goal={new CreateCharInv([])} />
);
ComponentMap.set(
  "createStrWordInv",
  <CreateStrWordInvComponent goal={new CreateStrWordInv([])} />
);
ComponentMap.set(
  "handleFlags",
  <HandleFlagsComponent goal={new HandleFlags([])} />
);
ComponentMap.set(
  "mergeDups",
  <MergeDupComponent goal={new MergeDups([<MergeDupStep />])} />
);
ComponentMap.set(
  "spellCheckGloss",
  <SpellCheckGlossComponent goal={new SpellCheckGloss([])} />
);
ComponentMap.set(
  "validateChars",
  <ValidateCharsComponent goal={new ValidateChars([])} />
);
ComponentMap.set(
  "validateStrWords",
  <ValidateStrWordsComponent goal={new ValidateStrWords([])} />
);
ComponentMap.set("viewFinal", <ViewFinalComponent goal={new ViewFinal([])} />);
