import {
  Add,
  AddPhotoAlternate,
  Delete,
  Edit,
  FiberManualRecord,
  Image,
  PlayArrow,
} from "@mui/icons-material";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Fragment, ReactElement, useEffect, useState } from "react";

import { ConsentType, Speaker } from "api/models";
import { getAllSpeakers } from "backend";
import { IconButtonWithTooltip } from "components/Buttons";

export default function ProjectSpeakers(props: {
  projectId: string;
}): ReactElement {
  const [projSpeakers, setProjSpeakers] = useState<Speaker[]>([]);

  useEffect(() => {
    getAllSpeakers(props.projectId).then((speakers) =>
      setProjSpeakers(speakers.sort((a, b) => a.name.localeCompare(b.name)))
    );
  }, [props.projectId]);

  return (
    <List>
      {projSpeakers.map((s) => (
        <SpeakerListItem key={s.id} speaker={s} />
      ))}
      <ListItem>
        <ListItemIcon onClick={() => {}}>
          <IconButtonWithTooltip
            buttonId={"project-speakers-add"}
            icon={<Add />}
            textId="projectSettings.speaker.add"
          />
        </ListItemIcon>
      </ListItem>
    </List>
  );
}

export function SpeakerListItem(props: { speaker: Speaker }): ReactElement {
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
      <ListItemIcon onClick={() => {}}>
        <IconButtonWithTooltip
          buttonId={`project-speaker-${id}-record`}
          icon={<FiberManualRecord />}
          textId="projectSettings.speaker.consent.record"
        />
      </ListItemIcon>
      <ListItemIcon onClick={() => {}}>
        <IconButtonWithTooltip
          buttonId={`project-speaker-${id}-upload`}
          icon={<AddPhotoAlternate />}
          textId="projectSettings.speaker.consent.upload"
        />
      </ListItemIcon>
      <ListItemIcon onClick={() => {}}>
        <IconButtonWithTooltip
          buttonId={`project-speaker-${id}-edit`}
          icon={<Edit />}
          textId="projectSettings.speaker.edit"
        />
      </ListItemIcon>
      <ListItemIcon onClick={() => {}}>
        <IconButtonWithTooltip
          buttonId={`project-speaker-${id}-delete`}
          icon={<Delete />}
          textId="projectSettings.speaker.delete"
        />
      </ListItemIcon>
    </ListItem>
  );
}
