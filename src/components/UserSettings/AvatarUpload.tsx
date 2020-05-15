import React, { useState } from "react";
import { Typography, Grid } from "@material-ui/core";
import { Translate } from "react-localize-redux";
import { uploadAvatar } from "../../backend";
import FileInputButton from "../Buttons/FileInputButton";
import LoadingDoneButton from "../Buttons/LoadingDoneButton";
import { getCurrentUser } from "./UserSettings";

/**
 * Allows the current user to select an image and upload as their avatar
 */
export default function AvatarUpload(props: { doneCallback?: () => void }) {
  const [file, setFile] = useState<File>();
  const [filename, setFilename] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);

  function updateFile(file: File) {
    if (file) {
      const filename = file.name;
      setFile(file);
      setFilename(filename);
    }
  }

  function upload(e: React.FormEvent<EventTarget>) {
    e.preventDefault();
    const avatar = file;

    const user = getCurrentUser();

    if (avatar) {
      setLoading(true);
      uploadAvatar(user, avatar)
        .then(() => onDone())
        .catch(() => setLoading(false));
    }
  }

  function onDone() {
    setDone(true);
    setTimeout(() => {
      if (props.doneCallback) props.doneCallback();
    }, 500);
  }

  return (
    <form onSubmit={(e) => upload(e)}>
      {/* Displays the name of the selected file */}
      {filename && (
        <Typography variant="body1" noWrap>
          <Translate id="createProject.fileSelected" />: {filename}
        </Typography>
      )}
      <Grid container spacing={1} justify="flex-start">
        <Grid item>
          <FileInputButton
            updateFile={(file) => updateFile(file)}
            accept=".jpg"
          >
            <Translate id="createProject.browse" />
          </FileInputButton>
        </Grid>
        <Grid item>
          <LoadingDoneButton loading={loading} done={done} type="submit">
            Save
          </LoadingDoneButton>
        </Grid>
      </Grid>
    </form>
  );
}
