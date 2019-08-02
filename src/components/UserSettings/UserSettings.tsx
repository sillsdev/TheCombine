import React, { useState } from "react";
import { Button, Typography } from "@material-ui/core";
import { Translate } from "react-localize-redux";
import { uploadAvatar } from "../../backend";
import { User } from "../../types/user";
import ExportProjectButton from "./ExportProjectButton";

/**
 * Page to edit user profile
 */
export default function UserSettings() {
  const [file, setFile] = useState<File>();
  const [filename, setFilename] = useState<string>();

  function updateFile(files: FileList) {
    const file = files[0];
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
      uploadAvatar(user, avatar);
    }
  }

  return (
    <form onSubmit={e => upload(e)}>
      {/* The actual file input element is hidden... */}
      <input
        id="file-input"
        type="file"
        name="name"
        accept=".jpg"
        onChange={e => updateFile(e.target.files as FileList)}
        style={{ display: "none" }}
      />
      {/* ... and this button is tied to it with the htmlFor property */}
      <label
        htmlFor="file-input"
        style={{
          cursor: "pointer"
        }}
      >
        <Button variant="contained" component="span">
          <Translate id="createProject.browse" />
        </Button>
      </label>

      {/* Displays the name of the selected file */}
      {filename && (
        <Typography variant="body1" noWrap style={{ marginTop: 30 }}>
          <Translate id="createProject.fileSelected" />: {filename}
        </Typography>
      )}
      <Button type="submit" variant="contained">
        Save
      </Button>

      <ExportProjectButton />
    </form>
  );
}

export function getCurrentUser(): User {
  const userString = localStorage.getItem("user");
  return userString ? JSON.parse(userString) : null;
}
