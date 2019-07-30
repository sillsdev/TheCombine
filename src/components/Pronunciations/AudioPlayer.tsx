import {
  makeStyles,
  Theme,
  createStyles,
  Tooltip,
  IconButton
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import PlayArrow from "@material-ui/icons/PlayArrow";
import React from "react";

export interface PlayerProps {
  pronunciationUrl: string;
  isPlaying?: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1)
    },
    icon: {
      color: green[800]
    }
  })
);

export default function AudioPlayer(props: PlayerProps) {
  const classes = useStyles();
  const audio = new Audio(props.pronunciationUrl);
  audio.crossOrigin = "annonymous";
  let togglePlay = () => {
    console.log(props.pronunciationUrl);
    audio.play();
  };
  return (
    <Tooltip title="Press to play, shift click to delete">
      <IconButton
        onClick={togglePlay}
        className={classes.button}
        aria-label="play"
      >
        <PlayArrow className={classes.icon} color="primary" />
      </IconButton>
    </Tooltip>
  );
}
