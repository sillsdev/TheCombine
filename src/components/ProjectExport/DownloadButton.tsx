import { IconButton, Tooltip } from "@material-ui/core";
import { Cached, Error, GetApp } from "@material-ui/icons";
import React, { useEffect } from "react";
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
  const [fileName, setFileName] = React.useState<null | string>(null);
  const [fileUrl, setFileUrl] = React.useState<null | string>(null);
  let downloadLink = React.createRef<HTMLAnchorElement>();

  useEffect(() => {
    if (downloadLink.current && fileUrl !== null) {
      downloadLink.current.click();
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  }, [downloadLink, fileUrl]);

  async function download() {
    const projectName = await getProjectName(exportState.projectId);
    setFileName(`${projectName}_${getNowDateTimeString()}.zip`);
    asyncDownloadExport(exportState.projectId)(dispatch)
      .then((fileUrl) => {
        if (fileUrl) {
          setFileUrl(fileUrl);
          reset();
        }
      })
      .catch((err) => console.error(err));
  }

  function reset() {
    resetExport(exportState.projectId)(dispatch);
  }

  return (
    <React.Fragment>
      {/* Nothing shows if exportState.status === ExportStatus.Default. */}
      {exportState.status === ExportStatus.Success && (
        <Tooltip
          title={<Translate id="appBar.downloadReady" />}
          placement="bottom"
        >
          <IconButton tabIndex={-1} onClick={download}>
            <GetApp />
          </IconButton>
        </Tooltip>
      )}
      {exportState.status === ExportStatus.InProgress && (
        <Tooltip
          title={<Translate id="appBar.exportInProgress" />}
          placement="bottom"
        >
          <IconButton tabIndex={-1}>
            <Cached />
          </IconButton>
        </Tooltip>
      )}
      {exportState.status === ExportStatus.Failure && (
        <Tooltip
          title={<Translate id="appBar.exportFailed" />}
          placement="bottom"
        >
          <IconButton tabIndex={-1} onClick={reset}>
            <Error />
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
