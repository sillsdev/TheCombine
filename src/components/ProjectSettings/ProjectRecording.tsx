import { HelpOutline } from "@mui/icons-material";
import {
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import CancelConfirmDialog from "components/Buttons/CancelConfirmDialog";
import { asyncUpdateCurrentProject } from "components/Project/ProjectActions";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

interface ProjectRecordingProps {
  isOwner?: boolean;
}

export default function ProjectRecording(props: ProjectRecordingProps) {
  const project = useAppSelector(
    (state: StoreState) => state.currentProjectState.project
  );
  const dispatch = useAppDispatch();
  const [recordingConsentOpen, setRecordingConsentOpen] = useState(false);
  const { t } = useTranslation();

  const setRecordingConsented = async (
    recordingConsented: boolean
  ): Promise<void> => {
    if (recordingConsented !== project.recordingConsented) {
      await dispatch(
        asyncUpdateCurrentProject({ ...project, recordingConsented })
      );
    }
  };

  const onChange = (e: SelectChangeEvent<number>) => {
    if (e.target.value) {
      setRecordingConsentOpen(true);
    } else {
      setRecordingConsented(false);
    }
  };

  return (
    <Grid container>
      <Grid>
        <Select
          variant="standard"
          value={project.recordingConsented ? 1 : 0}
          onChange={onChange}
          disabled={!props.isOwner}
        >
          <MenuItem value={0}>{t("projectSettings.autocomplete.off")}</MenuItem>
          <MenuItem value={1}>{t("projectSettings.autocomplete.on")}</MenuItem>
        </Select>
        <CancelConfirmDialog
          open={recordingConsentOpen}
          textId="createProject.enableRecordingConsent"
          handleCancel={() => {
            setRecordingConsented(false);
            setRecordingConsentOpen(false);
          }}
          handleConfirm={() => {
            setRecordingConsented(true);
            setRecordingConsentOpen(false);
          }}
          buttonIdCancel="proj-recording-cancel"
          buttonIdConfirm="proj-recording-confirm"
        />
      </Grid>
      <Grid>
        <Tooltip
          title={t(
            props.isOwner
              ? "projectSettings.recording.hintOwner"
              : "projectSettings.recording.hintOther"
          )}
          placement="right"
        >
          <HelpOutline />
        </Tooltip>
      </Grid>
    </Grid>
  );
}
