import * as React from "react";
import { Dayjs } from "dayjs";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useTranslation } from "react-i18next";
import DateSelector from "./DateSelector";
import { Button, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import SelectedCalendar from "./SelectedCalendar";
import { useSnackbar } from "notistack";
import { getProject } from "backend";

import { CalendarPicker } from "@mui/x-date-pickers";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import * as LocalStorage from "backend/localStorage";

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

export default function ProjectSchedule() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [projectSchedule, setProjectSchedule] = useState<Date[]>();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const customDayRenderer = (
    date: Dayjs,
    selectedDays: Array<Dayjs | null>,
    pickersDayProps: PickersDayProps<Dayjs>
  ) => {
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
      return <PickersDay {...pickersDayProps} selected={true} />;
    } else {
      return <PickersDay {...pickersDayProps} selected={false} />;
    }
  };

  useEffect(() => {
    const fetchDate = async () => {
      const schedule = new Array<Date>();
      const project = await getProject(await LocalStorage.getProjectId());
      project.workshopSchedule?.forEach((temp) => {
        schedule.push(new Date(temp));
      });
      setProjectSchedule(schedule);
    };
    fetchDate();
  }, [showModal]);

  return (
    <React.Fragment>
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={1}
      >
        <Grid item xs={12}>
          <Typography>{"Schedule Workshop"}</Typography>
        </Grid>
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <CalendarPicker
              readOnly
              onChange={() => {}}
              date={null}
              disableHighlightToday={true}
              renderDay={customDayRenderer}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12}>
          <Typography>{"Schedule Workshop"}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={() => setShowModal(true)}
            id="ProjectSchedule+"
          >
            {"+"}
          </Button>
          <span>&nbsp;&nbsp;</span>
          <Button
            variant="contained"
            onClick={() => {
              enqueueSnackbar("This feature is currently under development");
            }}
            id="ProjectSchedule-"
          >
            {"-"}
          </Button>
        </Grid>
      </Grid>

      <Modal
        isOpen={showModal}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        onRequestClose={() => setShowModal(false)}
      >
        <DateSelector close={() => setShowModal(false)} />
      </Modal>
    </React.Fragment>
  );
}
