import { CalendarMonth, DateRange, EventRepeat } from "@mui/icons-material";
import { Button, Grid, Typography } from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";

import { IconButtonWithTooltip } from "components/Buttons";
import CalendarView from "components/ProjectSettings/ProjectSchedule/CalendarView";
import DateScheduleEdit from "components/ProjectSettings/ProjectSchedule/DateScheduleEdit";
import DateSelector from "components/ProjectSettings/ProjectSchedule/DateSelector";
import { ProjectSettingPropsWithUpdate } from "components/ProjectSettings/ProjectSettingsTypes";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

export default function ProjectSchedule(
  props: ProjectSettingPropsWithUpdate
): ReactElement {
  const [projectSchedule, setProjectSchedule] = useState<Date[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  /** Remove all elements from workshopSchedule in project settings */
  async function handleRemoveAll(): Promise<void> {
    await props.updateProject({ ...props.project, workshopSchedule: [] });
    setProjectSchedule([]);
    setShowRemove(false);
  }

  const fetchSchedule = useCallback(async (): Promise<void> => {
    const schedule =
      props.project.workshopSchedule?.map((d) => new Date(d)) ?? [];
    setProjectSchedule(schedule);
  }, [props.project.workshopSchedule]);

  useEffect(() => {
    // Every time a modal is closed, fetch the updated schedule.
    if (!showEdit && !showRemove && !showSelector) {
      fetchSchedule();
    }
  }, [fetchSchedule, props.project.id, showEdit, showRemove, showSelector]);

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="center"
        spacing={1}
      >
        {!props.readOnly && (
          <Grid
            item
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            xs={12}
          >
            <IconButtonWithTooltip
              icon={<CalendarMonth />}
              textId="projectSettings.schedule.setDays"
              onClick={() => setShowSelector(true)}
              buttonId={"Project-Schedule-setDays"}
            />
            <IconButtonWithTooltip
              icon={<DateRange />}
              textId="projectSettings.schedule.editDays"
              onClick={() => setShowEdit(true)}
              buttonId={"Project-Schedule-editDays"}
            />
            <IconButtonWithTooltip
              icon={<EventRepeat />}
              textId="projectSettings.schedule.removeDays"
              onClick={() => setShowRemove(true)}
              buttonId={"Project-Schedule-removeDays"}
            />
          </Grid>
        )}
        <Grid
          item
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          xs={12}
        >
          <CalendarView projectSchedule={projectSchedule} />
        </Grid>
      </Grid>

      <Modal
        isOpen={showSelector}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        onRequestClose={() => setShowSelector(false)}
      >
        <DateSelector
          close={() => setShowSelector(false)}
          project={props.project}
          updateProject={props.updateProject}
        />
      </Modal>
      <Modal
        isOpen={showEdit}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        onRequestClose={() => setShowEdit(false)}
      >
        <DateScheduleEdit
          close={() => setShowEdit(false)}
          project={props.project}
          projectSchedule={projectSchedule}
          updateProject={props.updateProject}
        />
      </Modal>
      <Modal
        isOpen={showRemove}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        onRequestClose={() => setShowRemove(false)}
      >
        <Typography>{t("projectSettings.schedule.removeAll")}</Typography>

        <Grid container justifyContent="flex-end" spacing={2}>
          <Grid item marginTop={1}>
            <Button
              variant="contained"
              onClick={() => setShowRemove(false)}
              id="DateRemoveAllButtonCancel"
            >
              {t("buttons.cancel")}
            </Button>
          </Grid>
          <Grid item marginTop={1}>
            <Button
              variant="contained"
              onClick={() => handleRemoveAll()}
              id="DateRemoveAllButtonSubmit"
            >
              {t("buttons.confirm")}
            </Button>
          </Grid>
        </Grid>
      </Modal>
    </>
  );
}
