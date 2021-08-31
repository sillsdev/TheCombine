import { Tooltip } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import { isFrontierNonempty } from "backend";
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
export function ExportButton(props: ExportButtonProps & LocalizeContextProps) {
  const dispatch = useDispatch();
  function exportProj() {
    isFrontierNonempty(props.projectId).then((isNonempty) => {
      if (isNonempty) {
        dispatch(asyncExportProject(props.projectId));
      } else {
        alert(props.translate("projectExport.cannotExportEmpty"));
      }
    });
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
          done && !sameProject
            ? props.translate("projectExport.downloadHint")
            : ""
        }
      >
        <span>
          <LoadingDoneButton
            loading={loading}
            done={done && sameProject}
            doneText={props.translate("projectExport.downloadReady")}
            disabled={loading || done}
            buttonProps={{
              ...props.buttonProps,
              onClick: exportProj,
              color: "primary",
              id: `project-${props.projectId}-export`,
            }}
          >
            {props.translate("buttons.export")}
          </LoadingDoneButton>
        </span>
      </Tooltip>
      {sameProject && <DownloadButton />}
    </React.Fragment>
  );
}

export default withLocalize(ExportButton);
