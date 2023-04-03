import {
  Add,
  ArrowDropDown,
  CalendarMonth,
  DateRange,
  EventRepeat,
  Remove,
} from "@mui/icons-material";
import { Button, Grid, Icon, Typography } from "@mui/material";
import {
  CalendarPicker,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";

import DateSelector from "./DateSelector";
import { getProject, updateProject } from "backend";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import DateRemover from "./DateRemover";
import * as LocalStorage from "backend/localStorage";
import CalendarView from "./CalendarView";

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

  // Custom renderer for PickersDay
  function customDayRenderer(
    date: Dayjs,
    selectedDays: Array<Dayjs | null>,
    pickersDayProps: PickersDayProps<Dayjs>
  ) {
    const temp = date.toDate();
    if (
      projectSchedule &&
      projectSchedule?.findIndex((e) => {
        return (
          e.getDate() == temp.getDate() &&
          e.getMonth() == temp.getMonth() &&
          e.getFullYear() == temp.getFullYear()
        );
      }) >= 0
    ) {
      return <PickersDay {...pickersDayProps} selected />;
    } else {
      return <PickersDay {...pickersDayProps} selected={false} />;
    }
  }

  function handleCalendarView(monthToRender: Dayjs[] | undefined) {
    return monthToRender?.map((tempDayjs) => (
      <CalendarPicker
        key={"calendarPick" + tempDayjs.toString()}
        components={{
          LeftArrowButton: undefined,
          LeftArrowIcon: Icon,
          RightArrowButton: undefined,
          RightArrowIcon: Icon,
        }}
        readOnly
        disabled
        defaultCalendarMonth={tempDayjs}
        maxDate={tempDayjs}
        minDate={tempDayjs}
        onChange={() => {}}
        date={null}
        disableHighlightToday
        renderDay={customDayRenderer}
      />
    ));
  }

  async function handleRemoveAll() {
    const projectId = await LocalStorage.getProjectId();
    const project = await getProject(projectId);
    project.workshopSchedule = [];
    await updateProject(project);
    setProjectSchedule([]);
    return;
  }

  function getScheduledMonths(schedule: Array<Date>) {
    const monthSet = new Set<string>();
    const tempMonths = new Array<Dayjs>();
    if (schedule && schedule.length) {
      schedule.forEach((temp) => {
        monthSet.add(
          temp.getFullYear().toString() +
            "-" +
            (temp.getMonth() + 1).toString() +
            "-" +
            "01"
        );
      });
      Array.from(monthSet)
        .sort()
        .forEach((t) => tempMonths.push(dayjs(t)));
    }
    return tempMonths;
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
          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
            {handleCalendarView(getScheduledMonths(projectSchedule))}
          </LocalizationProvider> */}
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
        <DateRemover
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
