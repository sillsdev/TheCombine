import {
  makeStyles,
  Theme,
  createStyles,
  Tooltip,
  IconButton,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import PlayArrow from "@material-ui/icons/PlayArrow";
import React from "react";
import { Translate } from "react-localize-redux";
import { Stop } from "@material-ui/icons";
import * as Backend from "../../backend";

export interface PlayerProps {
  pronunciationUrl: string;
  wordId: string;
  fileName: string;
  isPlaying?: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
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

  const classes = useStyles();
  // const audio = new Audio(props.pronunciationUrl);
  // audio.crossOrigin = "annonymous";

  let deleteOrTogglePlay = (event: any) => {
    if (event.shiftKey) {
      Backend.deleteAudio(props.wordId, props.fileName);
      console.log("Shift click works");
    } else if (!playing) {
      audio.play();
      setPlaying(true);
      audio.addEventListener("ended", () => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
      audio.currentTime = 0;
    }
  };

  return (
    <Tooltip title={<Translate id="pronunciations.playTooltip" />}>
      <IconButton
        onClick={deleteOrTogglePlay}
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
  );
}
