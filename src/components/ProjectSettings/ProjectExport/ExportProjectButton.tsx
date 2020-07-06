import { ButtonProps } from "@material-ui/core/Button";
import React, { useEffect } from "react";
import { Translate } from "react-localize-redux";
import { exportLift } from "../../../backend";
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
  const [exportedFile, setExportedFile] = React.useState<null | string>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  let downloadLink = React.createRef<HTMLAnchorElement>();

  async function getFile() {
    setLoading(true);
    props.projectId
      ? setExportedFile(await exportLift(props.projectId))
      : setExportedFile(await exportLift());
    setLoading(false);
  }

  useEffect(() => {
    if (downloadLink.current && exportedFile !== null) {
      downloadLink.current.click();
      setExportedFile(null);
    }
  }, [downloadLink, exportedFile]);

  return (
    <React.Fragment>
      <LoadingButton
        onClick={() => getFile()}
        color="primary"
        loading={loading}
        {...props}
      >
        <Translate id="projectSettings.export" />
      </LoadingButton>
      {exportedFile && (
        <a ref={downloadLink} href={exportedFile} style={{ display: "none" }}>
          (This link should not be visible)
        </a>
      )}
    </React.Fragment>
  );
}
