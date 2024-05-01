import { Add, Check, Close } from "@mui/icons-material";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
  WritingSystem,
  type SemanticDomain,
  type SemanticDomainFull,
} from "api";
import { IconButtonWithTooltip } from "components/Buttons";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";
import TreeView from "components/TreeView";
import { newSemanticDomain } from "types/semanticDomain";
import { semDomWritingSystems } from "types/writingSystem";
import { TextFieldWithFont } from "utilities/fontComponents";

interface GroupedDomain {
  [language: string]: SemanticDomainFull;
}

interface GroupedDomains {
  [id: string]: GroupedDomain;
}

function groupDomains(domains: SemanticDomainFull[]): GroupedDomains {
  const groups: GroupedDomains = {};
  domains.forEach((d) => {
    if (!(d.id in groups)) {
      groups[d.id] = {};
    }
    groups[d.id][d.lang] = d;
  });
  return groups;
}

export default function ProjectDomains(
  props: ProjectSettingProps
): ReactElement {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [domains, setDomains] = useState<GroupedDomains>({});
  const [projectWritingSystems, setProjectWritingSystems] = useState<
    WritingSystem[]
  >([]);

  useEffect(() => {
    setDomains(groupDomains(props.project.semanticDomains));
  }, [props.project.semanticDomains]);

  useEffect(() => {
    setProjectWritingSystems([
      props.project.vernacularWritingSystem,
      ...props.project.analysisWritingSystems,
    ]);
  }, [
    props.project.vernacularWritingSystem,
    props.project.analysisWritingSystems,
  ]);

  const addDomain = (domain?: SemanticDomainFull): boolean => {
    if (!domain) {
      setAddDialogOpen(false);
      return true;
    }

    if (domain.id in domains) {
      return false;
    }

    props.setProject({
      ...props.project,
      semanticDomains: [...props.project.semanticDomains, domain],
    });
    return true;
  };

  return (
    <Stack spacing={1}>
      {Object.keys(domains)
        .sort()
        .map((id) => (
          <CustomDomain domain={domains[id]} id={id} key={id} />
        ))}
      <Box>
        <IconButtonWithTooltip
          icon={<Add />}
          onClick={() => setAddDialogOpen(true)}
          textId="projectSettings.domains.add"
        />
        <AddDomainDialog
          onSubmit={addDomain}
          open={addDialogOpen}
          projectWritingSystems={projectWritingSystems}
        />
      </Box>
    </Stack>
  );
}

interface CustomDomainProps {
  domain: GroupedDomain;
  id: string;
}

function CustomDomain(props: CustomDomainProps): ReactElement {
  return (
    <>
      <Typography>{props.id}</Typography>
    </>
  );
}

interface AddDomainDialogProps {
  onSubmit: (domain?: SemanticDomainFull) => boolean;
  open: boolean;
  projectWritingSystems: WritingSystem[];
}

function AddDomainDialog(props: AddDomainDialogProps): ReactElement {
  const [addingDom, setAddingDom] = useState(false);
  const [lang, setLang] = useState("");
  const [langOptions, setLangOptions] = useState<WritingSystem[]>([]);
  const [name, setName] = useState("");
  const [parent, setParent] = useState<SemanticDomain | undefined>();

  const { t } = useTranslation();

  useEffect(() => {
    const langs = [...semDomWritingSystems];
    for (const ws of props.projectWritingSystems) {
      if (!ws.bcp47) {
        continue;
      }
      const bcp47 = ws.bcp47.split("-")[0];
      if (!langs.some((ws) => ws.bcp47 === bcp47)) {
        langs.push({ ...ws, bcp47 });
      }
    }
    langs.sort((a, b) => a.bcp47.localeCompare(b.bcp47));
    setLangOptions(langs);
  }, [props.projectWritingSystems]);

  const addParent = (domain?: SemanticDomain): void => {
    setAddingDom(false);
    setParent(domain);
    if (domain) {
      setLang(domain.lang);
    }
  };

  const cancel = (): void => {
    props.onSubmit();
    setLang("");
    setName("");
    setParent(undefined);
  };

  const submit = (): void => {
    if (!name.trim()) {
      toast.error("Please enter a name for the custom domain.");
      return;
    }

    const id = parent ? `${parent.id}.0` : "0";
    const domain = newSemanticDomain(id, name.trim(), lang);
    if (!props.onSubmit(domain)) {
      toast.error("The selected parent domain already has a custom subdomain.");
    }
  };

  const langSelect = (): ReactElement => (
    <Select
      variant="standard"
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      /* Use `displayEmpty` and a conditional `renderValue` function to force
       * something to appear when the menu is closed and its value is "" */
      displayEmpty
      renderValue={
        lang ? undefined : () => t("projectSettings.domains.selectLanguage")
      }
    >
      {langOptions.map((ws) => (
        <MenuItem key={ws.bcp47} value={ws.bcp47}>
          {`${ws.bcp47} (${ws.name})`}
        </MenuItem>
      ))}
    </Select>
  );

  return (
    <Dialog open={props.open}>
      <DialogTitle>
        <Grid container justifyContent="space-between">
          <Grid item>{t("projectSettings.domains.add")}</Grid>
          <Grid item>
            <IconButton onClick={() => submit()}>
              <Check sx={{ color: (t) => t.palette.success.main }} />
            </IconButton>
            <IconButton onClick={() => cancel()}>
              <Close sx={{ color: (t) => t.palette.error.main }} />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Box>
            <Typography display="inline">
              {t("projectSettings.domains.parent")}
            </Typography>
            {parent ? (
              <Chip
                id={parent.id}
                label={`${parent.id}: ${parent.name}`}
                onDelete={() => setParent(undefined)}
              />
            ) : (
              <IconButton onClick={() => setAddingDom(true)}>
                <Add />
              </IconButton>
            )}
            <Dialog fullScreen open={addingDom}>
              <TreeView
                exit={() => setAddingDom(false)}
                returnControlToCaller={addParent}
              />
            </Dialog>
          </Box>
          <Box>
            <Typography display="inline">
              {t("projectSettings.domains.language")}
            </Typography>
            {langSelect()}
          </Box>
          <Box>
            <Typography display="inline">
              {t("projectSettings.domains.name")}
            </Typography>
            <TextFieldWithFont
              analysis
              lang={lang}
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
