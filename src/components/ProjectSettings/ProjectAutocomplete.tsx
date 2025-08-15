import { HelpOutline } from "@mui/icons-material";
import { MenuItem, Select, Stack, Tooltip } from "@mui/material";
import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { OffOnSetting } from "api/models";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";

export enum ProjectAutocompleteTextId {
  MenuItemOff = "projectSettings.autocomplete.off",
  MenuItemOn = "projectSettings.autocomplete.on",
  Tooltip = "projectSettings.autocomplete.hint",
}

export default function ProjectAutocomplete(
  props: ProjectSettingProps
): ReactElement {
  const { t } = useTranslation();

  const updateAutocompleteSetting = async (
    autocompleteSetting: OffOnSetting
  ): Promise<void> => {
    await props.setProject({ ...props.project, autocompleteSetting });
  };

  return (
    <Stack direction="row">
      <Select
        variant="standard"
        value={props.project.autocompleteSetting}
        onChange={(e) =>
          updateAutocompleteSetting(e.target.value as OffOnSetting)
        }
      >
        <MenuItem value={OffOnSetting.Off}>
          {t(ProjectAutocompleteTextId.MenuItemOff)}
        </MenuItem>
        <MenuItem value={OffOnSetting.On}>
          {t(ProjectAutocompleteTextId.MenuItemOn)}
        </MenuItem>
      </Select>

      <Tooltip
        title={t(ProjectAutocompleteTextId.Tooltip)}
        placement={document.body.dir === "rtl" ? "left" : "right"}
      >
        <HelpOutline fontSize="small" />
      </Tooltip>
    </Stack>
  );
}
