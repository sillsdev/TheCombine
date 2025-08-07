import { Button, Stack } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { Project } from "api/models";
import { LoadingButton } from "components/Buttons";
import ProjectPickersDay from "components/ProjectSettings/ProjectSchedule/ProjectPickersDay";

interface DateScheduleEditProps {
  close: () => void;
  project: Project;
  projectSchedule: Date[];
  updateProject: (project: Project) => Promise<void>;
}

export default function DateScheduleEdit(
  props: DateScheduleEditProps
): ReactElement {
  const [projectSchedule, setProjectSchedule] = useState<Date[]>(
    props.projectSchedule
  );
  const { t } = useTranslation();

  async function handleSubmit(): Promise<void> {
    // update the schedule to the project setting
    const updatedSchedule = projectSchedule.map((date) => date.toISOString());
    await props.updateProject({
      ...props.project,
      workshopSchedule: updatedSchedule,
    });
    props.close();
  }

  // If the date already exists, delete it; otherwise, add it
  function handleCalendarChange(day: Dayjs | null): void {
    if (!day) {
      return;
    }
    const date = day.toDate();
    setProjectSchedule((prevSchedule) => {
      const schedule = [...prevSchedule];
      const index = schedule.findIndex(
        (d) =>
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
      );
      if (index > -1) {
        schedule.splice(index, 1);
      } else {
        schedule.push(date);
      }
      return schedule;
    });
  }

  return (
    <Stack spacing={2}>
      <DateCalendar
        defaultValue={
          props.projectSchedule.length
            ? dayjs(props.projectSchedule[0])
            : undefined
        }
        disableHighlightToday
        onChange={handleCalendarChange}
        slots={{ day: ProjectPickersDay }}
        slotProps={{ day: { days: projectSchedule } as any }}
      />

      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button
          variant="contained"
          onClick={() => props.close()}
          id="DateSelectorCancelButton"
        >
          {t("buttons.cancel")}
        </Button>

        <LoadingButton
          buttonProps={{
            id: "DateSelectorSubmitButton",
            onClick: handleSubmit,
          }}
        >
          {t("buttons.confirm")}
        </LoadingButton>
      </Stack>
    </Stack>
  );
}
