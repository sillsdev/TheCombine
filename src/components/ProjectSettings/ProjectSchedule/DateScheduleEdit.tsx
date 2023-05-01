import { Button, Grid } from "@mui/material";
import {
  CalendarPicker,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { getProject, updateProject } from "backend";
import * as LocalStorage from "backend/localStorage";
import LoadingButton from "components/Buttons/LoadingButton";

interface DateScheduleEditProps {
  close: () => void;
  projectSchedule: Date[];
}

export default function DateScheduleEdit(props: DateScheduleEditProps) {
  const [projectSchedule, setProjectSchedule] = useState<Date[]>(
    props.projectSchedule
  );
  const { t } = useTranslation();
  // Custom renderer for CalendarPicker
  function customDayRenderer(
    day: Dayjs,
    _selectedDays: Array<Dayjs | null>,
    pickersDayProps: PickersDayProps<Dayjs>
  ) {
    const date = day.toDate();
    const selected =
      projectSchedule.findIndex(
        (d) =>
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
      ) >= 0;
    return <PickersDay {...pickersDayProps} selected={selected} />;
  }

  async function handleSubmit() {
    // update the schedule to the project setting
    const projectId = LocalStorage.getProjectId();
    const project = await getProject(projectId);
    project.workshopSchedule = projectSchedule.map((date) =>
      date.toISOString()
    );
    await updateProject(project);
    props.close();
  }

  // If the date already exists, delete it; otherwise, add it
  function handleCalendarChange(day: Dayjs | null) {
    if (!day) {
      return;
    }
    const date = day.toDate();
    setProjectSchedule((prevSchedule) => {
      const schedule = [...prevSchedule];
      const index = schedule.findIndex(
        (d) =>
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
      );
      if (index >= 0) {
        schedule.splice(index, 1);
      } else {
        schedule.push(date);
      }
      return schedule;
    });
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CalendarPicker
        onChange={handleCalendarChange}
        date={null}
        disableHighlightToday
        renderDay={customDayRenderer}
      />
      <Grid container justifyContent="flex-end" spacing={2}>
        <Grid item marginTop={1} style={{ width: 100 }}>
          <Button
            variant="contained"
            onClick={() => props.close()}
            id="DateSelectorCancelButton"
          >
            {t("buttons.cancel")}
          </Button>
        </Grid>
        <Grid item marginTop={1} style={{ width: 100 }}>
          <LoadingButton
            buttonProps={{
              id: "DateSelectorSubmitButton",
              onClick: handleSubmit,
              variant: "contained",
              color: "primary",
            }}
          >
            {t("buttons.confirm")}
          </LoadingButton>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}
