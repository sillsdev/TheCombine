import { Button, Grid } from "@mui/material";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  CalendarPicker,
  PickersDay,
  PickersDayProps,
  StaticDatePicker,
} from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getProject, updateProject } from "backend";
import * as LocalStorage from "backend/localStorage";
import LoadingButton from "components/Buttons/LoadingButton";
import DatePicker from "@mui/lab/DatePicker";
import ProjectSchedule from "./ProjectSchedule";

interface DateRemoverProps {
  close: () => void;
  projectSchedule: Date[] | undefined;
}

export default function DateRemover(Props: DateRemoverProps) {
  const { t } = useTranslation();
  const [projectSchedule, setProjectSchedule] = useState<Date[]>();
  const [value, setValue] = useState<Dayjs | null>();

  const isWeekend = (date: Dayjs) => {
    const day = date.day();

    return day === 0 || day === 6;
  };
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

  async function handleCalendarChange(date: Dayjs | null) {
    if (!date) return;
    const currentDate = date.toDate();
    let removeDate = null;
    projectSchedule?.forEach((temp, index) => {
      if (
        temp.getFullYear() == currentDate.getFullYear() &&
        temp.getMonth() == currentDate.getMonth() &&
        temp.getDate() == currentDate.getDate()
      ) {
        removeDate = projectSchedule.splice(index, 1);
        return setProjectSchedule(projectSchedule);
      }
    });
    if (!removeDate) {
      projectSchedule?.push(date.toDate());
      projectSchedule?.sort((a, b) => (a > b ? 1 : -1));
      return setProjectSchedule(projectSchedule);
    }
  }

  useEffect(() => {
    const updateState = async () => {
      if (Props.projectSchedule) {
        let scheduleCopy: Date[] = [];
        Props.projectSchedule.forEach((t) => scheduleCopy.push(t));
        setProjectSchedule(scheduleCopy);
      }
    };
    updateState();
  }, [Props.projectSchedule]);
  console.log(projectSchedule);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CalendarPicker
        onChange={(date) => {
          setValue(date);
          handleCalendarChange(date);
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
