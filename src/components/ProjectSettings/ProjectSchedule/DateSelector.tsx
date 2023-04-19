import { Button, Grid } from "@mui/material";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { getProject, updateProject } from "backend";
import * as LocalStorage from "backend/localStorage";
import LoadingButton from "components/Buttons/LoadingButton";

interface DateSelectorProps {
  close: () => void;
}

export default function DateSelector(Props: DateSelectorProps) {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const { t } = useTranslation();

  // Returns an array of dates between the two dates
  const getDatesBetween = (startDate: Date, endDate: Date) => {
    const dates = [];

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

  async function handleSubmit() {
    // protect start date before end date
    if (startDate! > endDate!) {
      enqueueSnackbar(t("projectSettings.schedule.selectedDateAlert"));
      return;
    }
    // update the schedule to the project setting
    const projectId = LocalStorage.getProjectId();
    const project = await getProject(projectId);
    let updateDateString: string[] | null | undefined = [];
    if (startDate && endDate) {
      updateDateString = getDatesBetween(startDate.toDate(), endDate.toDate());
    }
    project.workshopSchedule = updateDateString;
    await updateProject(project);
    return Props.close();
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={t("projectSettings.schedule.startDate")}
        value={startDate}
        onChange={(newValue) => {
          setStartDate(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
      />
      <span>&nbsp;&nbsp;</span>
      <DatePicker
        label={t("projectSettings.schedule.endDate")}
        value={endDate}
        onChange={(newValue) => {
          setEndDate(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
      />
      <Grid container justifyContent="flex-end" spacing={2}>
        <Grid item marginTop={1} style={{ width: 100 }}>
          <Button
            variant="contained"
            onClick={() => {
              Props.close();
            }}
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
              onClick: () => {
                handleSubmit();
              },
              variant: "contained",
              color: "primary",
            }}
          >
            {t("buttons.confirm")}
          </LoadingButton>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}
