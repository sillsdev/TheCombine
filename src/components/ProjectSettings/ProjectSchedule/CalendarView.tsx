import { Grid2, Icon } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ReactElement } from "react";

import ProjectPickersDay from "components/ProjectSettings/ProjectSchedule/ProjectPickersDay";

interface CalendarViewProps {
  projectSchedule: Date[];
}

export default function CalendarView(props: CalendarViewProps): ReactElement {
  function handleCalendarView(monthToRender?: Dayjs[]): ReactElement[] {
    if (!monthToRender) {
      return [];
    }

    return monthToRender.map((tempDayjs) => (
      <DateCalendar
        key={tempDayjs.toISOString()}
        readOnly
        disabled
        referenceDate={tempDayjs}
        maxDate={tempDayjs}
        minDate={tempDayjs}
        disableHighlightToday
        slots={{
          day: ProjectPickersDay,
          leftArrowIcon: Icon,
          rightArrowIcon: Icon,
        }}
        slotProps={{ day: { days: props.projectSchedule } as any }}
      />
    ));
  }

  function getScheduledMonths(schedule: Array<Date>): Dayjs[] {
    // toISOString() gives YYYY-MM-DDTHH:mm:ss.sssZ; we just need YYYY-MM
    const months = schedule.map((d) => d.toISOString().slice(0, 7));
    return Array.from(new Set(months)).sort().map(dayjs);
  }

  return (
    <Grid2
      container
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      size={12}
    >
      {handleCalendarView(getScheduledMonths(props.projectSchedule))}
    </Grid2>
  );
}
