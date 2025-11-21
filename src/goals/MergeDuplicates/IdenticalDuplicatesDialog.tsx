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

export default function IdenticalDuplicatesDialog(
  props: IdenticalDuplicatesDialogProps
): ReactElement {
  const [open, setOpen] = useState<boolean>(true);
  const [deferredCount, setDeferredCount] = useState<number>(0);
  const [frontierCount, setFrontierCount] = useState<number>(0);
  const { t } = useTranslation();

  const { onCancel, onContinue, onReviewDeferred } = props;

  useEffect(() => {
    hasGraylistEntries().then((hasDeferred) => {
      if (hasDeferred) {
        // Count deferred entries - this is a rough estimate
        // In a real implementation, we'd need a backend endpoint to get the exact count
        setDeferredCount(1); // Placeholder
      }
    });
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
        {deferredCount > 0 && (
          <Typography paragraph>
            {t("mergeDups.identicalCompleted.deferredCount", {
              count: deferredCount,
            })}
          </Typography>
        )}
        <Typography paragraph>
          {t("mergeDups.identicalCompleted.findingSimilar")}
        </Typography>
        {frontierCount > 1000 && (
          <Typography paragraph color="warning.main">
            {t("mergeDups.identicalCompleted.warning")}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="secondary" variant="outlined" onClick={handleCancel}>
          {t("buttons.cancel")}
        </Button>
        {deferredCount > 0 && (
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
