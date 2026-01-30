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
  Grid2,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { type SemanticDomain, type SemanticDomainFull } from "api";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import CancelConfirmDialog from "components/Dialogs/CancelConfirmDialog";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";
import TreeView from "components/TreeView";
import i18n from "i18n";
import { newSemanticDomain } from "types/semanticDomain";
import { TextFieldWithFont } from "utilities/fontComponents";

export enum ProjectDomainsId {
  ButtonDomainAdd = "custom-domain-add",
  ButtonDomainAddDialogCancel = "custom-domain-add-cancel",
  ButtonDomainAddDialogConfirm = "custom-domain-add-confirm",
  ButtonDomainAddDialogParentAdd = "custom-domain-add-parent-add",
  FieldDomainAddDialogName = "custom-domain-add-name",
}

export const getDomainLabel = (domain: SemanticDomainFull): string =>
  `${domain.id} : ${domain.name}`;

export const trimDomain = (domain: SemanticDomainFull): SemanticDomainFull => ({
  ...domain,
  description: domain.description.trim(),
  name: domain.name.trim(),
  questions: domain.questions.map((q) => q.trim()).filter((q) => q),
});

/** A project settings component for managing custom semantic domains. */
export default function ProjectDomains(
  props: ProjectSettingProps
): ReactElement {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [domains, setDomains] = useState<SemanticDomainFull[]>([]);
  const [lang, setLang] = useState("");

  useEffect(() => {
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

  /** Add the specified custom domain to the current project:
   * if `undefined`, close the dialog without adding anything, then return `true`;
   * if custom domain already exists with the same id and lang, return `false`;
   * otherwise, update the project with the new domain, then return `true`. */
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

  /** Update the current project with the new list of custom domains. */
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
          buttonId={ProjectDomainsId.ButtonDomainAdd}
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

/** Component for managing a single custom domain of a project. */
function CustomDomain(props: CustomDomainProps): ReactElement {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [domain, setDomain] = useState(props.domain);

  const { t } = useTranslation();

  useEffect(() => {
    setDomain(trimDomain(props.domain));
  }, [props.domain]);

  /** Delete the custom domain from the project. */
  const deleteDomain = (): void =>
    props.updateDomains((doms) =>
      doms.filter(
        (d) => !(d.id === props.domain.id && d.lang === props.domain.lang)
      )
    );

  /** Update the custom domain in the project. */
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

  /** Check if the current domain in the component's state
   * is substantively different from the project domain passed in via the props. */
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

  /** Save the changes to the custom domain, or delete it if all content was removed. */
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
          {getDomainLabel(props.domain)}
        </Typography>
        <IconButton
          component="div" // Avoids nesting a button in the AccordionSummary button
          onClick={() => setDeleteDialogOpen(true)}
          size="small"
        >
          <Delete />
        </IconButton>
        <CancelConfirmDialog
          handleCancel={() => setDeleteDialogOpen(false)}
          handleConfirm={() => deleteDomain()}
          open={deleteDialogOpen}
          text="projectSettings.domains.deleteConfirm"
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

/** Dialog component for adding a new custom domain to the current project. */
export function AddDomainDialog(props: AddDomainDialogProps): ReactElement {
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
      toast.error(t("projectSettings.domains.addError.name"));
      return;
    }

    // If we allow custom subdomains with id not ending in "0",
    // we'll need to change this to check against the list of custom domains.
    if (parent?.id[parent?.id.length - 1] === "0") {
      toast.error(t("projectSettings.domains.addError.customParent"));
      return;
    }

    const id = parent ? `${parent.id}.0` : "0";
    const domain = newSemanticDomain(id, name.trim(), props.lang);
    domain.parentId = parent?.id ?? "";
    if (!props.onSubmit(domain)) {
      toast.error(t("projectSettings.domains.addError.takenParent"));
    } else {
      cancel();
    }
  };

  return (
    <Dialog open={props.open}>
      <DialogTitle>
        <Grid2 container justifyContent="space-between">
          {t("projectSettings.domains.add")}

          <div>
            <IconButton
              data-testid={ProjectDomainsId.ButtonDomainAddDialogConfirm}
              id={ProjectDomainsId.ButtonDomainAddDialogConfirm}
              onClick={() => submit()}
              size="small"
            >
              <Check sx={{ color: "success.main" }} />
            </IconButton>

            <IconButton
              data-testid={ProjectDomainsId.ButtonDomainAddDialogCancel}
              id={ProjectDomainsId.ButtonDomainAddDialogCancel}
              onClick={() => cancel()}
              size="small"
            >
              <Close sx={{ color: "error.main" }} />
            </IconButton>
          </div>
        </Grid2>
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
              <IconButton
                data-testid={ProjectDomainsId.ButtonDomainAddDialogParentAdd}
                id={ProjectDomainsId.ButtonDomainAddDialogParentAdd}
                onClick={() => setAddingDom(true)}
              >
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
              {t("projectSettings.domains.subdomainName")}
            </Typography>
            <TextFieldWithFont
              analysis
              id={ProjectDomainsId.FieldDomainAddDialogName}
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
