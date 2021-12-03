import React from "react";
import { ToastContainer } from "react-toastify";
// Styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";

/** A pre-configured ToastContainer to consistently display toasts in the
 * upper right corner of the screen. */
export function UpperRightToastContainer() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
}
