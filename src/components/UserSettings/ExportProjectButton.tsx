import React from "react";
import { Button } from "@material-ui/core";
import { exportLift } from "../../backend";

/**
 * Page to edit user profile
 */
export default function ExportProjectButton() {
  const [file, setFile] = React.useState<null | string>(null);
  async function getFile() {
    setFile(await exportLift());
  }

  getFile();
  return (
    <React.Fragment>
      <Button variant="contained">Export Project</Button>
      {file && <a href={file}>Here is your file</a>}
    </React.Fragment>
  );
}
