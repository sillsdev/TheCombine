import PronunciationsComponent from "../PronunciationsComponent";
import { uuid } from "../../../utilities";

const wordMock = () => ({
  id: uuid(),
  vernacular: "",
  senses: [],
  audio: [""],
  created: "",
  modified: "",
  history: [""],
  partOfSpeech: "",
  editedBy: [""],
  otherField: "",
  plural: "",
});
