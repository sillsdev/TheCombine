import { Typography } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import React, { useEffect } from "react";
import { Translate } from "react-localize-redux";

import { exportLift, getProjectName } from "../../../backend";
import { getUserId } from "../../../backend/localStorage";
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
  const [connection, setConnection] = React.useState<null | HubConnection>(
    null
  );
  const [received, setReceived] = React.useState<string>("");

  const [fileName, setFileName] = React.useState<null | string>(null);
  const [fileUrl, setFileUrl] = React.useState<null | string>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  let downloadLink = React.createRef<HTMLAnchorElement>();

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:5001/queue")
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
  }, []);

  async function getFile() {
    setLoading(true);
    const projectName = await getProjectName(props.projectId);
    sendMessage(getUserId(), projectName);
    setFileName(`${projectName}_${getNowDateTimeString()}`);
    const fileString = await exportLift(props.projectId);
    const file = await fetch(fileString).then(async (res) => res.blob());
    setFileUrl(URL.createObjectURL(file));
    setLoading(false);
  }

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected!");
          connection.on("ReceiveMessage", (user: string, message: string) => {
            setReceived(`${user}: ${message}`);
          });
        })
        .catch((e) => console.log("Connection failed: ", e));
    }
  }, [connection]);

  async function sendMessage (user: string, message: string) {
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
  }

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
      {received && <Typography>{received}</Typography>}
    </React.Fragment>
  );
}
