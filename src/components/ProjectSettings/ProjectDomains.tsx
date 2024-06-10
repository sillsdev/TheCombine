import { Add, Check, Close, Delete } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { type SemanticDomain, type SemanticDomainFull } from "api";
import { IconButtonWithTooltip } from "components/Buttons";
import { CancelConfirmDialog } from "components/Dialogs";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";
import TreeView from "components/TreeView";
import i18n from "i18n";
import { newSemanticDomain } from "types/semanticDomain";
import { TextFieldWithFont } from "utilities/fontComponents";

const trimDomain = (domain: SemanticDomainFull): SemanticDomainFull => ({
  ...domain,
  description: domain.description.trim(),
  name: domain.name.trim(),
  questions: domain.questions.map((q) => q.trim()).filter((q) => q),
});

export default function ProjectDomains(
  props: ProjectSettingProps
): ReactElement {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [domains, setDomains] = useState<SemanticDomainFull[]>([]);
  const [lang, setLang] = useState("");

  useEffect(() => {
    console.info(i18n.language);
    setLang(
      props.project.semDomWritingSystem.bcp47 || i18n.language.split("-")[0]
    );
  }, [props.project.semDomWritingSystem.bcp47]);

  useEffect(() => {
    setDomains(
      props.project.semanticDomains
        .filter((d) => d.lang === lang)
        .sort((a, b) => a.id.localeCompare(b.id))
    );
  }, [lang, props.project.semanticDomains]);

  const addDomain = (domain?: SemanticDomainFull): boolean => {
    if (!domain) {
      setAddDialogOpen(false);
      return true;
    }

    if (domains.some((d) => d.id === domain.id && d.lang === domain.lang)) {
      return false;
    }

    props.setProject({
      ...props.project,
      semanticDomains: [...props.project.semanticDomains, domain],
    });
    return true;
  };

  const updateDomains = (
    updateFunction: (doms: SemanticDomainFull[]) => SemanticDomainFull[]
  ): void => {
    props.setProject({
      ...props.project,
      semanticDomains: updateFunction(props.project.semanticDomains),
    });
  };

  return (
    <Stack spacing={1}>
      {domains.map((d) => (
        <CustomDomain domain={d} key={d.id} updateDomains={updateDomains} />
      ))}
      <Box>
        <IconButtonWithTooltip
          icon={<Add />}
          onClick={() => setAddDialogOpen(true)}
          textId="projectSettings.domains.add"
        />
        <AddDomainDialog
          lang={lang}
          onSubmit={addDomain}
          open={addDialogOpen}
        />
      </Box>
    </Stack>
  );
}

interface CustomDomainProps {
  domain: SemanticDomainFull;
  updateDomains: (
    updateFunction: (doms: SemanticDomainFull[]) => SemanticDomainFull[]
  ) => void;
}

function CustomDomain(props: CustomDomainProps): ReactElement {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [domain, setDomain] = useState(props.domain);

  const { t } = useTranslation();

  useEffect(() => {
    setDomain(trimDomain(props.domain));
  }, [props.domain]);

  const deleteDomain = (): void =>
    props.updateDomains((doms) =>
      doms.filter(
        (d) => !(d.id === props.domain.id && d.lang === props.domain.lang)
      )
    );

  const updateDomain = (domain: SemanticDomainFull): void =>
    props.updateDomains((doms) =>
      doms.map((d) =>
        d.id === domain.id && d.lang === domain.lang ? domain : d
      )
    );

  const updateName = (name: string): void => {
    setDomain((prev) => ({ ...prev, name }));
  };
  const updateDescription = (description: string): void => {
    setDomain((prev) => ({ ...prev, description }));
  };
  const addQuestion = (): void => {
    setDomain((prev) => ({ ...prev, questions: [...prev.questions, ""] }));
  };
  const updateQuestion = (index: number, question: string): void => {
    setDomain((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? question : q)),
    }));
  };

  const isDomainChanged = (): boolean => {
    const dom = trimDomain(domain);
    const old = trimDomain(props.domain);
    return !(
      dom.name === old.name &&
      dom.description === old.description &&
      dom.questions.length === old.questions.length &&
      dom.questions.every((q, i) => q === old.questions[i])
    );
  };

  const saveChanges = (): void => {
    const dom = trimDomain(domain);
    if (!(dom.name || dom.description || dom.questions.length)) {
      deleteDomain();
    } else {
      updateDomain(dom);
    }
  };

  return (
    <Accordion>
      <AccordionSummary>
        <Typography sx={{ width: "calc(100% - 40px)" }}>
          {props.domain.id}
          {" : "}
          {props.domain.name}
        </Typography>
        <IconButtonWithTooltip
          icon={<Delete />}
          onClick={() => setDeleteDialogOpen(true)}
          size="small"
        />
        <CancelConfirmDialog
          handleCancel={() => setDeleteDialogOpen(false)}
          handleConfirm={() => deleteDomain()}
          open={deleteDialogOpen}
          text={"Are you sure you want to delete this custom domain?"}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          <Box>
            <Typography display="inline">
              {t("projectSettings.domains.name")}
            </Typography>
            <TextFieldWithFont
              analysis
              lang={props.domain.lang}
              onChange={(e) => updateName(e.target.value)}
              value={domain.name}
            />
          </Box>
          <Box>
            <Typography display="inline">
              {t("projectSettings.domains.description")}
            </Typography>
            <TextFieldWithFont
              analysis
              lang={props.domain.lang}
              multiline
              onChange={(e) => updateDescription(e.target.value)}
              value={domain.description}
            />
          </Box>
          <Box>
            <Typography>{t("projectSettings.domains.questions")}</Typography>
            {domain.questions.map((q, i) => (
              <TextFieldWithFont
                analysis
                key={i}
                lang={props.domain.lang}
                multiline
                onChange={(e) => updateQuestion(i, e.target.value)}
                sx={{ display: "block" }}
                value={q}
              />
            ))}
            <IconButtonWithTooltip
              icon={<Add />}
              onClick={() => addQuestion()}
            />
          </Box>
          {isDomainChanged() ? (
            <Button onClick={() => saveChanges()}>{t("buttons.save")}</Button>
          ) : null}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

interface AddDomainDialogProps {
  lang: string;
  onSubmit: (domain?: SemanticDomainFull) => boolean;
  open: boolean;
}

function AddDomainDialog(props: AddDomainDialogProps): ReactElement {
  const [addingDom, setAddingDom] = useState(false);
  const [name, setName] = useState("");
  const [parent, setParent] = useState<SemanticDomain | undefined>();

  const { t } = useTranslation();

  const addParent = (domain?: SemanticDomain): void => {
    setAddingDom(false);
    setParent(domain);
  };

  const cancel = (): void => {
    props.onSubmit();
    setName("");
    setParent(undefined);
  };

  const submit = (): void => {
    if (!name.trim()) {
      toast.error("Please enter a name for the custom domain.");
      return;
    }

    const id = parent ? `${parent.id}.0` : "0";
    const domain = newSemanticDomain(id, name.trim(), props.lang);
    if (!props.onSubmit(domain)) {
      toast.error("The selected parent domain already has a custom subdomain.");
    } else {
      cancel();
    }
  };

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
              {t("projectSettings.domains.name")}
            </Typography>
            <TextFieldWithFont
              analysis
              lang={props.lang}
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
