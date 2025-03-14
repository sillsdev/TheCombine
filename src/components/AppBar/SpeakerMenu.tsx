import { Circle, RecordVoiceOver } from "@mui/icons-material";
import {
  Button,
  Divider,
  Icon,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  type ForwardedRef,
  type MouseEvent,
  type ReactElement,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { type Speaker } from "api/models";
import { getAllSpeakers } from "backend";
import { buttonMinHeight } from "components/AppBar/AppBarTypes";
import { setCurrentSpeaker } from "components/Project/ProjectActions";
import { useAppDispatch } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { themeColors } from "types/theme";

const idAffix = "speaker-menu";

/** Icon with dropdown SpeakerMenu */
export default function SpeakerMenu(): ReactElement {
  const dispatch = useAppDispatch();
  const currentSpeaker = useSelector(
    (state: StoreState) => state.currentProjectState.speaker
  );
  const [anchorElement, setAnchorElement] = useState<HTMLElement | undefined>();

  const horizontal = document.body.dir === "rtl" ? "left" : "right";

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
        anchorOrigin={{ horizontal, vertical: "bottom" }}
        id={idAffix}
        onClose={handleClose}
        open={Boolean(anchorElement)}
        transformOrigin={{ horizontal, vertical: "top" }}
      >
        <SpeakerMenuList
          onSelect={(speaker) => dispatch(setCurrentSpeaker(speaker))}
          selectedId={currentSpeaker?.id}
        />
      </Menu>
    </>
  );
}

interface SpeakerMenuListProps {
  forwardedRef?: ForwardedRef<any>;
  onSelect: (speaker?: Speaker) => void;
  selectedId?: string;
}

/** SpeakerMenu options */
export function SpeakerMenuList(props: SpeakerMenuListProps): ReactElement {
  const projectId = useSelector(
    (state: StoreState) => state.currentProjectState.project.id
  );
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (projectId) {
      getAllSpeakers(projectId).then(setSpeakers);
    }
  }, [projectId]);

  const currentIcon = (
    <Circle fontSize="small" style={{ color: themeColors.recordIdle }} />
  );

  const speakerMenuItem = (speaker?: Speaker): ReactElement => {
    const isCurrent = speaker?.id === props.selectedId;
    return (
      <MenuItem
        key={speaker?.id}
        onClick={() => (isCurrent ? {} : props.onSelect(speaker))}
      >
        <ListItemIcon>{isCurrent ? currentIcon : <Icon />}</ListItemIcon>
        <ListItemText>{speaker?.name ?? t("speakerMenu.other")}</ListItemText>
      </MenuItem>
    );
  };

  return (
    <div ref={props.forwardedRef}>
      {speakers.length ? (
        <>
          {speakers.map((s) => speakerMenuItem(s))}
          <Divider />
          {speakerMenuItem()}
        </>
      ) : (
        <MenuItem disabled sx={{ maxWidth: 250 }}>
          <Typography sx={{ whiteSpace: "pre-line" }}>
            {t("speakerMenu.none")}
          </Typography>
        </MenuItem>
      )}
    </div>
  );
}
