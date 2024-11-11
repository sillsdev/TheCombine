import { Tooltip } from "@mui/material";
import { ButtonProps } from "@mui/material/Button";
import { enqueueSnackbar } from "notistack";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { isFrontierNonempty } from "backend";
import { LoadingButton } from "components/Buttons";
import { asyncExportProject } from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

interface ExportButtonProps {
  projectId: string;
  buttonProps?: ButtonProps & { "data-testid"?: string };
  disabled?: boolean;
}

/** A button for exporting project to Lift file */
export default function ExportButton(props: ExportButtonProps): ReactElement {
  const dispatch = useAppDispatch();
  const [exports, setExports] = useState<boolean>(false);
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

  useEffect(() => {
    const fetchNonempty = async (): Promise<void> => {
      await isFrontierNonempty(props.projectId).then(async (isNonempty) => {
        if (isNonempty) {
          setExports(true);
        }
      });
    };
    fetchNonempty().catch(console.error);
  });

  return (
    <Tooltip title={!exports ? t("projectExport.cannotExportEmpty") : ""}>
      <span>
        <LoadingButton
          loading={loading}
          disabled={loading}
          buttonProps={{
            ...props.buttonProps,
            onClick: exportProj,
            id: `project-${props.projectId}-export`,
            disabled: !exports,
          }}
        >
          {t("buttons.export")}
        </LoadingButton>
      </span>
    </Tooltip>
  );
}
