import { PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { ReactElement } from "react";

interface ProjectPickersDayProps extends PickersDayProps<Dayjs> {
  days?: Date[];
}

/** A customized (`@mui/x-date-pickers`) `PickersDay` component.
 * To select multiple dates in the `DateCalendar` component,
 * add `ProjectPickersDay` to the `DateCalendar` props as follows:
 *   `slots={{ day: ProjectPickersDay }}`
 *   `slotProps={{ day: { days: <array of selected dates> } as any }}` */
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
