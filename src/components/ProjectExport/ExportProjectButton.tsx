import { ButtonProps } from "@material-ui/core/Button";
//import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React /*, { useEffect }*/ from "react";
import { Translate } from "react-localize-redux";

import { getProjectId } from "../../backend/localStorage";
import LoadingButton from "../Buttons/LoadingButton";
import DownloadButton from "./DownloadButton";
import { ExportStatus } from "./ExportProjectActions";
import { ExportProjectState } from "./ExportProjectReducer";

interface ExportProjectButtonProps {
  exportProject: (projectId: string) => void;
  exportResult: ExportProjectState;
  projectId?: string;
}

/**
 * Button for exporting project to lift file
 */
export default function ExportProjectButton(
  props: ButtonProps & ExportProjectButtonProps
) {
  /*const [connection, setConnection] = React.useState<null | HubConnection>(
    null
  );
  const [received, setReceived] = React.useState<string>("");*/

  const projId = props.projectId ?? getProjectId();
  const sameProject = projId === props.exportResult.projectId;
  // The export button will not be clickable if another export is underway
  const loading = [ExportStatus.InProgress, ExportStatus.Success].includes(
    props.exportResult.status
  );

  /*useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:5001/queue")
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
  }, []);*/

  function exportProj() {
    props.exportProject(projId);
  }

  /*useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected!");
          connection.on("ReceiveMessage", (user: string, message: string) => {
            setReceived(`${user}: ${message}`);
          });
        })
        .catch((e: any) => console.log("Connection failed: ", e));
    }
  }, [connection]);*/

  /*async function sendMessage(user: string, message: string) {
    //const chatMessage = { user, message };
    if (connection) {
      try {
        await connection.send("SendMessage", user, message);
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("No connection to server yet.");
    }
  }*/

  return (
    <React.Fragment>
      <LoadingButton
        onClick={exportProj}
        color="primary"
        loading={loading}
        {...props}
      >
        <Translate id="buttons.export" />
      </LoadingButton>
      {sameProject && <DownloadButton />}
    </React.Fragment>
  );
}
