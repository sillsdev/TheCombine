import { Button, Grid } from "@mui/material";
import {
  CalendarPicker,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getProject, updateProject } from "backend";
import * as LocalStorage from "backend/localStorage";
import LoadingButton from "components/Buttons/LoadingButton";

interface DateScheduleEditProps {
  close: () => void;
  projectSchedule?: Date[];
}

export default function DateScheduleEdit(Props: DateScheduleEditProps) {
  const [projectSchedule, setProjectSchedule] = useState<Date[]>();
  const { t } = useTranslation();

  // Custom renderer for CalendarPicker
  function customDayRenderer(
    date: Dayjs,
    selectedDays: Array<Dayjs | null>,
    pickersDayProps: PickersDayProps<Dayjs>
  ) {
    const temp = date.toDate();
    const selected =
      Props.projectSchedule &&
      Props.projectSchedule.findIndex((e) => {
        return (
          e.getDate() === temp.getDate() &&
          e.getMonth() === temp.getMonth() &&
          e.getFullYear() === temp.getFullYear()
        );
      }) >= 0;
    return <PickersDay {...pickersDayProps} selected={selected} />;
  }

  async function handleSubmit() {
    // update the schedule to the project setting
    const projectId = LocalStorage.getProjectId();
    const project = await getProject(projectId);
    project.workshopSchedule = projectSchedule?.map((date) =>
      date.toISOString()
    );
    await updateProject(project);
    return Props.close();
  }

  // If the date already exists, delete it; otherwise, add it
  function handleCalendarChange(date: Dayjs | null) {
    if (!date) return projectSchedule;
    const currentDate = date.toDate();
    let removeDate = null;
    projectSchedule?.forEach((temp, index) => {
      if (
        temp.getFullYear() === currentDate.getFullYear() &&
        temp.getMonth() === currentDate.getMonth() &&
        temp.getDate() === currentDate.getDate()
      ) {
        removeDate = projectSchedule.splice(index, 1);
        setProjectSchedule(projectSchedule);
      }
    });
    if (!removeDate && projectSchedule) {
      projectSchedule.push(date.toDate());
      projectSchedule.sort((a, b) => (a > b ? 1 : -1));
      setProjectSchedule(projectSchedule);
    }
  }

  useEffect(() => {
    if (Props.projectSchedule) {
      setProjectSchedule(Props.projectSchedule);
    }
  }, [Props.projectSchedule, projectSchedule]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CalendarPicker
        onChange={(date) => {
          setProjectSchedule(handleCalendarChange(date));
        }}
        date={null}
        disableHighlightToday
        renderDay={customDayRenderer}
      />
      <Grid container justifyContent="flex-end" spacing={2}>
        <Grid item marginTop={1} style={{ width: 100 }}>
          <Button
            variant="contained"
            onClick={() => {
              Props.close();
            }}
            id="DateSelectorCancelButton"
          >
            {t("buttons.cancel")}
          </Button>
        </Grid>
        <Grid item marginTop={1} style={{ width: 100 }}>
          <LoadingButton
            buttonProps={{
              id: "DateSelectorSubmitButton",
              onClick: () => {
                handleSubmit();
              },
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
