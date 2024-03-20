import { ButtonProps } from "@mui/material/Button";
import { enqueueSnackbar } from "notistack";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { isFrontierNonempty } from "backend";
import { LoadingButton } from "components/Buttons";
import { asyncExportProject } from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

interface ExportButtonProps {
  projectId: string;
  buttonProps?: ButtonProps;
}

/** A button for exporting project to Lift file */
export default function ExportButton(props: ExportButtonProps): ReactElement {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  async function exportProj(): Promise<void> {
    await isFrontierNonempty(props.projectId).then(async (isNonempty) => {
      if (isNonempty) {
        await dispatch(asyncExportProject(props.projectId));
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
        id: `project-${props.projectId}-export`,
      }}
    >
      {t("buttons.export")}
    </LoadingButton>
  );
}
