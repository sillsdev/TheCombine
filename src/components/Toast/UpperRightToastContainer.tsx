import { ReactElement } from "react";
import { ToastContainer } from "react-toastify";
// Styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";

/** A pre-configured ToastContainer to consistently display toasts in the
 * upper right corner of the screen. */
export default function UpperRightToastContainer(): ReactElement {
  return (
    <ToastContainer
      position={document.body.dir === "rtl" ? "top-left" : "top-right"}
      autoClose={5000}
      hideProgressBar
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
}
