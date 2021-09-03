import {
  createStyles,
  Fade,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Theme,
  Tooltip,
} from "@material-ui/core";
import { Delete, PlayArrow, Stop } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { Translate } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import ButtonConfirmation from "components/Buttons/ButtonConfirmation";
import {
  playing,
  reset,
} from "components/Pronunciations/Redux/PronunciationsActions";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { StoreState } from "types";
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
  const pronunciationsState = useSelector(
    (state: StoreState) => state.pronunciationsState
  );
  const dispatch = useDispatch();
  const [audio] = useState<HTMLAudioElement>(new Audio(props.pronunciationUrl));
  const [anchor, setAnchor] = useState<HTMLElement | undefined>();
  const [deleteConf, setDeleteConf] = useState<boolean>(false);
  const classes = useStyles();

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
      <Tooltip
        title={<Translate id="pronunciations.playTooltip" />}
        placement="top"
      >
        <IconButton
          tabIndex={-1}
          onClick={deleteOrTogglePlay}
          onTouchStart={handleTouch}
          onTouchEnd={enableContextMenu}
          className={classes.button}
          aria-label="play"
          id={`audio-${props.fileName}`}
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
        getContentAnchorEl={null}
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
          id={`audio-${isPlaying ? "stop" : "play"}`}
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
