import { Grid, Typography } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { uploadAvatar } from "backend";
import { getUserId } from "backend/localStorage";
import { FileInputButton, LoadingDoneButton } from "components/Buttons";

interface AvatarUploadProps {
  doneCallback?: () => void;
}

/**
 * Allows the current user to select an image and upload as their avatar
 */
export default function AvatarUpload(props: AvatarUploadProps): ReactElement {
  const [file, setFile] = useState<File>();
  const [filename, setFilename] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);
  const { t } = useTranslation();

  function updateFile(file: File): void {
    if (file) {
      setFile(file);
      setFilename(file.name);
    }
  }

  async function upload(e: React.FormEvent<EventTarget>): Promise<void> {
    e.preventDefault();
    e.stopPropagation();
    if (file) {
      setLoading(true);
      await uploadAvatar(getUserId(), file)
        .then(onDone)
        .catch(() => setLoading(false));
    }
  }

  async function onDone(): Promise<void> {
    setDone(true);
    if (props.doneCallback) {
      setTimeout(props.doneCallback, 500);
    }
  }

  return (
    <form onSubmit={(e) => upload(e)}>
      {/* Displays the name of the selected file */}
      {filename && (
        <Typography variant="body1" noWrap>
          {t("createProject.fileSelected")}: {filename}
        </Typography>
      )}
      <Grid container spacing={1} justifyContent="flex-start">
        <Grid item>
          <FileInputButton
            updateFile={(file) => updateFile(file)}
            accept="image/*"
          >
            {t("buttons.browse")}
          </FileInputButton>
        </Grid>
        <Grid item>
          <LoadingDoneButton
            loading={loading}
            done={done}
            buttonProps={{ type: "submit", id: "avatar-upload-save" }}
          >
            {t("buttons.save")}
          </LoadingDoneButton>
        </Grid>
      </Grid>
    </form>
  );
}
