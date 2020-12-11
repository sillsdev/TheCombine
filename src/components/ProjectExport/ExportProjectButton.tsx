import { ButtonProps } from "@material-ui/core/Button";
import React from "react";
import { Translate } from "react-localize-redux";

import LoadingButton from "../Buttons/LoadingButton";
import DownloadButton from "./DownloadButton";
import { ExportStatus } from "./ExportProjectActions";
import { ExportProjectState } from "./ExportProjectReducer";

interface ExportProjectProps {
  exportProject: (projectId: string) => void;
  exportResult: ExportProjectState;
  projectId: string;
}

/** A button for exporting project to Lift file */
export default function ExportProjectButton(
  props: ButtonProps & ExportProjectProps
) {
  // Use Destructuring to define buttonProps without our ExportProjectProps.
  const { exportProject, exportResult, projectId, ...buttonProps } = props;
  const sameProject = props.projectId === props.exportResult.projectId;
  // The export button will not be clickable if another export is underway.
  const loading = [ExportStatus.InProgress, ExportStatus.Success].includes(
    props.exportResult.status
  );

  function exportProj() {
    props.exportProject(props.projectId);
  }

  return (
    <React.Fragment>
      <LoadingButton
        onClick={exportProj}
        color="primary"
        loading={loading}
        {...buttonProps}
      >
        <Translate id="buttons.export" />
      </LoadingButton>
      {sameProject && <DownloadButton />}
    </React.Fragment>
  );
}
