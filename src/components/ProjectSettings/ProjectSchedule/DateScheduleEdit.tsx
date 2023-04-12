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

import { getProject, updateProject } from "backend";
import * as LocalStorage from "backend/localStorage";
import LoadingButton from "components/Buttons/LoadingButton";

interface DateScheduleEditProps {
  close: () => void;
  projectSchedule: Date[] | undefined;
}

export default function DateScheduleEdit(Props: DateScheduleEditProps) {
  const [projectSchedule, setProjectSchedule] = useState<Date[]>();

  // Custom renderer for CalendarPicker
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

  async function handleSubmit() {
    // update the schedule to the project setting
    const projectId = await LocalStorage.getProjectId();
    const project = await getProject(projectId);
    const updateDateString: string[] | null | undefined = [];
    projectSchedule?.forEach((t) => {
      updateDateString.push(t.toISOString());
    });
    project.workshopSchedule = updateDateString;
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
        temp.getFullYear() == currentDate.getFullYear() &&
        temp.getMonth() == currentDate.getMonth() &&
        temp.getDate() == currentDate.getDate()
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
    const updateState = () => {
      if (Props.projectSchedule) {
        setProjectSchedule(Props.projectSchedule);
      }
    };
    updateState();
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
            {"cancel"}
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
            {"Submit"}
          </LoadingButton>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}
