import { Delete, PlayArrow, Stop } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { Pronunciation, Speaker } from "api/models";
import { getSpeaker } from "backend";
import { SpeakerMenuList } from "components/AppBar/SpeakerMenu";
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
  audio: Pronunciation;
  onClick?: () => void;
  pronunciationUrl?: string;
  size?: "large" | "medium" | "small";
  updateAudioSpeaker?: (speakerId?: string) => Promise<void> | void;
  warningTextId?: string;
}

const iconStyle: CSSProperties = { color: themeColors.success };

export default function AudioPlayer(props: PlayerProps): ReactElement {
  const isPlaying = useAppSelector(
    (state: StoreState) =>
      state.pronunciationsState.fileName === props.audio.fileName &&
      state.pronunciationsState.status === PronunciationsStatus.Playing
  );

  const [audio] = useState<HTMLAudioElement>(
    new Audio(props.pronunciationUrl ?? props.audio.fileName)
  );
  const [anchor, setAnchor] = useState<HTMLElement | undefined>();
  const [deleteConf, setDeleteConf] = useState(false);
  const [speaker, setSpeaker] = useState<Speaker | undefined>();
  const [speakerDialog, setSpeakerDialog] = useState(false);

  const dispatch = useAppDispatch();
  const dispatchReset = useCallback(
    () => dispatch(resetPronunciations()),
    [dispatch]
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (props.audio.speakerId) {
      getSpeaker(props.audio.speakerId).then(setSpeaker);
    }
  }, [props.audio.speakerId]);

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
      dispatch(playing(props.audio.fileName));
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

  let title = t("pronunciations.playTooltip");
  if (speaker) {
    title += ` ${t("pronunciations.speaker", { val: speaker.name })}`;
  }
  if (props.updateAudioSpeaker && !props.audio._protected) {
    title += ` ${
      speaker
        ? t("pronunciations.speakerChange")
        : t("pronunciations.speakerAdd")
    }`;
  }

  const handleOnSelect = async (speaker?: Speaker): Promise<void> => {
    if (props.updateAudioSpeaker && !props.audio._protected) {
      await props.updateAudioSpeaker(speaker?.id);
    }
    setSpeakerDialog(false);
  };

  return (
    <>
      <Tooltip title={title} placement="top">
        <IconButton
          tabIndex={-1}
          onClick={deleteOrTogglePlay}
          onAuxClick={() => setSpeakerDialog(true)}
          onTouchStart={handleTouch}
          onTouchEnd={enableContextMenu}
          aria-label="play"
          id={`audio-${props.audio.fileName}`}
          size={props.size || "large"}
        >
          {isPlaying ? <Stop sx={iconStyle} /> : <PlayArrow sx={iconStyle} />}
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
          {isPlaying ? <Stop sx={iconStyle} /> : <PlayArrow sx={iconStyle} />}
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
        textId={props.warningTextId || "buttons.deletePermanently"}
        titleId="pronunciations.deleteRecording"
        onClose={() => setDeleteConf(false)}
        onConfirm={() => props.deleteAudio(props.audio.fileName)}
        buttonIdClose="audio-delete-cancel"
        buttonIdConfirm="audio-delete-confirm"
      />
      <Dialog open={speakerDialog} onClose={() => setSpeakerDialog(false)}>
        <DialogTitle>{t("pronunciations.speakerSelect")}</DialogTitle>
        <DialogContent>
          <SpeakerMenuList onSelect={handleOnSelect} selectedId={speaker?.id} />
        </DialogContent>
      </Dialog>
    </>
  );
}
