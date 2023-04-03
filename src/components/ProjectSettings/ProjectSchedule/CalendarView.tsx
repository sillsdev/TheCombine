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

interface CalendarViewProps {
  projectSchedule: Date[];
}

export default function CalendarView(Props: CalendarViewProps) {
  const [projectSchedule, setProjectSchedule] = useState<Date[]>([]);

  useEffect(() => {
    const fetchDate = async () => {
      setProjectSchedule(Props.projectSchedule);
    };
    fetchDate();
  }, [Props.projectSchedule]);

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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {handleCalendarView(getScheduledMonths(projectSchedule))}
    </LocalizationProvider>
  );
}
