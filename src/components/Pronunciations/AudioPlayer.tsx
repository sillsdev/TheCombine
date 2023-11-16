import { Delete, PlayArrow, Stop } from "@mui/icons-material";
import {
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Theme,
  Tooltip,
} from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ButtonConfirmation } from "components/Dialogs";
import {
  playing,
  resetPronunciations,
} from "components/Pronunciations/Redux/PronunciationsActions";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { themeColors } from "types/theme";

interface PlayerProps {
  deleteAudio: (fileName: string) => void;
  fileName: string;
  isPlaying?: boolean;
  onClick?: () => void;
  pronunciationUrl: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: { marginRight: theme.spacing(1) },
    icon: { color: themeColors.success },
  })
);

export default function AudioPlayer(props: PlayerProps): ReactElement {
  const isPlaying = useAppSelector(
    (state: StoreState) =>
      state.pronunciationsState.fileName === props.fileName &&
      state.pronunciationsState.status === PronunciationsStatus.Playing
  );

  const [audio] = useState<HTMLAudioElement>(new Audio(props.pronunciationUrl));
  const [anchor, setAnchor] = useState<HTMLElement | undefined>();
  const [deleteConf, setDeleteConf] = useState(false);

  const classes = useStyles();
  const dispatch = useAppDispatch();
  const dispatchReset = useCallback(
    () => dispatch(resetPronunciations()),
    [dispatch]
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (isPlaying) {
      audio.addEventListener("ended", dispatchReset);
      audio.play().catch(dispatchReset);
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [audio, dispatchReset, isPlaying]);

  function togglePlay(): void {
    if (!isPlaying) {
      dispatch(playing(props.fileName));
    } else {
      dispatchReset();
    }
  }

  function deleteOrTogglePlay(event?: any): void {
    if (props.onClick) {
      props.onClick();
    }
    if (event?.shiftKey) {
      setDeleteConf(true);
    } else {
      togglePlay();
    }
  }

  function handleClose(): void {
    setAnchor(undefined);
    enableContextMenu();
  }

  function disableContextMenu(event: any): void {
    event.preventDefault();
    enableContextMenu();
  }
  function enableContextMenu(): void {
    document.removeEventListener("contextmenu", disableContextMenu, false);
  }

  function handleTouch(event: any): void {
    // Temporarily disable context menu since some browsers
    // interpret a long-press touch as a right-click.
    document.addEventListener("contextmenu", disableContextMenu, false);
    setAnchor(event.currentTarget);
  }

  return (
    <>
      <Tooltip title={t("pronunciations.playTooltip")} placement="top">
        <IconButton
          tabIndex={-1}
          onClick={deleteOrTogglePlay}
          onTouchStart={handleTouch}
          onTouchEnd={enableContextMenu}
          className={classes.button}
          aria-label="play"
          id={`audio-${props.fileName}`}
          size="large"
        >
          {isPlaying ? (
            <Stop className={classes.icon} />
          ) : (
            <PlayArrow className={classes.icon} />
          )}
        </IconButton>
      </Tooltip>
      <Menu
        TransitionComponent={Fade}
        id="play-menu"
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          id={isPlaying ? "audio-stop" : "audio-play"}
          onClick={() => {
            togglePlay();
            handleClose();
          }}
        >
          {isPlaying ? (
            <Stop className={classes.icon} />
          ) : (
            <PlayArrow className={classes.icon} />
          )}
        </MenuItem>
        <MenuItem
          id="audio-delete"
          onClick={() => {
            setDeleteConf(true);
            handleClose();
          }}
        >
          <Delete />
        </MenuItem>
      </Menu>
      <ButtonConfirmation
        open={deleteConf}
        textId="buttons.deletePermanently"
        titleId="pronunciations.deleteRecording"
        onClose={() => setDeleteConf(false)}
        onConfirm={() => props.deleteAudio(props.fileName)}
        buttonIdClose="audio-delete-cancel"
        buttonIdConfirm="audio-delete-confirm"
      />
    </>
  );
}
