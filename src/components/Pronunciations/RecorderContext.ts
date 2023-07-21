import { enqueueSnackbar } from "notistack";
import { createContext } from "react";

import Recorder from "components/Pronunciations/Recorder";

const RecorderContext = createContext(new Recorder(enqueueSnackbar));

export default RecorderContext;
