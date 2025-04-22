import { Cancel } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import Button, { ButtonProps } from "@mui/material/Button";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { isFrontierNonempty } from "backend";
import { LoadingButton } from "components/Buttons";
import {
  asyncExportProject,
  asyncCancelExport,
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
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function exportProj(): Promise<void> {
    await dispatch(asyncExportProject(props.projectId));
  }

  async function cancelExport(): Promise<void> {
    setCanceling(true);
    await dispatch(asyncCancelExport(props.projectId));
  }

  const status = useAppSelector(
    (state: StoreState) => state.exportProjectState.status
  );

  useEffect(() => {
    console.log("status: ", status);
    if (
      status === ExportStatus.Exporting ||
      status === ExportStatus.Success ||
      status === ExportStatus.Downloading
    ) {
      setLoading(true);
    } else {
      setCanceling(false);
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    isFrontierNonempty(props.projectId).then(setExports);
  }, [props.projectId]);

  return (
    <>
      <Tooltip title={!exports ? t("projectExport.cannotExportEmpty") : ""}>
        <span>
          <LoadingButton
            loading={loading}
            disabled={loading || canceling || !exports}
            buttonProps={{
              ...props.buttonProps,
              onClick: exportProj,
              id: `project-${props.projectId}-export`,
            }}
          >
            {t("buttons.export")}
          </LoadingButton>
        </span>
      </Tooltip>
      {status == ExportStatus.Exporting && (
        <Tooltip title="Cancel export">
          <Button onClick={cancelExport} disabled={canceling}>
            <Cancel />
          </Button>
        </Tooltip>
      )}
    </>
  );
}
