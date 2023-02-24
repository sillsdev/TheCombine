import Snackbar, { SnackbarOrigin } from "@mui/material/Snackbar";
import { useEffect, useState } from "react";

interface PositionedSnackbarProps extends SnackbarOrigin {
  open: boolean;
  message: string;
}

export default function PositionedSnackbar(props: PositionedSnackbarProps) {
  const [open, setOpen] = useState<boolean>(props.open);
  const [message, setMessage] = useState<string>(props.message);
  const [vertical, setVertical] = useState<SnackbarOrigin["vertical"]>(
    props.vertical
  );
  const [horizontal, setHorizontal] = useState<SnackbarOrigin["horizontal"]>(
    props.horizontal
  );

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message={message}
        key={"Snack-Bar-key"}
      />
      {open}
    </div>
  );
}
