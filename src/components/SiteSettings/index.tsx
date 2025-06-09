import { Announcement, List, People } from "@mui/icons-material";
import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import {
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import Banners from "components/SiteSettings/Banners";
import ProjectManagement from "components/SiteSettings/ProjectManagement";
import UserManagement from "components/SiteSettings/UserManagement";

export const enum SiteSettingsTab {
  Projects,
  Users,
  Banners,
}

export default function SiteSettings(): ReactElement {
  const { t } = useTranslation();

  const [tab, setTab] = useState(SiteSettingsTab.Projects);

  const handleChange = (_e: SyntheticEvent, val: SiteSettingsTab): void =>
    setTab(val);

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs onChange={handleChange} value={tab}>
          <Tab
            data-testid={SiteSettingsTab.Projects}
            id={SiteSettingsTab.Projects.toString()}
            label={
              <Stack direction="row">
                <List />
                <Typography>{t("siteSettings.projectList")}</Typography>
              </Stack>
            }
            value={SiteSettingsTab.Projects}
          />
          <Tab
            data-testid={SiteSettingsTab.Users}
            id={SiteSettingsTab.Users.toString()}
            label={
              <Stack direction="row">
                <People />
                <Typography>{t("siteSettings.userList")}</Typography>
              </Stack>
            }
            value={SiteSettingsTab.Users}
          />
          <Tab
            data-testid={SiteSettingsTab.Banners}
            id={SiteSettingsTab.Banners.toString()}
            label={
              <Stack direction="row">
                <Announcement />
                <Typography>{t("siteSettings.banners.title")}</Typography>
              </Stack>
            }
            value={SiteSettingsTab.Banners}
          />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={SiteSettingsTab.Projects}>
        <ProjectManagement />
      </TabPanel>
      <TabPanel value={tab} index={SiteSettingsTab.Users}>
        <UserManagement />
      </TabPanel>
      <TabPanel value={tab} index={SiteSettingsTab.Banners}>
        <Banners />
      </TabPanel>
    </>
  );
}

interface TabPanelProps {
  children?: ReactNode;
  index: SiteSettingsTab;
  value: SiteSettingsTab;
}

function TabPanel(props: TabPanelProps): ReactElement {
  const { children, index, value } = props;
  return (
    <div hidden={value !== index} id={`tab-panel-${index}`} role={"tabpanel"}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}
