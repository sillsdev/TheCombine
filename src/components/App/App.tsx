//external modules
import React from "react";

import MergeDupStep from "../../goals/MergeDupGoal/MergeDupStep";
import { store } from "../../store";
import { backend } from "../..";
import { Word, testWordList } from "../../types/word";
import { addListWord } from "../../goals/MergeDupGoal/MergeDupStep/actions";
const App: React.FC = () => {
  // add words from database
  return <MergeDupStep />;
};

export default App;
