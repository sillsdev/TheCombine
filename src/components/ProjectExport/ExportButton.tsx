import { ButtonProps } from "@material-ui/core/Button";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import { isFrontierNonempty } from "backend";
import LoadingButton from "components/Buttons/LoadingButton";
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
  const loading =
    exportResult.status === ExportStatus.Exporting ||
    exportResult.status === ExportStatus.Success ||
    exportResult.status === ExportStatus.Downloading;

  return (
    <LoadingButton
      loading={loading}
      disabled={loading}
      buttonProps={{
        ...props.buttonProps,
        onClick: exportProj,
        color: "primary",
        id: `project-${props.projectId}-export`,
      }}
    >
      {props.translate("buttons.export")}
    </LoadingButton>
  );
}

export default withLocalize(ExportButton);
