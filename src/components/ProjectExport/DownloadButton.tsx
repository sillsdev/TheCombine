import { IconButton, Tooltip } from "@material-ui/core";
import { Cached, Error as ErrorIcon, GetApp } from "@material-ui/icons";
import React, { createRef, ReactElement, useEffect, useState } from "react";
import { Translate } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import { getProjectName } from "backend";
import {
  asyncDownloadExport,
  resetExport,
} from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreState } from "types";
import { themeColors } from "types/theme";
import { getNowDateTimeString } from "utilities";

interface DownloadButtonProps {
  colorSecondary?: boolean;
}

/** A button to show export status */
export default function DownloadButton(props: DownloadButtonProps) {
  const exportState = useSelector(
    (state: StoreState) => state.exportProjectState
  );
  const dispatch = useDispatch();
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileUrl, setFileUrl] = useState<string | undefined>();
  let downloadLink = createRef<HTMLAnchorElement>();

  useEffect(() => {
    if (downloadLink.current && fileUrl) {
      downloadLink.current.click();
      URL.revokeObjectURL(fileUrl);
      setFileUrl(undefined);
    }
  }, [downloadLink, fileUrl]);

  function makeExportName(projectName: string) {
    return `${projectName}_${getNowDateTimeString()}.zip`;
  }

  function download() {
    getProjectName(exportState.projectId).then((projectName) => {
      setFileName(makeExportName(projectName));
      asyncDownloadExport(exportState.projectId)(dispatch)
        .then((url) => {
          if (url) {
            setFileUrl(url);
            reset();
          }
        })
        .catch(console.error);
    });
  }

  function reset() {
    resetExport(exportState.projectId)(dispatch);
  }

  function textId(): string {
    switch (exportState.status) {
      case ExportStatus.InProgress:
        return "projectExport.exportInProgress";
      case ExportStatus.Success:
        return "projectExport.downloadReady";
      case ExportStatus.Failure:
        return "projectExport.exportFailed";
      default:
        throw new Error("Not implemented");
    }
  }

  function icon(): ReactElement {
    switch (exportState.status) {
      case ExportStatus.InProgress:
        return <Cached />;
      case ExportStatus.Success:
        return <GetApp />;
      case ExportStatus.Failure:
        return <ErrorIcon />;
      default:
        return <div />;
    }
  }

  function iconColor() {
    return exportState.status === ExportStatus.Failure
      ? themeColors.error
      : props.colorSecondary
      ? themeColors.secondary
      : themeColors.primary;
  }

  function iconFunction(): () => void {
    switch (exportState.status) {
      case ExportStatus.Success:
        return download;
      case ExportStatus.Failure:
        return reset;
      default:
        return () => {};
    }
  }

  return (
    <React.Fragment>
      {exportState.status !== ExportStatus.Default && (
        <Tooltip title={<Translate id={textId()} />} placement="bottom">
          <IconButton
            tabIndex={-1}
            onClick={iconFunction()}
            style={{ color: iconColor() }}
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
    </React.Fragment>
  );
}
