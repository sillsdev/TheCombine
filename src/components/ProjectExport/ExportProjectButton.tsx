import { ButtonProps } from "@material-ui/core/Button";
import React from "react";
import { Translate } from "react-localize-redux";

import LoadingButton from "components/Buttons/LoadingButton";
import DownloadButton from "components/ProjectExport/DownloadButton";
import { ExportStatus } from "components/ProjectExport/ExportProjectActions";
import { ExportProjectState } from "components/ProjectExport/ExportProjectReducer";

interface ExportProjectProps {
  exportProject: (projectId: string) => void;
  exportResult: ExportProjectState;
  projectId: string;
  buttonProps?: ButtonProps;
}

/** A button for exporting project to Lift file */
export default function ExportProjectButton(props: ExportProjectProps) {
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
        loading={loading}
        buttonProps={{
          ...props.buttonProps,
          onClick: exportProj,
          color: "primary",
        }}
      >
        <Translate id="buttons.export" />
      </LoadingButton>
      {sameProject && <DownloadButton />}
    </React.Fragment>
  );
}
