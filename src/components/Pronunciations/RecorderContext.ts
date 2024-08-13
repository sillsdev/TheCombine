import { enqueueSnackbar } from "notistack";
import { createContext } from "react";

import Recorder from "components/Pronunciations/Recorder";
import i18n from "i18n";

const RecorderContext = createContext(
  new Recorder((textId: string) => enqueueSnackbar(i18n.t(textId)))
);

export default RecorderContext;
