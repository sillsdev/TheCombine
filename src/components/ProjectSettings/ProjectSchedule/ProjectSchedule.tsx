import { Add, Remove } from "@mui/icons-material";
import { Grid, Typography } from "@mui/material";
import {
  CalendarPicker,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";

import DateSelector from "./DateSelector";
import { getProject } from "backend";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import DateRemover from "./DateRemover";

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
  const [showRemover, setShowRemover] = useState<boolean>(false);
  const [projectSchedule, setProjectSchedule] = useState<Date[]>();
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
  }, [showSelector, showRemover, Props.projectId]);

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
            onClick={() => setShowSelector(true)}
            buttonId={"Project-Schedule-+"}
          />
          <IconButtonWithTooltip
            icon={<Remove />}
            textId="projectSettings.schedule.removeDays"
            onClick={() => setShowRemover(true)}
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
        isOpen={showSelector}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        onRequestClose={() => setShowSelector(false)}
      >
        <DateSelector close={() => setShowSelector(false)} />
      </Modal>
      <Modal
        isOpen={showRemover}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        onRequestClose={() => setShowRemover(false)}
      >
        <DateRemover
          close={() => setShowRemover(false)}
          projectSchedule={projectSchedule}
        />
      </Modal>
    </React.Fragment>
  );
}
