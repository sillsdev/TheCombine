import { Button, Grid, TextField } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { ProjectSettingPropsWithUpdate } from "components/ProjectSettings/ProjectSettingsTypes";

export default function ProjectName(
  props: ProjectSettingPropsWithUpdate
): ReactElement {
  const [projName, setProjName] = useState(props.project.name);
  const { t } = useTranslation();

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
          onBlur={() => updateProjectName()}
        />
      </Grid>
      <Grid item>
        <Button
          // No onClick necessary, as name updates on blur away from TextField.
          variant="contained"
          color="primary"
          id="project-name-save"
        >
          {t("buttons.save")}
        </Button>
      </Grid>
    </Grid>
  );
}
