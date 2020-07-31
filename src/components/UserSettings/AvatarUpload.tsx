import React, { useState } from "react";
import { Grid, Typography } from "@material-ui/core";
import { Translate } from "react-localize-redux";

import { uploadAvatar, avatarSrc } from "../../backend";
import FileInputButton from "../Buttons/FileInputButton";
import LoadingDoneButton from "../Buttons/LoadingDoneButton";
import * as LocalStorage from "../../backend/localStorage";

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

  async function upload(e: React.FormEvent<EventTarget>) {
    e.preventDefault();
    const avatar = file;

    const user = LocalStorage.getCurrentUser()!;
    if (avatar) {
      setLoading(true);
      await uploadAvatar(user, avatar)
        .then(() => onDone())
        .catch(() => setLoading(false));
    }
  }

  async function onDone() {
    setDone(true);
    const user = LocalStorage.getCurrentUser()!;
    const avatar = await avatarSrc(user);
    LocalStorage.setAvatar(avatar);
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
