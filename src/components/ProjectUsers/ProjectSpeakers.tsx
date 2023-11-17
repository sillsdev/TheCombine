import {
  Add,
  AddPhotoAlternate,
  Delete,
  Edit,
  Image,
  Mic,
  PlayArrow,
} from "@mui/icons-material";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { ConsentType, Speaker } from "api/models";
import {
  createSpeaker,
  deleteSpeaker,
  getAllSpeakers,
  updateSpeakerName,
  uploadConsent,
} from "backend";
import { IconButtonWithTooltip } from "components/Buttons";
import {
  CancelConfirmDialog,
  EditTextDialog,
  RecordAudioDialog,
  SubmitTextDialog,
  UploadImageDialog,
} from "components/Dialogs";

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
  const consentButton = !consent.fileName ? (
    <Fragment />
  ) : consent.fileType === ConsentType.Audio ? (
    <ListItemIcon onClick={() => {}}>
      <IconButtonWithTooltip
        buttonId={`project-speaker-${id}-play`}
        icon={<PlayArrow />}
        textId="projectSettings.speaker.consent.play"
      />
    </ListItemIcon>
  ) : consent.fileType === ConsentType.Image ? (
    <ListItemIcon onClick={() => {}}>
      <IconButtonWithTooltip
        buttonId={`project-speaker-${id}-look`}
        icon={<Image />}
        textId="projectSettings.speaker.consent.look"
      />
    </ListItemIcon>
  ) : (
    <Fragment />
  );

  return (
    <ListItem>
      <ListItemText primary={name} />
      {consentButton}
      <RecordConsentAudioIcon {...props} />
      <UploadConsentImageIcon {...props} />
      <EditSpeakerNameIcon {...props} />
      <DeleteSpeakerIcon {...props} />
    </ListItem>
  );
}

function RecordConsentAudioIcon(props: ProjSpeakerProps): ReactElement {
  const [open, setOpen] = useState(false);

  const handleUploadAudio = async (audioFile: File): Promise<void> => {
    await uploadConsent(props.speaker, audioFile);
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
        buttonIdCancel={"project-speakers-edit-cancel"}
        buttonIdConfirm={"project-speakers-edit-confirm"}
        close={() => setOpen(false)}
        open={open}
        text={props.speaker.name}
        textFieldId={"project-speakers-edit-name"}
        titleId={"projectSettings.speaker.edit"}
        updateText={handleUpdateText}
      />
    </ListItemIcon>
  );
}

function DeleteSpeakerIcon(props: ProjSpeakerProps): ReactElement {
  const [open, setOpen] = useState(false);

  const handleConfirm = async (): Promise<void> => {
    await deleteSpeaker(props.speaker.id, props.projectId);
    await props.refresh();
  };

  return (
    <ListItemIcon>
      <IconButtonWithTooltip
        buttonId={`project-speaker-${props.speaker.id}-delete`}
        icon={<Delete />}
        onClick={() => setOpen(true)}
        textId="projectSettings.speaker.delete"
      />
      <CancelConfirmDialog
        buttonIdCancel={"project-speakers-delete-cancel"}
        buttonIdConfirm={"project-speakers-delete-confirm"}
        handleCancel={() => setOpen(false)}
        handleConfirm={handleConfirm}
        open={open}
        textId={
          props.speaker.consent.fileName
            ? "projectSettings.speaker.consent.warning"
            : "projectSettings.speaker.delete"
        }
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
          buttonId={"project-speakers-add"}
          icon={<Add />}
          onClick={() => setOpen(true)}
          textId="projectSettings.speaker.add"
        />
      </ListItemIcon>
      <SubmitTextDialog
        buttonIdCancel={"project-speakers-add-cancel"}
        buttonIdConfirm={"project-speakers-add-confirm"}
        close={() => setOpen(false)}
        open={open}
        submitText={handleSubmitText}
        textFieldId={"project-speakers-add-name"}
        titleId={"projectSettings.speaker.enterName"}
      />
    </ListItem>
  );
}
