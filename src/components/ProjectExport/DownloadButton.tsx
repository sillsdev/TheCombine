import { IconButton, Tooltip } from "@material-ui/core";
import { Cached, Error, GetApp } from "@material-ui/icons";
import React, { useEffect } from "react";
//import { Translate } from "react-localize-redux";
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
  const [received, setReceived] = React.useState<string>("");
  const [fileName, setFileName] = React.useState<null | string>(null);
  const [fileUrl, setFileUrl] = React.useState<null | string>(null);
  let downloadLink = React.createRef<HTMLAnchorElement>();

  useEffect(() => {
    setReceived(`export: ${exportState.status}`);
  }, [exportState]);

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
      .then((file) => {
        if (file) {
          setFileUrl(URL.createObjectURL(file));
          resetExport(exportState.projectId)(dispatch);
        }
      })
      .catch((err) => console.error(err));
  }

  return (
    <React.Fragment>
      {exportState.status !== ExportStatus.Default && (
        <Tooltip
          title={received} //<Translate id="appBar.downloadReady" />}
          placement="bottom"
        >
          <IconButton tabIndex={-1} onClick={download}>
            {exportState.status === ExportStatus.InProgress && <Cached />}
            {exportState.status === ExportStatus.Success && <GetApp />}
            {exportState.status === ExportStatus.Failure && <Error />}
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
