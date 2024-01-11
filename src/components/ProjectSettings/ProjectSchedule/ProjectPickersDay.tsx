import { PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { ReactElement } from "react";

interface ProjectPickersDayProps extends PickersDayProps<Dayjs> {
  days?: Date[];
}

export default function ProjectPickersDay(
  props: ProjectPickersDayProps
): ReactElement {
  const { days, ...pickersDayProps } = props;
  const date = pickersDayProps.day.toDate();
  const selected = days
    ? days.findIndex(
        (d) =>
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
      ) > -1
    : false;

  return <PickersDay {...pickersDayProps} selected={selected} />;
}
