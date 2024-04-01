import { Add, Edit } from "@mui/icons-material";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { ConsentType, Speaker } from "api/models";
import {
  createSpeaker,
  deleteSpeaker,
  getAllSpeakers,
  updateSpeakerName,
} from "backend";
import {
  DeleteButtonWithDialog,
  IconButtonWithTooltip,
} from "components/Buttons";
import { EditTextDialog, SubmitTextDialog } from "components/Dialogs";
import SpeakerConsentListItemIcon from "components/ProjectUsers/SpeakerConsentListItemIcon";

export default function ProjectSpeakersList(props: {
  projectId: string;
}): ReactElement {
  const [projSpeakers, setProjSpeakers] = useState<Speaker[]>([]);

  const getProjectSpeakers = useCallback(() => {
    if (props.projectId) {
      getAllSpeakers(props.projectId).then(setProjSpeakers);
    }
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

export function SpeakerListItem(props: ProjSpeakerProps): ReactElement {
  const { refresh, speaker } = props;
  return (
    <ListItem>
      <DeleteSpeakerListItemIcon {...props} />
      <EditSpeakerNameListItemIcon {...props} />
      <SpeakerConsentListItemIcon refresh={refresh} speaker={speaker} />
      <ListItemText primary={speaker.name} />
    </ListItem>
  );
}

function EditSpeakerNameListItemIcon(props: ProjSpeakerProps): ReactElement {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();

  const handleUpdateText = async (name: string): Promise<void> => {
    name = name.trim();
    if (!name) {
      return Promise.reject(t("projectSettings.speaker.nameEmpty"));
    }
    await updateSpeakerName(props.speaker.id, name, props.projectId)
      .then(async () => {
        await props.refresh();
      })
      .catch((err) => toast.error(t(err.response?.data ?? err.message)));
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

function DeleteSpeakerListItemIcon(props: ProjSpeakerProps): ReactElement {
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

export function AddSpeakerListItem(props: AddSpeakerProps): ReactElement {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();

  const handleSubmitText = async (name: string): Promise<void> => {
    name = name.trim();
    if (!name) {
      return Promise.reject(t("projectSettings.speaker.nameEmpty"));
    }
    await createSpeaker(name, props.projectId)
      .then(async () => {
        await props.refresh();
      })
      .catch((err) => toast.error(t(err.response?.data ?? err.message)));
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
