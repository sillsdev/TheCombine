import { FiberManualRecord } from "@mui/icons-material";
import { IconButton, Theme, Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import {
  recording,
  reset,
} from "components/Pronunciations/Redux/PronunciationsActions";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { themeColors } from "types/theme";

export const recordButtonId = "recordingButton";
export const recordIconId = "recordingIcon";

interface RecorderIconProps {
  wordId: string;
  startRecording: () => void;
  stopRecording: () => void;
}

export default function RecorderIcon(props: RecorderIconProps): ReactElement {
  const pronunciationsState = useAppSelector(
    (state: StoreState) => state.pronunciationsState
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const useStyles = makeStyles((theme: Theme) => ({
    button: { marginRight: theme.spacing(1) },
    iconPress: { color: themeColors.recordActive },
    iconRelease: { color: themeColors.recordIdle },
  }));

  const classes = useStyles();

  function toggleIsRecordingToTrue(): void {
    //console.info("onMouseDown");
    dispatch(recording(props.wordId));
    props.startRecording();
  }
  function toggleIsRecordingToFalse(): void {
    //console.info("onMouseUp");
    props.stopRecording();
    dispatch(reset());
  }

  function handleTouchStart(): void {
    console.info("onTouchStart");
    // Temporarily disable context menu since some browsers
    // interpret a long-press touch as a right-click.
    document.addEventListener("contextmenu", disableContextMenu, false);
    //toggleIsRecordingToTrue();
  }
  function handleTouchEnd(): void {
    console.info("onTouchEnd");
    enableContextMenu();
    //toggleIsRecordingToFalse();
  }

  function disableContextMenu(event: any): void {
    event.preventDefault();
    enableContextMenu();
  }
  function enableContextMenu(): void {
    document.removeEventListener("contextmenu", disableContextMenu, false);
  }

  return (
    <Tooltip title={t("pronunciations.recordTooltip")} placement="top">
      <IconButton
        tabIndex={-1}
        //onMouseDown={toggleIsRecordingToTrue}
        onMouseDown={() => console.info("onMouseDown")}
        onTouchStart={handleTouchStart}
        //onMouseUp={toggleIsRecordingToFalse}
        onMouseUp={() => console.info("onMouseUp")}
        onTouchEnd={handleTouchEnd}
        onAuxClick={() => console.info("onAuxClick")}
        onAuxClickCapture={() => console.info("onAuxClickCapture")}
        onClick={() => console.info("onClick")}
        onClickCapture={() => console.info("onClickCapture")}
        onDoubleClick={() => console.info("onDoubleClick")}
        onDoubleClickCapture={() => console.info("onDoubleClickCapture")}
        onMouseDownCapture={() => console.info("onMouseDownCapture")}
        onMouseUpCapture={() => console.info("onMouseUpCapture")}
        onPointerDown={toggleIsRecordingToTrue} //() => console.info("onPointerDown")}
        onPointerDownCapture={() => console.info("onPointerDownCapture")}
        onPointerUp={toggleIsRecordingToFalse} //() => console.info("onPointerUp")}
        onPointerUpCapture={() => console.info("onPointerUpCapture")}
        onSelect={() => console.info("onSelect")}
        onSelectCapture={() => console.info("onSelectCapture")}
        onTouchCancel={() => console.info("onTouchCancel")}
        onTouchCancelCapture={() => console.info("onTouchCancelCapture")}
        onTouchEndCapture={() => console.info("onTouchEndCapture")}
        onTouchStartCapture={() => console.info("onTouchStartCapture")}
        className={classes.button}
        aria-label="record"
        id={recordButtonId}
        size="large"
      >
        <FiberManualRecord
          className={
            pronunciationsState.type === PronunciationsStatus.Recording &&
            pronunciationsState.payload === props.wordId
              ? classes.iconPress
              : classes.iconRelease
          }
          id={recordIconId}
        />
      </IconButton>
    </Tooltip>
  );
}
