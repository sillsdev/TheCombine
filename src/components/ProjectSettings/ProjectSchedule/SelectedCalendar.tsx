import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { CalendarPicker } from "@mui/x-date-pickers";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers";

const date1 = dayjs("03/07/2023");
const date2 = dayjs("2023-03-08");
const date3 = dayjs("2023-03-10");

export default function SelectedCalendar() {
  const [arrayDate, setArr] = React.useState<Dayjs[]>([date1, date2, date3]);

  const customDayRenderer = (
    date: Dayjs,
    selectedDays: Array<Dayjs | null>,
    pickersDayProps: PickersDayProps<Dayjs>
  ) => {
    console.log(date);
    const temp = date.toDate();

    if (temp.getDay() == 1) {
      return <PickersDay {...pickersDayProps} selected={true} />;
    }
    console.log("asd");
    return <PickersDay {...pickersDayProps} selected={false} />;
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
