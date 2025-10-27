import { Cancel } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { ButtonProps } from "@mui/material/Button";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { hasFrontierWords } from "backend";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import LoadingButton from "components/Buttons/LoadingButton";
import {
  asyncExportProject,
  asyncCancelExport,
} from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

interface ExportButtonProps {
  projectId: string;
  buttonProps?: ButtonProps;
}

/** A button for exporting project to LIFT file. */
export default function ExportButton(props: ExportButtonProps): ReactElement {
  const dispatch = useAppDispatch();
  const [exports, setExports] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function exportProj(): Promise<void> {
    await dispatch(asyncExportProject(props.projectId));
  }

  async function cancelExport(): Promise<void> {
    await dispatch(asyncCancelExport());
  }

  const status = useAppSelector(
    (state: StoreState) => state.exportProjectState.status
  );

  useEffect(() => {
    setLoading(
      status === ExportStatus.Exporting ||
        status === ExportStatus.Success ||
        status === ExportStatus.Downloading
    );
  }, [status]);

  useEffect(() => {
    hasFrontierWords(props.projectId).then(setExports);
  }, [props.projectId]);

  return (
    <>
      <Tooltip title={!exports ? t("projectExport.cannotExportEmpty") : ""}>
        <span>
          <LoadingButton
            loading={loading}
            disabled={loading || !exports}
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
      {status === ExportStatus.Exporting && (
        <IconButtonWithTooltip
          icon={<Cancel />}
          onClick={cancelExport}
          textId={"projectExport.cancelExport"}
        />
      )}
    </>
  );
}
