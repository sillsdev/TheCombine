import { CalendarMonth, DateRange, EventRepeat } from "@mui/icons-material";
import { Button, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";

import { getProject, updateProject } from "backend";
import * as LocalStorage from "backend/localStorage";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import CalendarView from "components/ProjectSettings/ProjectSchedule/CalendarView";
import DateScheduleEdit from "components/ProjectSettings/ProjectSchedule/DateScheduleEdit";
import DateSelector from "components/ProjectSettings/ProjectSchedule/DateSelector";

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

interface ProjectScheduleProps {
  projectId: string;
}

export default function ProjectSchedule(props: ProjectScheduleProps) {
  const [showSelector, setShowSelector] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [remove, setRemove] = useState<boolean>(false);
  const [projectSchedule, setProjectSchedule] = useState<Date[]>([]);
  const { t } = useTranslation();

  // remove all elements from workshopSchedule in project settings
  async function handleRemoveAll() {
    const projectId = LocalStorage.getProjectId();
    const project = await getProject(projectId);
    project.workshopSchedule = [];
    await updateProject(project);
    setProjectSchedule([]);
    return;
  }

  useEffect(() => {
    const fetchDate = async () => {
      const project = await getProject(props.projectId);
      const schedule = project.workshopSchedule?.map((d) => new Date(d)) ?? [];
      setProjectSchedule(schedule);
    };
    fetchDate();
  }, [showSelector, showEdit, remove, props.projectId]);

  return (
    <React.Fragment>
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="center"
        spacing={1}
      >
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
            onClick={() => setRemove(true)}
            buttonId={"Project-Schedule-removeDays"}
          />
        </Grid>
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
        <DateSelector close={() => setShowSelector(false)} />
      </Modal>
      <Modal
        isOpen={showEdit}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        onRequestClose={() => setShowEdit(false)}
      >
        <DateScheduleEdit
          close={() => setShowEdit(false)}
          projectSchedule={projectSchedule}
        />
      </Modal>
      <Modal
        isOpen={remove}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        onRequestClose={() => setRemove(false)}
      >
        <Typography>{t("projectSettings.schedule.removeAll")}</Typography>

        <Grid container justifyContent="flex-end" spacing={2}>
          <Grid item marginTop={1} style={{ width: 100 }}>
            <Button
              variant="contained"
              onClick={() => {
                setRemove(false);
              }}
              id="DateRemoveAllButtonCancel"
            >
              {t("buttons.cancel")}
            </Button>
          </Grid>
          <Grid item marginTop={1} style={{ width: 100 }}>
            <Button
              variant="contained"
              onClick={() => {
                handleRemoveAll();
                setRemove(false);
              }}
              id="DateRemoveAllButtonSubmit"
            >
              {t("buttons.confirm")}
            </Button>
          </Grid>
        </Grid>
      </Modal>
    </React.Fragment>
  );
}
