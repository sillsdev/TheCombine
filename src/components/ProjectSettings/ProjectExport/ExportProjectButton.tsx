import React, { useEffect } from "react";
import { exportLift } from "../../../backend";
import LoadingButton from "../../UserSettings/LoadingButton";
import { ButtonProps } from "@material-ui/core/Button";
import { Translate } from "react-localize-redux";

/**
 * Button for getting lift export from backend
 */
export default function ExportProjectButton(props: ButtonProps) {
  const [exportedFile, setExportedFile] = React.useState<null | string>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  let downloadLink = React.createRef<HTMLAnchorElement>();

  async function getFile() {
    setLoading(true);
    setExportedFile(await exportLift());
    setLoading(false);
  }

  useEffect(() => {
    if (downloadLink.current && exportedFile !== null) {
      downloadLink.current.click();
      setExportedFile(null);
    }
  });

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
