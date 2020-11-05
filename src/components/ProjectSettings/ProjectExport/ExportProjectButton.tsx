import { ButtonProps } from "@material-ui/core/Button";
import React, { useEffect } from "react";
import { Translate } from "react-localize-redux";

import { exportLift, getProjectName } from "../../../backend";
import { getNowDateTimeString } from "../../../utilities";
import LoadingButton from "../../Buttons/LoadingButton";

interface ExportProjectButtonProps {
  projectId?: string;
}

/**
 * Button for getting lift export from backend
 */
export default function ExportProjectButton(
  props: ButtonProps & ExportProjectButtonProps
) {
  const [fileName, setFileName] = React.useState<null | string>(null);
  const [fileUrl, setFileUrl] = React.useState<null | string>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  let downloadLink = React.createRef<HTMLAnchorElement>();

  async function getFile() {
    setLoading(true);
    const projectName = await getProjectName(props.projectId);
    setFileName(`${projectName}_${getNowDateTimeString()}`);
    const fileString = await exportLift(props.projectId);
    const file = await fetch(fileString).then(async (res) => res.blob());
    setFileUrl(URL.createObjectURL(file));
    setLoading(false);
  }

  useEffect(() => {
    if (downloadLink.current && fileUrl !== null) {
      downloadLink.current.click();
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  }, [downloadLink, fileUrl]);

  return (
    <React.Fragment>
      <LoadingButton
        onClick={getFile}
        color="primary"
        loading={loading}
        {...props}
      >
        <Translate id="buttons.export" />
      </LoadingButton>
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
