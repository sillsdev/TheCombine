import { Cancel } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import Button, { ButtonProps } from "@mui/material/Button";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { isFrontierNonempty } from "backend";
import { LoadingButton } from "components/Buttons";
import {
  asyncExportProject,
  asyncResetExport,
} from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

interface ExportButtonProps {
  projectId: string;
  buttonProps?: ButtonProps & { "data-testid"?: string };
}

/** A button for exporting project to Lift file */
export default function ExportButton(props: ExportButtonProps): ReactElement {
  const dispatch = useAppDispatch();
  const [canceling, setCanceling] = useState(false);
  const [exports, setExports] = useState(false);
  const { t } = useTranslation();

  async function exportProj(): Promise<void> {
    await dispatch(asyncExportProject(props.projectId));
  }

  async function resetExport(): Promise<void> {
    setCanceling(true);

    exportResult.status === ExportStatus.Default;
    await dispatch(asyncResetExport);
    // setCanceling(false);
  }

  const exportResult = useAppSelector(
    (state: StoreState) => state.exportProjectState
  );
  const loading =
    exportResult.status === ExportStatus.Exporting ||
    exportResult.status === ExportStatus.Success ||
    exportResult.status === ExportStatus.Downloading;

  useEffect(() => {
    isFrontierNonempty(props.projectId).then(setExports);
  }, [props.projectId]);

  return (
    <>
      <Tooltip title={!exports ? t("projectExport.cannotExportEmpty") : ""}>
        <span>
          <LoadingButton
            loading={loading && exportResult.status !== ExportStatus.Default}
            disabled={loading || canceling || !exports}
            buttonProps={{
              ...props.buttonProps,
              onClick: exportProj,
              id: `project-${props.projectId}-export`,
            }}
          >
            {t("buttons.export")}
          </LoadingButton>
          {loading && (
            <Tooltip title="Cancel export">
              <Button onClick={resetExport} disabled={canceling}>
                <Cancel />
              </Button>
            </Tooltip>
          )}
        </span>
      </Tooltip>
    </>
  );
}
