import { Delete, PlayArrow, RecordVoiceOver, Stop } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  PopoverOrigin,
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
import CancelConfirmDialog from "components/Dialogs/CancelConfirmDialog";
import MultilineTooltipTitle from "components/MultilineTooltipTitle";
import {
  playing,
  resetPronunciations,
} from "components/Pronunciations/Redux/PronunciationsActions";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

/** Number of ms for a touchscreen press to be considered a long-press.
 * 600 ms is too short: it can still register as a click. */
export const longPressDelay = 700;

export const playButtonId = (fileName: string): string => `audio-${fileName}`;
export const playButtonLabel = "Play";
export const playMenuId = "play-menu";

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
  const [longPressTarget, setLongPressTarget] = useState<
    (EventTarget & HTMLButtonElement) | undefined
  >();
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

  // When pressed, set a timer for a long-press.
  // https://stackoverflow.com/questions/48048957/add-a-long-press-event-in-react
  useEffect(() => {
    const timerId = longPressTarget
      ? setTimeout(() => setAnchor(longPressTarget), longPressDelay)
      : undefined;
    return () => {
      clearTimeout(timerId);
    };
  }, [longPressTarget]);

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
  function handleTouchStart(e: TouchEvent<HTMLButtonElement>): void {
    if (canChangeSpeaker || canDeleteAudio) {
      // Temporarily disable context menu since some browsers
      // interpret a long-press touch as a right-click.
      disableContextMenu();
      setLongPressTarget(e.currentTarget);
    }
  }

  /** When a touch ends, restore the context menu and cancel the long-press timer. */
  function handleTouchEnd(): void {
    enableContextMenu();
    setLongPressTarget(undefined);
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

  const origin: PopoverOrigin = {
    horizontal: document.body.dir === "rtl" ? "right" : "left",
    vertical: "top",
  };

  return (
    <>
      <Tooltip
        disableTouchListener // Conflicts with our long-press menu.
        title={<MultilineTooltipTitle lines={tooltipTexts} />}
        placement="top"
      >
        <IconButton
          tabIndex={-1}
          onAuxClick={handleOnAuxClick}
          onClick={deleteOrTogglePlay}
          onMouseDown={handleOnMouseDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label={playButtonLabel}
          disabled={props.disabled}
          id={playButtonId(props.audio.fileName)}
          size={props.size || "large"}
        >
          {icon}
        </IconButton>
      </Tooltip>
      <Menu
        TransitionComponent={Fade}
        id={playMenuId}
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleMenuOnClose}
        anchorOrigin={origin}
        transformOrigin={origin}
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
      <CancelConfirmDialog
        open={deleteConf}
        text={t(props.warningTextId || "buttons.deletePermanently")}
        titleId="pronunciations.deleteRecording"
        handleCancel={() => setDeleteConf(false)}
        handleConfirm={() => props.deleteAudio!(props.audio.fileName)}
        buttonIdCancel="audio-delete-cancel"
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
