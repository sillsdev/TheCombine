import { Tooltip } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import React from "react";
import { Translate } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import LoadingDoneButton from "components/Buttons/LoadingDoneButton";
import DownloadButton from "components/ProjectExport/DownloadButton";
import { asyncExportProject } from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreState } from "types";

interface ExportButtonProps {
  projectId: string;
  buttonProps?: ButtonProps;
}

/** A button for exporting project to Lift file */
export default function ExportButton(props: ExportButtonProps) {
  const dispatch = useDispatch();
  function exportProj() {
    dispatch(asyncExportProject(props.projectId));
  }

  const exportResult = useSelector(
    (state: StoreState) => state.exportProjectState
  );
  const sameProject = props.projectId === exportResult.projectId;
  const loading = exportResult.status === ExportStatus.InProgress;
  const done = exportResult.status === ExportStatus.Success;

  return (
    <React.Fragment>
      <Tooltip
        title={
          done && !sameProject ? (
            <Translate id="projectExport.downloadHint" />
          ) : (
            ""
          )
        }
      >
        <span>
          <LoadingDoneButton
            loading={loading}
            done={done && sameProject}
            doneText={<Translate id="projectExport.downloadReady" />}
            disabled={loading || done}
            buttonProps={{
              ...props.buttonProps,
              onClick: exportProj,
              color: "primary",
            }}
          >
            <Translate id={"buttons.export"} />
          </LoadingDoneButton>
        </span>
      </Tooltip>
      {sameProject && <DownloadButton />}
    </React.Fragment>
  );
}
