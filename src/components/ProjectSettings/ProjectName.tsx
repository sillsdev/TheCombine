import { Button, Grid, TextField } from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";

export default function ProjectName(props: ProjectSettingProps): ReactElement {
  const [projName, setProjName] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    setProjName(props.project.name);
  }, [props.project.name]);

  const updateProjectName = async (): Promise<void> => {
    const name = projName.trim().normalize("NFC");
    if (name !== props.project.name) {
      await props.setProject({ ...props.project, name }).catch(() => {
        toast.error(t("projectSettings.nameUpdateFailed"));
      });
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <TextField
          variant="standard"
          id="project-name"
          value={projName}
          onChange={(e) => setProjName(e.target.value)}
          onBlur={() => setProjName(props.project.name)}
        />
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          id="project-name-save"
          onClick={() => updateProjectName()}
          onMouseDown={(e) => e.preventDefault()}
        >
          {t("buttons.save")}
        </Button>
      </Grid>
    </Grid>
  );
}
