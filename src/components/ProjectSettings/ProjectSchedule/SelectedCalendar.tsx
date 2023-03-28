import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { CalendarPicker } from "@mui/x-date-pickers";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import { useEffect, useState } from "react";
import * as LocalStorage from "backend/localStorage";
import { getProject } from "backend";
import { Project } from "api";

const date1 = dayjs("03/07/2023");
const date2 = dayjs("2023-03-08");
const date3 = dayjs("2023-03-10");

export default function SelectedCalendar() {
  const [projectSchedule, setProjectSchedule] = useState<Date[]>();

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
  }, []);

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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CalendarPicker
        readOnly
        onChange={() => {}}
        date={null}
        disableHighlightToday={true}
        renderDay={customDayRenderer}
      />
    </LocalizationProvider>
  );
}
