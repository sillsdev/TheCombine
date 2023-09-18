import { Icon } from "@mui/material";
import {
  CalendarPicker,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { ReactElement } from "react";

interface CalendarViewProps {
  projectSchedule: Date[];
}

export default function CalendarView(props: CalendarViewProps): ReactElement {
  // Custom renderer for CalendarPicker
  function customDayRenderer(
    day: Dayjs,
    _selectedDays: Array<Dayjs | null>,
    pickersDayProps: PickersDayProps<Dayjs>
  ): ReactElement {
    const date = day.toDate();
    const selected =
      props.projectSchedule &&
      props.projectSchedule.findIndex(
        (d) =>
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
      ) >= 0;
    return <PickersDay {...pickersDayProps} selected={selected} />;
  }

  function handleCalendarView(monthToRender?: Dayjs[]): ReactElement[] {
    if (!monthToRender) {
      return [];
    }

    return monthToRender.map((tempDayjs) => (
      <CalendarPicker
        key={"calendarPick" + tempDayjs.toString()}
        components={{ LeftArrowIcon: Icon, RightArrowIcon: Icon }}
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

  function getScheduledMonths(schedule: Array<Date>): Dayjs[] {
    // toISOString() gives YYYY-MM-DDTHH:mm:ss.sssZ; we just want YYYY-MM-01
    const months = schedule.map((d) => `${d.toISOString().slice(0, 8)}01`);
    return Array.from(new Set(months))
      .sort()
      .map((d) => dayjs(d));
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {handleCalendarView(getScheduledMonths(props.projectSchedule))}
    </LocalizationProvider>
  );
}
