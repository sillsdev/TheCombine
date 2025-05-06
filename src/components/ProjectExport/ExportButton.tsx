import { Tooltip } from "@mui/material";
import { ButtonProps } from "@mui/material/Button";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { hasFrontierWords } from "backend";
import { LoadingButton } from "components/Buttons";
import { asyncExportProject } from "components/ProjectExport/Redux/ExportProjectActions";
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
  const [exports, setExports] = useState(false);
  const { t } = useTranslation();

  async function exportProj(): Promise<void> {
    await dispatch(asyncExportProject(props.projectId));
  }

  const exportResult = useAppSelector(
    (state: StoreState) => state.exportProjectState
  );
  const loading =
    exportResult.status === ExportStatus.Exporting ||
    exportResult.status === ExportStatus.Success ||
    exportResult.status === ExportStatus.Downloading;

  useEffect(() => {
    hasFrontierWords(props.projectId).then(setExports);
  }, [props.projectId]);

  return (
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
  );
}
