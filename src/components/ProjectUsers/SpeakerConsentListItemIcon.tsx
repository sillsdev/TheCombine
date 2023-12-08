import { Add, AddPhotoAlternate, Image, Mic } from "@mui/icons-material";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ConsentType, Speaker } from "api/models";
import {
  getConsentImageSrc,
  getConsentUrl,
  removeConsent,
  uploadConsent,
} from "backend";
import { IconButtonWithTooltip } from "components/Buttons";
import {
  RecordAudioDialog,
  UploadImageDialog,
  ViewImageDialog,
} from "components/Dialogs";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import { newPronunciation } from "types/word";

export const enum ListItemIconId {
  AddConsent,
  PlayAudio,
  RecordAudio,
  ShowImage,
  UploadAudio,
}

interface ConsentIconProps {
  refresh: () => void | Promise<void>;
  speaker: Speaker;
}

export default function SpeakerConsentListItemIcon(
  props: ConsentIconProps
): ReactElement {
  const [anchor, setAnchor] = useState<HTMLElement | undefined>();

  const unsetAnchorAndRefresh = async (): Promise<void> => {
    setAnchor(undefined);
    await props.refresh();
  };

  return props.speaker.consent === ConsentType.Audio ? (
    <PlayConsentListItemIcon {...props} refresh={unsetAnchorAndRefresh} />
  ) : props.speaker.consent === ConsentType.Image ? (
    <ShowConsentListItemIcon {...props} refresh={unsetAnchorAndRefresh} />
  ) : (
    <ListItemIcon data-testid={ListItemIconId.AddConsent}>
      <IconButtonWithTooltip
        buttonId={`project-speaker-${props.speaker.id}-add`}
        icon={<Add />}
        onClick={(event) => setAnchor(event.currentTarget)}
        textId="projectSettings.speaker.consent.add"
      />
      <Menu
        anchorEl={anchor}
        id="add-consent-menu"
        onClose={() => setAnchor(undefined)}
        open={Boolean(anchor)}
      >
        <RecordConsentMenuItem {...props} />
        <UploadConsentMenuItem {...props} />
      </Menu>
    </ListItemIcon>
  );
}

function PlayConsentListItemIcon(props: ConsentIconProps): ReactElement {
  const handleDeleteAudio = async (): Promise<void> => {
    await removeConsent(props.speaker);
    await props.refresh();
  };

  return (
    <ListItemIcon data-testid={ListItemIconId.PlayAudio}>
      <AudioPlayer
        audio={{ ...newPronunciation(props.speaker.id), _protected: true }}
        deleteAudio={handleDeleteAudio}
        pronunciationUrl={getConsentUrl(props.speaker)}
        size="small"
        warningTextId="projectSettings.speaker.consent.warning"
      />
    </ListItemIcon>
  );
}

function ShowConsentListItemIcon(props: ConsentIconProps): ReactElement {
  const [imgSrc, setImgSrc] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getConsentImageSrc(props.speaker).then(setImgSrc);
  }, [props.speaker]);

  const handleDeleteImage = async (): Promise<void> => {
    await removeConsent(props.speaker);
    setOpen(false);
    await props.refresh();
  };

  return (
    <ListItemIcon data-testid={ListItemIconId.ShowImage}>
      <IconButtonWithTooltip
        buttonId={`project-speaker-${props.speaker.id}-look`}
        icon={<Image />}
        onClick={() => setOpen(true)}
        textId="projectSettings.speaker.consent.look"
      />
      <ViewImageDialog
        close={() => setOpen(false)}
        imgSrc={imgSrc}
        open={open}
        titleId="projectSettings.speaker.consent.look"
        deleteImage={handleDeleteImage}
        deleteTextId="projectSettings.speaker.consent.remove"
      />
    </ListItemIcon>
  );
}

function RecordConsentMenuItem(props: ConsentIconProps): ReactElement {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();

  const handleUploadAudio = async (audioFile: File): Promise<void> => {
    await uploadConsent(props.speaker, audioFile);
    setOpen(false);
    await props.refresh();
  };

  return (
    <MenuItem id={"add-consent-audio"} onClick={() => setOpen(true)}>
      <ListItemIcon data-testid={ListItemIconId.RecordAudio}>
        <Mic />
      </ListItemIcon>
      <ListItemText>{t("projectSettings.speaker.consent.record")}</ListItemText>
      <RecordAudioDialog
        audioId={props.speaker.id}
        close={() => setOpen(false)}
        open={open}
        titleId="projectSettings.speaker.consent.record"
        uploadAudio={handleUploadAudio}
      />
    </MenuItem>
  );
}

function UploadConsentMenuItem(props: ConsentIconProps): ReactElement {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();

  const handleUploadImage = async (imageFile: File): Promise<void> => {
    await uploadConsent(props.speaker, imageFile);
    await props.refresh();
  };

  return (
    <MenuItem id={"add-consent-image"} onClick={() => setOpen(true)}>
      <ListItemIcon data-testid={ListItemIconId.UploadAudio}>
        <AddPhotoAlternate />
      </ListItemIcon>
      <ListItemText>{t("projectSettings.speaker.consent.upload")}</ListItemText>
      <UploadImageDialog
        close={() => setOpen(false)}
        open={open}
        titleId="projectSettings.speaker.consent.upload"
        uploadImage={handleUploadImage}
      />
    </MenuItem>
  );
}
