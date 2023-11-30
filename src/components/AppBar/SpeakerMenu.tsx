import { Circle, RecordVoiceOver } from "@mui/icons-material";
import {
  Button,
  Divider,
  Icon,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  ForwardedRef,
  MouseEvent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Speaker } from "api";
import { getAllSpeakers } from "backend";
import { buttonMinHeight } from "components/AppBar/AppBarTypes";
import { setCurrentSpeaker } from "components/Project/ProjectActions";
import { StoreState } from "types";
import { useAppDispatch } from "types/hooks";
import { themeColors } from "types/theme";

const idAffix = "speaker-menu";

/** Icon with dropdown SpeakerMenu */
export default function SpeakerMenu(): ReactElement {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | undefined>();

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    setAnchorElement(event.currentTarget);
  }

  function handleClose(): void {
    setAnchorElement(undefined);
  }

  return (
    <>
      <Button
        aria-controls="speaker-menu"
        aria-haspopup="true"
        color="secondary"
        id={`${idAffix}-icon`}
        onClick={handleClick}
        style={{
          background: anchorElement
            ? themeColors.darkShade
            : themeColors.lightShade,
          margin: 5,
          minHeight: buttonMinHeight,
          minWidth: 0,
        }}
      >
        <RecordVoiceOver />
      </Button>
      <Menu
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        id={idAffix}
        onClose={handleClose}
        open={Boolean(anchorElement)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <SpeakerMenuList />
      </Menu>
    </>
  );
}

interface SpeakerMenuListProps {
  forwardedRef?: ForwardedRef<any>;
}

/** SpeakerMenu options */
export function SpeakerMenuList(props: SpeakerMenuListProps): ReactElement {
  const dispatch = useAppDispatch();
  const currentProjId = useSelector(
    (state: StoreState) => state.currentProjectState.project.id
  );
  const currentSpeaker = useSelector(
    (state: StoreState) => state.currentProjectState.speaker
  );
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (currentProjId) {
      getAllSpeakers(currentProjId).then(setSpeakers);
    }
  }, [currentProjId]);

  const currentIcon = (
    <Circle fontSize="small" style={{ color: themeColors.recordIdle }} />
  );

  const speakerMenuItem = (speaker?: Speaker): ReactElement => {
    const isCurrent = speaker?.id === currentSpeaker?.id;
    return (
      <MenuItem
        key={speaker?.id}
        onClick={() => (isCurrent ? {} : dispatch(setCurrentSpeaker(speaker)))}
      >
        <ListItemIcon>{isCurrent ? currentIcon : <Icon />}</ListItemIcon>
        <ListItemText>{speaker?.name ?? t("speakerMenu.other")}</ListItemText>
      </MenuItem>
    );
  };

  return (
    <div ref={props.forwardedRef}>
      {speakers.map((s) => speakerMenuItem(s))}
      <Divider />
      {speakerMenuItem()}
    </div>
  );
}
