import { Delete, PlayArrow, RecordVoiceOver, Stop } from "@mui/icons-material";
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
  MouseEvent,
  ReactElement,
  TouchEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { Pronunciation, Speaker } from "api/models";
import { getSpeaker } from "backend";
import { SpeakerMenuList } from "components/AppBar/SpeakerMenu";
import { ButtonConfirmation } from "components/Dialogs";
import MultilineTooltipTitle from "components/MultilineTooltipTitle";
import {
  playing,
  resetPronunciations,
} from "components/Pronunciations/Redux/PronunciationsActions";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

interface PlayerProps {
  audio: Pronunciation;
  deleteAudio?: (fileName: string) => void;
  disabled?: boolean;
  onClick?: () => void;
  pronunciationUrl?: string;
  size?: "large" | "medium" | "small";
  updateAudioSpeaker?: (speakerId?: string) => Promise<void> | void;
  warningTextId?: string;
}

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

  const canChangeSpeaker = props.updateAudioSpeaker && !props.audio.protected;
  const canDeleteAudio = props.deleteAudio && !props.audio.protected;

  useEffect(() => {
    if (props.audio.speakerId) {
      getSpeaker(props.audio.speakerId).then(setSpeaker);
    } else {
      setSpeaker(undefined);
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
    if (event?.shiftKey && canDeleteAudio) {
      setDeleteConf(true);
    } else {
      togglePlay();
    }
  }

  function handleMenuOnClose(): void {
    setAnchor(undefined);
    enableContextMenu();
  }

  function preventEventOnce(event: any): void {
    event.preventDefault();
    enableContextMenu();
  }

  function disableContextMenu(): void {
    document.addEventListener("contextmenu", preventEventOnce, false);
  }

  function enableContextMenu(): void {
    document.removeEventListener("contextmenu", preventEventOnce, false);
  }

  /** If audio can be deleted or speaker changed, a touchscreen press should open an
   * options menu instead of the context menu. */
  function handleTouch(e: TouchEvent<HTMLButtonElement>): void {
    if (canChangeSpeaker || canDeleteAudio) {
      // Temporarily disable context menu since some browsers
      // interpret a long-press touch as a right-click.
      disableContextMenu();
      setAnchor(e.currentTarget);
    }
  }

  async function handleOnSelect(speaker?: Speaker): Promise<void> {
    if (canChangeSpeaker) {
      await props.updateAudioSpeaker!(speaker?.id);
    }
    setSpeakerDialog(false);
  }

  /** If speaker can be changed, a right click should open the speaker menu instead of
   * the context menu. */
  function handleOnAuxClick(): void {
    if (canChangeSpeaker) {
      disableContextMenu();
      setSpeakerDialog(true);
    }
  }

  /** Catch a multi-finger mousepad tap as a right click. */
  function handleOnMouseDown(e: MouseEvent<HTMLButtonElement>): void {
    if (e.buttons > 1) {
      handleOnAuxClick();
    }
  }

  const tooltipTexts = [t("pronunciations.playTooltip")];
  if (canDeleteAudio) {
    tooltipTexts.push(t("pronunciations.deleteTooltip"));
  }
  if (props.audio.protected) {
    tooltipTexts.push(t("pronunciations.protectedTooltip"));
  }
  if (speaker) {
    tooltipTexts.push(t("pronunciations.speaker", { val: speaker.name }));
  }
  if (canChangeSpeaker) {
    tooltipTexts.push(
      speaker
        ? t("pronunciations.speakerChange")
        : t("pronunciations.speakerAdd")
    );
  }

  const icon = isPlaying ? (
    <Stop
      sx={{
        color: (t) =>
          props.disabled ? t.palette.grey[400] : t.palette.success.main,
      }}
    />
  ) : (
    <PlayArrow
      sx={{
        color: (t) =>
          props.disabled ? t.palette.grey[400] : t.palette.success.main,
      }}
    />
  );

  return (
    <>
      <Tooltip
        title={<MultilineTooltipTitle lines={tooltipTexts} />}
        placement="top"
      >
        <IconButton
          tabIndex={-1}
          onAuxClick={handleOnAuxClick}
          onClick={deleteOrTogglePlay}
          onMouseDown={handleOnMouseDown}
          onTouchStart={handleTouch}
          onTouchEnd={enableContextMenu}
          aria-label="play"
          disabled={props.disabled}
          id={`audio-${props.audio.fileName}`}
          size={props.size || "large"}
        >
          {icon}
        </IconButton>
      </Tooltip>
      <Menu
        TransitionComponent={Fade}
        id="play-menu"
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleMenuOnClose}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          id={isPlaying ? "audio-stop" : "audio-play"}
          onClick={() => {
            togglePlay();
            handleMenuOnClose();
          }}
        >
          {icon}
        </MenuItem>
        {canChangeSpeaker && (
          <MenuItem
            id="audio-speaker"
            onClick={() => {
              setSpeakerDialog(true);
              handleMenuOnClose();
            }}
          >
            <RecordVoiceOver />
          </MenuItem>
        )}
        {canDeleteAudio && (
          <MenuItem
            id="audio-delete"
            onClick={() => {
              setDeleteConf(true);
              handleMenuOnClose();
            }}
          >
            <Delete />
          </MenuItem>
        )}
      </Menu>
      <ButtonConfirmation
        open={deleteConf}
        textId={props.warningTextId || "buttons.deletePermanently"}
        titleId="pronunciations.deleteRecording"
        onClose={() => setDeleteConf(false)}
        onConfirm={() => props.deleteAudio!(props.audio.fileName)}
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
