import { Cached, Error as ErrorIcon } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import {
  createRef,
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { getProjectName } from "backend";
import {
  asyncDownloadExport,
  asyncResetExport,
} from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { themeColors } from "types/theme";
import { getDateTimeString } from "utilities/utilities";

function makeExportName(projectName: string): string {
  return `${projectName}_${getDateTimeString()}.zip`;
}

interface DownloadButtonProps {
  colorSecondary?: boolean;
}

/**
 * A button to show export status. This automatically initiates a download
 * when a user's export is done, so there should be exactly one copy of this
 * component rendered at any given time in the logged-in app. */
export default function DownloadButton(
  props: DownloadButtonProps
): ReactElement {
  const exportState = useAppSelector(
    (state: StoreState) => state.exportProjectState
  );
  const dispatch = useAppDispatch();
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [queueReset, setQueueReset] = useState(false);
  const { t } = useTranslation();
  const downloadLink = createRef<HTMLAnchorElement>();

  const reset = useCallback(async (): Promise<void> => {
    setFileName("");
    setFileUrl("");
    setQueueReset(false);
    await dispatch(asyncResetExport());
  }, [dispatch]);

  /* If another useEffect queued a reset, do the reset. */
  useEffect(() => {
    if (queueReset) {
      reset();
    }
  }, [queueReset, reset]);

  /* This useEffect will indirectly trigger when fileUrl is nonempty,
  because that causes the rendering of a link `<a ref={downloadLink} ...` */
  useEffect(() => {
    if (downloadLink.current) {
      downloadLink.current.click();

      // Clear the fileUrl, revoking its previous target.
      setFileUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return "";
      });

      // This keeps `reset` out of the dependency array, preventing double-download.
      setQueueReset(true);
    }
  }, [downloadLink]);

  /* Once a file name is ready following a successful export,
   * bring the file from the backend for download. */
  useEffect(() => {
    if (fileName && exportState.projectId) {
      dispatch(asyncDownloadExport(exportState.projectId)).then((url) =>
        setFileUrl(url ?? "")
      );
    }
  }, [dispatch, exportState.projectId, fileName]);

  /* After an export (successful or otherwise),
   * use the id of the exported project to get the project name. */
  useEffect(() => {
    if (exportState.projectId) {
      getProjectName(exportState.projectId).then(setProjectName);
    } else {
      setProjectName("");
    }
  }, [exportState.projectId]);

  /* Upon successful export, use the project name to generate the download's filename. */
  useEffect(() => {
    if (exportState.status === ExportStatus.Success && projectName) {
      setFileName(makeExportName(projectName));
    }
  }, [exportState.status, projectName]);

  function tooltipText(): string {
    switch (exportState.status) {
      case ExportStatus.Exporting:
        return t("projectExport.exportInProgress", { val: projectName });
      case ExportStatus.Canceling:
        return t("projectExport.canceledExport", { val: projectName });
      case ExportStatus.Success:
      case ExportStatus.Downloading:
        return t("projectExport.downloadInProgress", { val: projectName });
      case ExportStatus.Failure:
        return t("projectExport.exportFailed", { val: projectName });
      default:
        throw new Error("Not implemented");
    }
  }

  function icon(): ReactElement {
    switch (exportState.status) {
      case ExportStatus.Exporting:
      case ExportStatus.Downloading:
      case ExportStatus.Success:
        return <Cached />;
      case ExportStatus.Failure:
        return <ErrorIcon />;
      default:
        return <Fragment />;
    }
  }

  function iconColor(): `#${string}` {
    return exportState.status === ExportStatus.Failure
      ? themeColors.error
      : props.colorSecondary
        ? themeColors.secondary
        : themeColors.primary;
  }

  function iconFunction(): () => void {
    switch (exportState.status) {
      case ExportStatus.Failure:
        return reset;
      default:
        return () => {};
    }
  }

  return (
    <>
      {exportState.status !== ExportStatus.Default && (
        <Tooltip title={tooltipText()} placement="bottom">
          <IconButton
            tabIndex={-1}
            onClick={iconFunction()}
            style={{ color: iconColor() }}
            size="large"
          >
            {icon()}
          </IconButton>
        </Tooltip>
      )}
      {!!fileUrl && (
        <a
          ref={downloadLink}
          href={fileUrl}
          download={fileName}
          style={{ display: "none" }}
        >
          (This link should not be visible)
        </a>
      )}
    </>
  );
}
