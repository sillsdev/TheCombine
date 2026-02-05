import { Celebration, LayersOutlined, Warning } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getFrontierCount, hasGraylistEntries } from "backend";
import { ReviewDeferredDups } from "goals/MergeDuplicates/MergeDupsTypes";
import { asyncAddGoal, setDataLoadStatus } from "goals/Redux/GoalActions";
import { DataLoadStatus } from "goals/Redux/GoalReduxTypes";
import { useAppDispatch } from "rootRedux/hooks";
import router from "router/browserRouter";
import { Path } from "types/path";

// Threshold for warning about long processing time
const LARGE_PROJECT_THRESHOLD = 1000;

const startIconSx: SxProps = {
  fontSize: "inherit",
  marginInlineEnd: 1,
  verticalAlign: "middle",
};

export default function IdenticalDuplicatesDialog(props: {
  loading?: boolean;
}): ReactElement {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(true);
  const [hasDeferred, setHasDeferred] = useState(false);
  const [frontierCount, setFrontierCount] = useState(0);

  const { t } = useTranslation();

  const handleCancel = (): void => {
    dispatch(setDataLoadStatus(DataLoadStatus.Default));
    setOpen(false);
    router.navigate(Path.Goals);
  };

  const handleReviewDeferred = (): void => {
    dispatch(setDataLoadStatus(DataLoadStatus.Default));
    dispatch(asyncAddGoal(new ReviewDeferredDups()));
    setOpen(false);
  };

  useEffect(() => {
    hasGraylistEntries().then(setHasDeferred);
    getFrontierCount().then(setFrontierCount);
  }, []);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{t("mergeDups.identicalCompleted.title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography>
            <Celebration sx={startIconSx} />
            {t("mergeDups.identicalCompleted.congratulations")}
          </Typography>

          {hasDeferred && (
            <Typography>
              <LayersOutlined sx={startIconSx} />
              {t("mergeDups.identicalCompleted.hasDeferred")}
            </Typography>
          )}

          <div>
            {props.loading ? (
              <>
                <Typography>
                  {t("mergeDups.identicalCompleted.findingSimilar")}
                </Typography>
                {frontierCount > LARGE_PROJECT_THRESHOLD && (
                  <Typography>
                    <Warning sx={startIconSx} />
                    {t("mergeDups.identicalCompleted.warning")}
                  </Typography>
                )}
              </>
            ) : (
              <Typography>
                {t("mergeDups.identicalCompleted.foundSimilar")}
              </Typography>
            )}
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        {props.loading && (
          <Button onClick={handleCancel} variant="outlined">
            {t("buttons.cancel")}
          </Button>
        )}
        {hasDeferred && (
          <Button
            onClick={handleReviewDeferred}
            startIcon={<LayersOutlined />}
            variant="outlined"
          >
            {t("mergeDups.identicalCompleted.reviewDeferred")}
          </Button>
        )}
        <Button onClick={() => setOpen(false)} variant="contained">
          {t("mergeDups.identicalCompleted.continue")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
