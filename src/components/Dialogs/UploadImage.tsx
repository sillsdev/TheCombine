import { Grid2, Typography } from "@mui/material";
import { FormEvent, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import FileInputButton from "components/Buttons/FileInputButton";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";

interface ImageUploadProps {
  doneCallback?: () => void;
  uploadImage: (imgFile: File) => Promise<void>;
}

/**
 * Allows the current user to select an image and upload it
 */
export default function ImageUpload(props: ImageUploadProps): ReactElement {
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

  async function upload(e: FormEvent<EventTarget>): Promise<void> {
    e.preventDefault();
    e.stopPropagation();
    if (file) {
      setLoading(true);
      await props
        .uploadImage(file)
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
          {t("createProject.fileSelected", { val: filename })}
        </Typography>
      )}

      <Grid2 container spacing={1} justifyContent="flex-start">
        <FileInputButton
          updateFile={(file) => updateFile(file)}
          accept="image/*"
        >
          {t("buttons.browse")}
        </FileInputButton>

        <LoadingDoneButton
          loading={loading}
          done={done}
          buttonProps={{ type: "submit", id: "image-upload-save" }}
        >
          {t("buttons.save")}
        </LoadingDoneButton>
      </Grid2>
    </form>
  );
}
