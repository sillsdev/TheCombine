import { enqueueSnackbar } from "notistack";
import { createContext } from "react";
import { getI18n } from "react-i18next";

import Recorder from "components/Pronunciations/Recorder";

const RecorderContext = createContext(
  new Recorder((textId: string) =>
    enqueueSnackbar(getI18n()?.t(textId) ?? textId)
  )
);

export default RecorderContext;
