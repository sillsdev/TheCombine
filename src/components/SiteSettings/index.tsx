import { Announcement, List, People } from "@mui/icons-material";
import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import {
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { clearCurrentProject } from "components/Project/ProjectActions";
import Banners from "components/SiteSettings/Banners";
import ProjectManagement from "components/SiteSettings/ProjectManagement";
import UserManagement from "components/SiteSettings/UserManagement";
import { useAppDispatch } from "rootRedux/hooks";

export const enum SiteSettingsTab {
  Projects,
  Users,
  Banners,
}

export default function SiteSettings(): ReactElement {
  const dispatch = useAppDispatch();

  const [tab, setTab] = useState(SiteSettingsTab.Projects);

  useEffect(() => dispatch(clearCurrentProject()), [dispatch]);

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
              <TabLabel icon={<List />} textId="siteSettings.projectList" />
            }
            value={SiteSettingsTab.Projects}
          />
          <Tab
            data-testid={SiteSettingsTab.Users}
            id={SiteSettingsTab.Users.toString()}
            label={
              <TabLabel icon={<People />} textId="siteSettings.userList" />
            }
            value={SiteSettingsTab.Users}
          />
          <Tab
            data-testid={SiteSettingsTab.Banners}
            id={SiteSettingsTab.Banners.toString()}
            label={
              <TabLabel
                icon={<Announcement />}
                textId="siteSettings.banners.title"
              />
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

interface TabLabelProps {
  icon: ReactElement;
  textId: string;
}

function TabLabel(props: TabLabelProps): ReactElement {
  const { t } = useTranslation();
  return (
    <Stack direction="row">
      {props.icon}
      <Typography>{t(props.textId)}</Typography>
    </Stack>
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
