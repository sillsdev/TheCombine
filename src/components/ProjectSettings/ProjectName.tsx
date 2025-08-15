import { Button, Stack } from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";
import { NormalizedTextField } from "utilities/fontComponents";

export default function ProjectName(props: ProjectSettingProps): ReactElement {
  const [projName, setProjName] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    setProjName(props.project.name);
  }, [props.project.name]);

  const updateProjectName = async (): Promise<void> => {
    const name = projName.trim();
    if (name !== props.project.name) {
      await props.setProject({ ...props.project, name }).catch(() => {
        toast.error(t("projectSettings.nameUpdateFailed"));
      });
    }
  };

  return (
    <Stack alignItems="flex-start" spacing={1}>
      <NormalizedTextField
        variant="standard"
        id="project-name"
        value={projName}
        onChange={(e) => setProjName(e.target.value)}
        onBlur={() => setProjName(props.project.name)}
      />
      <Button
        variant="contained"
        color="primary"
        id="project-name-save"
        onClick={() => updateProjectName()}
        onMouseDown={(e) => e.preventDefault()}
      >
        {t("buttons.save")}
      </Button>
    </Stack>
  );
}
