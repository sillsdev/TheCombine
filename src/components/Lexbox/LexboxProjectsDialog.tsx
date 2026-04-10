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
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { type LexboxProject } from "api/models";
import { getLexboxProjects } from "backend";
import LoadingButton from "components/Buttons/LoadingButton";
import LexboxLogin from "components/Lexbox/LexboxLogin";

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
      setError(err instanceof Error ? err.message : String(err));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!props.open || !isLoggedIn) {
      return;
    }

    loadProjects();
    const handleFocus = (): void => void loadProjects();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
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
        <Typography sx={{ mt: 2 }}>
          {t("Log in to Lexbox to see your projects.")}
        </Typography>
      );
    }
    if (!projects.length) {
      return (
        <Typography sx={{ mt: 2 }}>{t("No Lexbox projects found.")}</Typography>
      );
    }
    return (
      <List sx={{ mt: 1 }}>
        {projects.map((project) => (
          <ListItemButton
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
                  {`${t("Vernacular languages: ")}${project.vernacularWsTags?.join(", ") || t("None")}`}
                  <br />
                  {`${t("Analysis languages: ")}${project.analysisWsTags?.join(", ") || t("None")}`}
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
      <DialogTitle>{t("Import from Lexbox")}</DialogTitle>
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
