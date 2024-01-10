import { Button, Grid } from "@mui/material";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import { enqueueSnackbar } from "notistack";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { Project } from "api/models";
import { LoadingButton } from "components/Buttons";

interface DateSelectorProps {
  close: () => void;
  project: Project;
  updateProject: (project: Project) => Promise<void>;
}

export default function DateSelector(props: DateSelectorProps): ReactElement {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const { t } = useTranslation();

  // Returns an array of dates between the two dates
  const getDatesBetween = (startDate?: Date, endDate?: Date): string[] => {
    if (!startDate || !endDate) {
      return [];
    }

    const dates: string[] = [];

    // Strip hours minutes seconds etc.
    let currentDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString());
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 1 // Will increase month if over range
      );
    }
    return dates;
  };

  async function handleSubmit(): Promise<void> {
    // protect start date before end date
    if (startDate! > endDate!) {
      enqueueSnackbar(t("projectSettings.schedule.selectedDateAlert"));
      return;
    }
    // update the schedule to the project setting
    await props.updateProject({
      ...props.project,
      workshopSchedule: getDatesBetween(startDate?.toDate(), endDate?.toDate()),
    });
    props.close();
  }

  return (
    <>
      <DatePicker
        label={t("projectSettings.schedule.startDate")}
        value={startDate}
        onChange={(newValue) => setStartDate(newValue)}
        //slots={{ day: TextField }}
        //renderInput={(params) => <TextField {...params} />}
      />
      <span>&nbsp;&nbsp;</span>
      <DatePicker
        label={t("projectSettings.schedule.endDate")}
        value={endDate}
        onChange={(newValue) => setEndDate(newValue)}
        //renderInput={(params) => <TextField {...params} />}
      />
      <Grid container justifyContent="flex-end" spacing={2}>
        <Grid item marginTop={1} style={{ width: 100 }}>
          <Button
            variant="contained"
            onClick={() => props.close()}
            id="DateSelectorCancelButton"
          >
            {t("buttons.cancel")}
          </Button>
        </Grid>
        <Grid item marginTop={1} style={{ width: 100 }}>
          <LoadingButton
            disabled={!startDate || !endDate}
            buttonProps={{
              id: "DateSelectorSubmitButton",
              onClick: () => handleSubmit(),
              variant: "contained",
              color: "primary",
            }}
          >
            {t("buttons.confirm")}
          </LoadingButton>
        </Grid>
      </Grid>
    </>
  );
}
