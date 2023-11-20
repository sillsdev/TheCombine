import { Add, AddPhotoAlternate, Edit, Image, Mic } from "@mui/icons-material";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";

import { ConsentType, Speaker } from "api/models";
import {
  createSpeaker,
  deleteSpeaker,
  getAllSpeakers,
  getConsentImageSrc,
  getConsentUrl,
  removeConsent,
  updateSpeakerName,
  uploadConsent,
} from "backend";
import {
  DeleteButtonWithDialog,
  IconButtonWithTooltip,
} from "components/Buttons";
import {
  EditTextDialog,
  RecordAudioDialog,
  SubmitTextDialog,
  UploadImageDialog,
  ViewImageDialog,
} from "components/Dialogs";
import AudioPlayer from "components/Pronunciations/AudioPlayer";

export default function ProjectSpeakers(props: {
  projectId: string;
}): ReactElement {
  const [projSpeakers, setProjSpeakers] = useState<Speaker[]>([]);

  const getProjectSpeakers = useCallback(() => {
    getAllSpeakers(props.projectId).then((speakers) =>
      setProjSpeakers(speakers.sort((a, b) => a.name.localeCompare(b.name)))
    );
  }, [props.projectId]);

  useEffect(() => {
    getProjectSpeakers();
  }, [getProjectSpeakers]);

  return (
    <List>
      {projSpeakers.map((s) => (
        <SpeakerListItem
          key={s.id}
          projectId={props.projectId}
          refresh={getProjectSpeakers}
          speaker={s}
        />
      ))}
      <AddSpeakerListItem
        projectId={props.projectId}
        refresh={getProjectSpeakers}
      />
    </List>
  );
}

interface ProjSpeakerProps {
  projectId: string;
  refresh: () => void | Promise<void>;
  speaker: Speaker;
}

function SpeakerListItem(props: ProjSpeakerProps): ReactElement {
  const { consent, id, name } = props.speaker;
  const consentButtons =
    consent === ConsentType.Audio ? (
      <ListItemIcon>
        <AudioPlayer
          deleteAudio={() => removeConsent(props.speaker)}
          fileName={id}
          pronunciationUrl={getConsentUrl(props.speaker)}
          size={"small"}
          warningTextId="projectSettings.speaker.consent.warning"
        />
      </ListItemIcon>
    ) : consent === ConsentType.Image ? (
      <ViewConsentImageIcon {...props} />
    ) : (
      <>
        <RecordConsentAudioIcon {...props} />
        <UploadConsentImageIcon {...props} />
      </>
    );

  return (
    <ListItem>
      <DeleteSpeakerIcon {...props} />
      <EditSpeakerNameIcon {...props} />
      <ListItemText primary={name} />
      {consentButtons}
    </ListItem>
  );
}

function ViewConsentImageIcon(props: ProjSpeakerProps): ReactElement {
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
    <ListItemIcon>
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

function RecordConsentAudioIcon(props: ProjSpeakerProps): ReactElement {
  const [open, setOpen] = useState(false);

  const handleUploadAudio = async (audioFile: File): Promise<void> => {
    await uploadConsent(props.speaker, audioFile);
    setOpen(false);
    await props.refresh();
  };

  return (
    <ListItemIcon>
      <IconButtonWithTooltip
        buttonId={`project-speaker-${props.speaker.id}-record`}
        icon={<Mic />}
        onClick={() => setOpen(true)}
        textId="projectSettings.speaker.consent.record"
      />
      <RecordAudioDialog
        audioId={props.speaker.id}
        close={() => setOpen(false)}
        open={open}
        titleId="projectSettings.speaker.consent.record"
        uploadAudio={handleUploadAudio}
      />
    </ListItemIcon>
  );
}

function UploadConsentImageIcon(props: ProjSpeakerProps): ReactElement {
  const [open, setOpen] = useState(false);

  const handleUploadImage = async (imageFile: File): Promise<void> => {
    await uploadConsent(props.speaker, imageFile);
    await props.refresh();
  };

  return (
    <ListItemIcon>
      <IconButtonWithTooltip
        buttonId={`project-speaker-${props.speaker.id}-upload`}
        icon={<AddPhotoAlternate />}
        onClick={() => setOpen(true)}
        textId="projectSettings.speaker.consent.upload"
      />
      <UploadImageDialog
        close={() => setOpen(false)}
        open={open}
        titleId="projectSettings.speaker.consent.upload"
        uploadImage={handleUploadImage}
      />
    </ListItemIcon>
  );
}

function EditSpeakerNameIcon(props: ProjSpeakerProps): ReactElement {
  const [open, setOpen] = useState(false);

  const handleUpdateText = async (name: string): Promise<void> => {
    await updateSpeakerName(props.speaker.id, name, props.projectId);
    await props.refresh();
  };

  return (
    <ListItemIcon>
      <IconButtonWithTooltip
        buttonId={`project-speaker-${props.speaker.id}-edit`}
        icon={<Edit />}
        onClick={() => setOpen(true)}
        textId="projectSettings.speaker.edit"
      />
      <EditTextDialog
        buttonIdCancel="project-speakers-edit-cancel"
        buttonIdConfirm="project-speakers-edit-confirm"
        close={() => setOpen(false)}
        open={open}
        text={props.speaker.name}
        textFieldId="project-speakers-edit-name"
        titleId="projectSettings.speaker.edit"
        updateText={handleUpdateText}
      />
    </ListItemIcon>
  );
}

function DeleteSpeakerIcon(props: ProjSpeakerProps): ReactElement {
  const handleDelete = async (): Promise<void> => {
    await deleteSpeaker(props.speaker.id, props.projectId);
    await props.refresh();
  };

  return (
    <ListItemIcon>
      <DeleteButtonWithDialog
        buttonId={`project-speaker-${props.speaker.id}-delete`}
        buttonIdCancel="project-speakers-delete-cancel"
        buttonIdConfirm="project-speakers-delete-confirm"
        delete={handleDelete}
        textId={
          props.speaker.consent === ConsentType.None
            ? "projectSettings.speaker.delete"
            : "projectSettings.speaker.consent.warning"
        }
        tooltipTextId="projectSettings.speaker.delete"
      />
    </ListItemIcon>
  );
}

interface AddSpeakerProps {
  projectId: string;
  refresh: () => void | Promise<void>;
}

function AddSpeakerListItem(props: AddSpeakerProps): ReactElement {
  const [open, setOpen] = useState(false);

  const handleSubmitText = async (name: string): Promise<void> => {
    await createSpeaker(name, props.projectId);
    await props.refresh();
  };

  return (
    <ListItem>
      <ListItemIcon>
        <IconButtonWithTooltip
          buttonId="project-speakers-add"
          icon={<Add />}
          onClick={() => setOpen(true)}
          textId="projectSettings.speaker.add"
        />
      </ListItemIcon>
      <SubmitTextDialog
        buttonIdCancel="project-speakers-add-cancel"
        buttonIdConfirm="project-speakers-add-confirm"
        close={() => setOpen(false)}
        open={open}
        submitText={handleSubmitText}
        textFieldId="project-speakers-add-name"
        titleId="projectSettings.speaker.enterName"
      />
    </ListItem>
  );
}
