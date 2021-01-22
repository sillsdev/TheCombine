import { Grid, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";

import { avatarSrc, uploadAvatar } from "backend";
import { getUserId, setAvatar } from "backend/localStorage";
import FileInputButton from "components/Buttons/FileInputButton";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";

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
      const filename: string = file.name;
      setFile(file);
      setFilename(filename);
    }
  }

  async function upload(e: React.FormEvent<EventTarget>) {
    e.preventDefault();
    const avatar: File | undefined = file;
    if (avatar) {
      setLoading(true);
      const userId: string = getUserId();
      await uploadAvatar(userId, avatar)
        .then(() => onDone())
        .catch(() => setLoading(false));
    }
  }

  async function onDone() {
    setDone(true);
    const userId: string = getUserId();
    const avatar: string = await avatarSrc(userId);
    setAvatar(avatar);
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
            accept="image/*"
          >
            <Translate id="buttons.browse" />
          </FileInputButton>
        </Grid>
        <Grid item>
          <LoadingDoneButton
            loading={loading}
            done={done}
            buttonProps={{ type: "submit" }}
          >
            <Translate id="buttons.save" />
          </LoadingDoneButton>
        </Grid>
      </Grid>
    </form>
  );
}
