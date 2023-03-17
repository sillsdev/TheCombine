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
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import ButtonConfirmation from "components/Buttons/ButtonConfirmation";
import {
  playing,
  reset,
} from "components/Pronunciations/Redux/PronunciationsActions";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { themeColors } from "types/theme";

interface PlayerProps {
  pronunciationUrl: string;
  wordId: string;
  fileName: string;
  deleteAudio?: (wordId: string, fileName: string) => void;
  isPlaying?: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      marginRight: theme.spacing(1),
    },
    icon: {
      color: themeColors.success,
    },
  })
);

export default function AudioPlayer(props: PlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const pronunciationsState = useAppSelector(
    (state: StoreState) => state.pronunciationsState
  );
  const dispatch = useAppDispatch();
  const [audio] = useState<HTMLAudioElement>(new Audio(props.pronunciationUrl));
  const [anchor, setAnchor] = useState<HTMLElement | undefined>();
  const [deleteConf, setDeleteConf] = useState<boolean>(false);
  const classes = useStyles();
  const { t } = useTranslation();

  useEffect(() => {
    if (
      pronunciationsState.type !== PronunciationsStatus.Playing ||
      pronunciationsState.payload !== props.fileName
    ) {
      if (isPlaying) {
        stop();
      }
    } else {
      play();
    }
    // We want pronunciationsState alone on the dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronunciationsState]);

  const dispatchReset = () => dispatch(reset());

  function deleteAudio() {
    if (props.deleteAudio) {
      props.deleteAudio(props.wordId, props.fileName);
    }
  }

  function stop() {
    setIsPlaying(false);
    audio.pause();
    audio.currentTime = 0;
  }

  function play() {
    audio.addEventListener("ended", dispatchReset);
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(dispatchReset);
  }

  function togglePlay() {
    if (!isPlaying) {
      dispatch(playing(props.fileName));
    } else {
      dispatchReset();
    }
  }

  function deleteOrTogglePlay(event?: any) {
    if (event?.shiftKey) {
      setDeleteConf(true);
    } else {
      togglePlay();
    }
  }

  function handleClose() {
    setAnchor(undefined);
    enableContextMenu();
  }

  function disableContextMenu(event: any) {
    event.preventDefault();
    enableContextMenu();
  }
  function enableContextMenu() {
    document.removeEventListener("contextmenu", disableContextMenu, false);
  }

  function handleTouch(event: any) {
    // Temporarily disable context menu since some browsers
    // interpret a long-press touch as a right-click.
    document.addEventListener("contextmenu", disableContextMenu, false);
    setAnchor(event.currentTarget);
  }

  return (
    <React.Fragment>
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
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
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
        onConfirm={deleteAudio}
        buttonIdClose="audio-delete-cancel"
        buttonIdConfirm="audio-delete-confirm"
      />
    </React.Fragment>
  );
}
