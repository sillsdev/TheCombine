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
import { Delete, PlayArrow, Stop } from "@material-ui/icons";
import React from "react";
import isMobile from "react-device-detect";
import { Translate } from "react-localize-redux";

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
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const isTablet = isMobile; // change to true to test on non-tablet
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
    if (event && isTablet) {
      setAnchor(event.currentTarget);
    } else {
      if (event?.shiftKey) {
        deletePlay();
      } else {
        togglePlay();
      }
    }
  }

  function handleClose() {
    setAnchor(null);
  }

  const refButton = React.createRef<any>();

  return (
    <React.Fragment>
      <Tooltip title={<Translate id="pronunciations.playTooltip" />}>
        <IconButton
          ref={refButton}
          tabIndex={-1}
          onClick={deleteOrTogglePlay}
          //onTouchStart={(event) => setAnchor(event.currentTarget)} //use this if isMobile doesn't work
          className={classes.button}
          aria-label="play"
        >
          {playing ? (
            <Stop className={classes.icon} />
          ) : (
            <PlayArrow className={classes.icon} />
          )}
        </IconButton>
      </Tooltip>
      <Menu
        getContentAnchorEl={null}
        id="play-menu"
        anchorEl={anchor}
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
          {playing ? (
            <Stop className={classes.icon} />
          ) : (
            <PlayArrow className={classes.icon} />
          )}
        </MenuItem>
        <MenuItem
          onClick={() => {
            deletePlay();
            handleClose();
          }}
        >
          <Delete />
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
