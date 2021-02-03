import { IconButton, Tooltip } from "@material-ui/core";
import { Cached, Error, GetApp } from "@material-ui/icons";
import React, { createRef, useEffect, useState } from "react";
import { Translate } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import { getProjectName } from "backend";
import { StoreState } from "types";
import { getNowDateTimeString } from "utilities";
import {
  asyncDownloadExport,
  ExportStatus,
  resetExport,
} from "components/ProjectExport/ExportProjectActions";

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

  function textId() {
    switch (exportState.status) {
      case ExportStatus.InProgress:
        return "projectExport.exportInProgress";
      case ExportStatus.Success:
        return "projectExport.downloadReady";
      case ExportStatus.Failure:
        return "projectExport.exportFailed";
    }
  }

  function icon() {
    switch (exportState.status) {
      case ExportStatus.InProgress:
        return <Cached />;
      case ExportStatus.Success:
        return <GetApp />;
      case ExportStatus.Failure:
        return <Error />;
    }
  }

  function iconFunction() {
    switch (exportState.status) {
      case ExportStatus.Success:
        return download;
      case ExportStatus.Failure:
        return reset;
    }
  }

  return (
    <React.Fragment>
      {exportState.status !== ExportStatus.Default && (
        <Tooltip title={<Translate id={textId()} />} placement="bottom">
          <IconButton
            tabIndex={-1}
            onClick={iconFunction()}
            color={props.colorSecondary ? "secondary" : "primary"}
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
