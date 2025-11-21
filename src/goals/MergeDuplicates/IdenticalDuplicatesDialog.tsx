import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getFrontierWords, hasGraylistEntries } from "backend";

export interface IdenticalDuplicatesDialogProps {
  onCancel: () => void;
  onContinue: () => void;
  onReviewDeferred: () => void;
}

// Threshold for warning about long processing time
const LARGE_PROJECT_THRESHOLD = 1000;

export default function IdenticalDuplicatesDialog(
  props: IdenticalDuplicatesDialogProps
): ReactElement {
  const [open, setOpen] = useState<boolean>(true);
  const [hasDeferred, setHasDeferred] = useState<boolean>(false);
  const [frontierCount, setFrontierCount] = useState<number>(0);
  const { t } = useTranslation();

  const { onCancel, onContinue, onReviewDeferred } = props;

  useEffect(() => {
    hasGraylistEntries().then(setHasDeferred);
    getFrontierWords().then((words) => {
      setFrontierCount(words.length);
    });
  }, []);

  const handleCancel = (): void => {
    setOpen(false);
    onCancel();
  };

  const handleContinue = (): void => {
    setOpen(false);
    onContinue();
  };

  const handleReviewDeferred = (): void => {
    setOpen(false);
    onReviewDeferred();
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{t("mergeDups.identicalCompleted.title")}</DialogTitle>
      <DialogContent>
        <Typography paragraph>
          {t("mergeDups.identicalCompleted.congratulations")}
        </Typography>
        {hasDeferred && (
          <Typography paragraph>
            {t("mergeDups.identicalCompleted.hasDeferred")}
          </Typography>
        )}
        <Typography paragraph>
          {t("mergeDups.identicalCompleted.findingSimilar")}
        </Typography>
        {frontierCount > LARGE_PROJECT_THRESHOLD && (
          <Typography paragraph color="warning.main">
            {t("mergeDups.identicalCompleted.warning")}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="secondary" variant="outlined" onClick={handleCancel}>
          {t("buttons.cancel")}
        </Button>
        {hasDeferred && (
          <Button
            color="primary"
            variant="outlined"
            onClick={handleReviewDeferred}
          >
            {t("mergeDups.identicalCompleted.reviewDeferred")}
          </Button>
        )}
        <Button
          color="primary"
          variant="contained"
          onClick={handleContinue}
          autoFocus
        >
          {t("mergeDups.identicalCompleted.continue")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
