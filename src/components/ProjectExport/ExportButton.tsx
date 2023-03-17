import { ButtonProps } from "@mui/material/Button";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import { isFrontierNonempty } from "backend";
import LoadingButton from "components/Buttons/LoadingButton";
import { asyncExportProject } from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

interface ExportButtonProps {
  projectId: string;
  buttonProps?: ButtonProps;
}

/** A button for exporting project to Lift file */
export default function ExportButton(props: ExportButtonProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  function exportProj() {
    isFrontierNonempty(props.projectId).then((isNonempty) => {
      if (isNonempty) {
        dispatch(asyncExportProject(props.projectId));
      } else {
        enqueueSnackbar(t("projectExport.cannotExportEmpty"));
      }
    });
  }

  const exportResult = useAppSelector(
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
      {t("buttons.export")}
    </LoadingButton>
  );
}
