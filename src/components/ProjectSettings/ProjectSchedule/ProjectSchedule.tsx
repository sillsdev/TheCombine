import { CalendarMonth, DateRange, EventRepeat } from "@mui/icons-material";
import { Button, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";

import CalendarView from "./CalendarView";
import DateScheduleEdit from "./DateScheduleEdit";
import DateSelector from "./DateSelector";
import { getProject, updateProject } from "backend";
import * as LocalStorage from "backend/localStorage";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";

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

export default function ProjectSchedule(Props: ProjectScheduleProps) {
  const [showSelector, setShowSelector] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [remove, setRemove] = useState<boolean>(false);
  const [projectSchedule, setProjectSchedule] = useState<Date[]>([]);
  const { t } = useTranslation();

  // remove all elements from workshopSchedule in project settings
  async function handleRemoveAll() {
    const projectId = await LocalStorage.getProjectId();
    const project = await getProject(projectId);
    project.workshopSchedule = [];
    await updateProject(project);
    setProjectSchedule([]);
    return;
  }

  useEffect(() => {
    const fetchDate = async () => {
      const schedule = new Array<Date>();
      const project = await getProject(Props.projectId);
      project.workshopSchedule?.forEach((temp) => {
        schedule.push(new Date(temp));
      });
      setProjectSchedule(schedule);
    };
    fetchDate();
  }, [showSelector, showEdit, remove, Props.projectId]);

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
            buttonId={"Project-Schedule-+"}
          />
          <IconButtonWithTooltip
            icon={<DateRange />}
            textId="projectSettings.schedule.editDays"
            onClick={() => setShowEdit(true)}
            buttonId={"Project-Schedule--"}
          />
          <IconButtonWithTooltip
            icon={<EventRepeat />}
            textId="projectSettings.schedule.removeDays"
            onClick={() => setRemove(true)}
            buttonId={"Project-Schedule--"}
          />
        </Grid>

        {projectSchedule && projectSchedule.length > 0 && (
          <Grid item xs={12} marginTop={2}>
            <Typography>
              {t("projectSettings.schedule.calendarHighlight")}
            </Typography>
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
              {"cancel"}
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
              {"Submit"}
            </Button>
          </Grid>
        </Grid>
      </Modal>
    </React.Fragment>
  );
}
