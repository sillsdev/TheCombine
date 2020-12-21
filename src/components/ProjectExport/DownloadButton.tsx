import { IconButton, Tooltip } from "@material-ui/core";
import { Cached, Error, GetApp } from "@material-ui/icons";
import React, { createRef, useEffect, useState } from "react";
import { Translate } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import { getProjectName } from "../../backend";
import { StoreState } from "../../types";
import { getNowDateTimeString } from "../../utilities";
import {
  asyncDownloadExport,
  ExportStatus,
  resetExport,
} from "./ExportProjectActions";

/** A button to show export status */
export default function DownloadButton() {
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

  async function download() {
    const projectName = await getProjectName(exportState.projectId);
    setFileName(`${projectName}_${getNowDateTimeString()}.zip`);
    asyncDownloadExport(exportState.projectId)(dispatch)
      .then((url) => {
        if (url) {
          setFileUrl(url);
          reset();
        }
      })
      .catch((err) => console.error(err));
  }

  function reset() {
    resetExport(exportState.projectId)(dispatch);
  }

  function icon() {
    switch (exportState.status) {
      case ExportStatus.Success:
        return (
          <IconButton tabIndex={-1} onClick={download}>
            <GetApp />
          </IconButton>
        );
      case ExportStatus.Failure:
        return (
          <IconButton tabIndex={-1} onClick={reset}>
            <Error />
          </IconButton>
        );
      default:
        return (
          <IconButton tabIndex={-1}>
            <Cached />
          </IconButton>
        );
    }
  }

  function textId() {
    switch (exportState.status) {
      case ExportStatus.Success:
        return "projectExport.downloadInProgress";
      case ExportStatus.Failure:
        return "projectExport.exportFailed";
      case ExportStatus.InProgress:
        return "projectExport.exportInProgress";
    }
  }

  return (
    <React.Fragment>
      {exportState.status !== ExportStatus.Default && (
        <Tooltip title={<Translate id={textId()} />} placement="bottom">
          {icon()}
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
