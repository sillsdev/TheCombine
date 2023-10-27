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
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { themeColors } from "types/theme";
import { getNowDateTimeString } from "utilities/utilities";

function makeExportName(projectName: string): string {
  return `${projectName}_${getNowDateTimeString()}.zip`;
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
  const projectId = useAppSelector((state: StoreState) => {
    console.info(state.exportProjectState);
    return state.exportProjectState.projectId;
  });
  const status = useAppSelector(
    (state: StoreState) => state.exportProjectState.status
  );
  const dispatch = useAppDispatch();
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileUrl, setFileUrl] = useState<string | undefined>();
  const { t } = useTranslation();
  const downloadLink = createRef<HTMLAnchorElement>();

  const reset = useCallback(async (): Promise<void> => {
    await dispatch(asyncResetExport());
  }, [dispatch]);

  useEffect(() => {
    if (downloadLink.current && fileUrl) {
      downloadLink.current.click();
      URL.revokeObjectURL(fileUrl);
      setFileName(undefined);
      setFileUrl(undefined);
    }
  }, [downloadLink, fileUrl]);

  useEffect(() => {
    if (fileName) {
      dispatch(asyncDownloadExport(projectId)).then((url) => {
        if (url) {
          setFileUrl(url);
          reset();
        }
      });
    }
  }, [dispatch, fileName, projectId, reset]);

  useEffect(() => {
    console.info("exportState updated");
    if (status === ExportStatus.Success) {
      getProjectName(projectId).then((projectName) => {
        setFileName(makeExportName(projectName));
      });
    }
  }, [projectId, status]);

  function textId(): string {
    switch (status) {
      case ExportStatus.Exporting:
        return "projectExport.exportInProgress";
      case ExportStatus.Success:
      case ExportStatus.Downloading:
        return "projectExport.downloadInProgress";
      case ExportStatus.Failure:
        return "projectExport.exportFailed";
      default:
        throw new Error("Not implemented");
    }
  }

  function icon(): ReactElement {
    switch (status) {
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
    return status === ExportStatus.Failure
      ? themeColors.error
      : props.colorSecondary
      ? themeColors.secondary
      : themeColors.primary;
  }

  function iconFunction(): () => void {
    switch (status) {
      case ExportStatus.Failure:
        return reset;
      default:
        return () => {};
    }
  }

  return (
    <>
      {status !== ExportStatus.Default && (
        <Tooltip title={t(textId())} placement="bottom">
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
      {fileUrl && (
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
