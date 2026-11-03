import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Radio,
  Typography,
} from "@mui/material";
import { isAxiosError } from "axios";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { LexboxImportBlocker, type LexboxProject } from "api/models";
import { getLexboxProjects } from "backend";
import LoadingButton from "components/Buttons/LoadingButton";
import LexboxLogin from "components/Lexbox/LexboxLogin";

/** Prefers the title of a problem-details error response over the generic axios message. */
function errorText(err: unknown): string {
  if (isAxiosError<{ title?: string }>(err) && err.response?.data?.title) {
    return err.response.data.title;
  }
  return err instanceof Error ? err.message : String(err);
}

interface LexboxProjectsDialogProps {
  chooseProject: (project: LexboxProject) => void;
  onClose: () => void;
  open: boolean;
}

export default function LexboxProjectsDialog(
  props: LexboxProjectsDialogProps
): ReactElement {
  const [error, setError] = useState<string | undefined>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<LexboxProject[]>([]);
  const [selected, setSelected] = useState<LexboxProject | undefined>();

  const { t } = useTranslation();

  const loadProjects = async (): Promise<void> => {
    setLoading(true);
    setError(undefined);
    setSelected(undefined);
    try {
      setProjects(await getLexboxProjects());
    } catch (err) {
      setError(errorText(err));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (props.open && isLoggedIn) {
      loadProjects();
    }
  }, [isLoggedIn, props.open]);

  const handleConfirm = (): void => {
    if (selected) {
      props.chooseProject(selected);
      props.onClose();
    }
  };

  const handleLogout = (): void => {
    setProjects([]);
    setSelected(undefined);
    setError(undefined);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      handleLogout();
    }
  }, [isLoggedIn]);

  const importBlockerText = (blocker: LexboxImportBlocker): string => {
    switch (blocker) {
      case LexboxImportBlocker.NotLanguageForge:
        return t("lexbox.blockerNotLanguageForge");
      case LexboxImportBlocker.InsufficientRole:
        return t("lexbox.blockerInsufficientRole");
      case LexboxImportBlocker.NoVernacularLanguage:
        return t("lexbox.blockerNoVernacularLanguage");
    }
  };

  const languagesText = (tags?: string[] | null): string =>
    tags?.join(", ") || t("lexbox.noLanguages");

  const projectContent = (): ReactElement => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return <Typography sx={{ mt: 2 }}>{error}</Typography>;
    }
    if (!isLoggedIn) {
      return (
        <Typography sx={{ mt: 2 }}>{t("lexbox.logInToSeeProjects")}</Typography>
      );
    }
    if (!projects.length) {
      return <Typography sx={{ mt: 2 }}>{t("lexbox.noProjects")}</Typography>;
    }
    // Importable projects first; sort is stable, so Lexbox's order is otherwise kept.
    const sortedProjects = [...projects].sort(
      (a, b) => Number(!!a.importBlocker) - Number(!!b.importBlocker)
    );
    return (
      <List sx={{ mt: 1 }}>
        {sortedProjects.map((project) => (
          <ListItemButton
            disabled={!!project.importBlocker}
            key={project.id}
            onClick={() => setSelected(project)}
            selected={selected?.id === project.id}
          >
            <Radio
              checked={selected?.id === project.id}
              disableRipple
              tabIndex={-1}
            />
            <ListItemText
              primary={`${project.name} (${project.code})`}
              secondary={
                <>
                  {t("lexbox.vernacularLanguages", {
                    val: languagesText(project.vernacularWsTags),
                  })}
                  <br />
                  {t("lexbox.analysisLanguages", {
                    val: languagesText(project.analysisWsTags),
                  })}
                  {project.importBlocker && (
                    <>
                      <br />
                      {importBlockerText(project.importBlocker)}
                    </>
                  )}
                </>
              }
            />
          </ListItemButton>
        ))}
      </List>
    );
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={(_, reason) => {
        if (reason !== "backdropClick") {
          props.onClose();
        }
      }}
      open={props.open}
    >
      <DialogTitle>{t("lexbox.importTitle")}</DialogTitle>
      <DialogContent>
        <LexboxLogin onStatusChange={setIsLoggedIn} />
        {projectContent()}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>{t("buttons.cancel")}</Button>
        <LoadingButton
          buttonProps={{ onClick: handleConfirm }}
          disabled={!selected}
        >
          {t("buttons.confirm")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
