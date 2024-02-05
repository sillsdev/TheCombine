import { Button, Grid, TextField } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { ProjectSettingPropsWithUpdate } from "components/ProjectSettings/ProjectSettingsTypes";

export default function ProjectName(
  props: ProjectSettingPropsWithUpdate
): ReactElement {
  const [projName, setProjName] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    setProjName(props.project.name);
  }, [props.project.name]);

  const updateProjectName = async (): Promise<void> => {
    if (projName !== props.project.name) {
      await props
        .updateProject({ ...props.project, name: projName })
        .catch(() => {
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
