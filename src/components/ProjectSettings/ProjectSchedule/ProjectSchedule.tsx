import * as React from "react";
import { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useTranslation } from "react-i18next";
import DateSelector from "./DateSelector";
import { Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useSnackbar } from "notistack";
import { getProject } from "backend";

import { CalendarPicker } from "@mui/x-date-pickers";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { Add, Remove } from "@mui/icons-material";

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
  const [showModal, setShowModal] = useState<boolean>(false);
  const [projectSchedule, setProjectSchedule] = useState<Date[]>();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

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
  }, [showModal, Props.projectId]);

  return (
    <React.Fragment>
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="center"
        spacing={1}
      >
        <Grid item xs={12} marginTop={2}>
          <Typography>
            {t("projectSettings.schedule.calendarHighlight")}
          </Typography>
        </Grid>
        <Grid
          item
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          xs={12}
        >
          <IconButtonWithTooltip
            icon={<Add />}
            textId="projectSettings.schedule.setDays"
            onClick={() => setShowModal(true)}
            buttonId={"Project-Schedule-+"}
          />
          <IconButtonWithTooltip
            icon={<Remove />}
            textId="projectSettings.schedule.removeDays"
            onClick={() => {
              enqueueSnackbar("This feature is currently under development");
            }}
            buttonId={"Project-Schedule--"}
          />
        </Grid>

        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <CalendarPicker
              readOnly
              onChange={() => {}}
              date={null}
              disableHighlightToday
              renderDay={customDayRenderer}
            />
          </LocalizationProvider>
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
