import * as React from "react";
import { Dayjs } from "dayjs";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useTranslation } from "react-i18next";
import DateSelector from "./DateSelector";
import { Button, Grid, Typography } from "@mui/material";
import { useState } from "react";
import Modal from "react-modal";
import SelectedCalendar from "./SelectedCalendar";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

export default function ProjectSchedule() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <SelectedCalendar />
        </Grid>
        <Grid item xs={12}>
          <Typography>{"schedule一下吧"}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={() => setShowModal(true)}
            id="project-user-invite"
          >
            {"+"}
          </Button>
        </Grid>
      </Grid>

      <Modal
        isOpen={showModal}
        style={customStyles}
        shouldCloseOnOverlayClick
        onRequestClose={() => setShowModal(false)}
      >
        <DateSelector />
      </Modal>
    </React.Fragment>
  );
}
