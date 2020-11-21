import { IconButton, Tooltip } from "@material-ui/core";
import { Cached, Error, GetApp } from "@material-ui/icons";
import React, { createRef, useEffect, useState } from "react";
import { Translate } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import { getProjectName } from "../../backend";
import { StoreState } from "../../types";
import { getNowDateTimeString } from "../../utilities";
import DeleteDialog from "../Buttons/DeleteDialog";
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
  const [fileName, setFileName] = useState<null | string>(null);
  const [fileUrl, setFileUrl] = useState<null | string>(null);
  const [dialog, setDialog] = useState<boolean>(false);
  let downloadLink = createRef<HTMLAnchorElement>();

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
    setDialog(false);
  }

  return (
    <React.Fragment>
      {/* Nothing shows if exportState.status === ExportStatus.Default. */}
      {exportState.status === ExportStatus.Success && (
        <Tooltip
          title={<Translate id="projectExport.downloadReady" />}
          placement="bottom"
        >
          <IconButton tabIndex={-1} onClick={download}>
            <GetApp />
          </IconButton>
        </Tooltip>
      )}
      {exportState.status === ExportStatus.InProgress && (
        <React.Fragment>
          <Tooltip
            title={<Translate id="projectExport.exportInProgress" />}
            placement="bottom"
          >
            <IconButton tabIndex={-1} onClick={() => setDialog(true)}>
              <Cached />
            </IconButton>
          </Tooltip>
          <DeleteDialog
            open={dialog}
            textId={"projectExport.cancelWarning"}
            handleAccept={reset}
            handleCancel={() => setDialog(false)}
          />
        </React.Fragment>
      )}
      {exportState.status === ExportStatus.Failure && (
        <Tooltip
          title={<Translate id="projectExport.exportFailed" />}
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
