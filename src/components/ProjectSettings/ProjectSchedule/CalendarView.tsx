import { Icon } from "@mui/material";
import {
  CalendarPicker,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";

interface CalendarViewProps {
  projectSchedule: Date[];
}

export default function CalendarView(props: CalendarViewProps) {
  // Custom renderer for CalendarPicker
  function customDayRenderer(
    date: Dayjs,
    selectedDays: Array<Dayjs | null>,
    pickersDayProps: PickersDayProps<Dayjs>
  ) {
    const temp = date.toDate();
    const selected =
      props.projectSchedule &&
      props.projectSchedule.findIndex((e) => {
        return (
          e.getDate() === temp.getDate() &&
          e.getMonth() === temp.getMonth() &&
          e.getFullYear() === temp.getFullYear()
        );
      }) >= 0;
    return <PickersDay {...pickersDayProps} selected={selected} />;
  }

  function handleCalendarView(monthToRender?: Dayjs[]) {
    return monthToRender?.map((tempDayjs) => (
      <CalendarPicker
        key={"calendarPick" + tempDayjs.toString()}
        components={{
          LeftArrowIcon: Icon,
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
        monthSet.add(`${temp.getFullYear()}-${temp.getMonth() + 1}-01`);
      });
      Array.from(monthSet)
        .sort()
        .forEach((t) => tempMonths.push(dayjs(t)));
    }
    return tempMonths;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {handleCalendarView(getScheduledMonths(props.projectSchedule))}
    </LocalizationProvider>
  );
}
