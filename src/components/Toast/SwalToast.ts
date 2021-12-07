import Swal from "sweetalert2";

/** A generic error Toast that can be fired from any context, including
 * outside the React render context.
 * If presenting a Toast within a React render context, prefer to use
 * react-toastify instead, which is more flexible and supports translations. */
export const errorToast = Swal.mixin({
  toast: true,
  position: "bottom",
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
  icon: "error",
  showCancelButton: true,
  cancelButtonText: "Dismiss",
});
