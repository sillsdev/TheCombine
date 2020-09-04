import {
  createStyles,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Theme,
  Tooltip,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { PlayArrow, Stop } from "@material-ui/icons";
import React from "react";
import { Translate } from "react-localize-redux";

import theme from "../../types/theme";

export interface PlayerProps {
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
      color: green[800],
    },
  })
);

export default function AudioPlayer(props: PlayerProps) {
  const [playing, setPlaying] = React.useState<boolean>(false);
  const [audio] = React.useState<HTMLAudioElement>(
    new Audio(props.pronunciationUrl)
  );
  const [timer, setTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

  const classes = useStyles();

  function deletePlay() {
    if (props.deleteAudio) {
      props.deleteAudio(props.wordId, props.fileName);
    }
  }

  function togglePlay() {
    if (!playing) {
      audio.play();
      setPlaying(true);
      audio.addEventListener("ended", () => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
      audio.currentTime = 0;
    }
  }

  function deleteOrTogglePlay(event?: any) {
    if (event?.shiftKey) {
      deletePlay();
    } else {
      togglePlay();
    }
  }

  function longPressStart(event: React.MouseEvent<HTMLButtonElement>) {
    setTimer(
      setTimeout(() => {
        setAnchor(event.currentTarget);
        alert("Ding!");
      }, 1000)
    );
  }

  function longPressRelease() {
    if (timer) {
      clearTimeout(timer);
    }
  }

  function handleClose() {
    setAnchor(null);
  }

  return (
    <React.Fragment>
      <Tooltip title={<Translate id="pronunciations.playTooltip" />}>
        <IconButton
          tabIndex={-1}
          onClick={deleteOrTogglePlay}
          //onTouchStart={longPressStart}
          //onTouchEnd={longPressRelease}
          onMouseDown={longPressStart}
          onMouseUp={longPressRelease}
          onMouseLeave={longPressRelease}
          className={classes.button}
          aria-label="play"
        >
          {playing ? (
            <Stop className={classes.icon} />
          ) : (
            <PlayArrow className={classes.icon} color="primary" />
          )}
        </IconButton>
      </Tooltip>
      <Menu
        getContentAnchorEl={null}
        id="play-menu"
        anchorEl={anchor}
        keepMounted
        open={Boolean(anchor)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem
          onClick={() => {
            togglePlay();
            handleClose();
          }}
        >
          <PlayArrow style={{ marginRight: theme.spacing(1) }} />
          <Translate id="userMenu.userSettings" />
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
