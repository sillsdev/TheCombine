//external modules
import React from "react";

import MergeDupStep from "../../goals/MergeDupGoal/MergeDupStep";
import { store } from "../../store";
import { backend } from "../..";
import { Word, testWordList } from "../../types/word";
import { addListWord } from "../../goals/MergeDupGoal/MergeDupStep/actions";
import Navigation from "../Navigation/";
const App: React.FC = () => {
  // add words from database
  return <Navigation />;
};

export default App;
