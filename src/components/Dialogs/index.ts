import loadable from "@loadable/component";

const ButtonConfirmation = loadable(
  () => import("components/Dialogs/ButtonConfirmation")
);
const CancelConfirmDialog = loadable(
  () => import("components/Dialogs/CancelConfirmDialog")
);
const DeleteEditTextDialog = loadable(
  () => import("components/Dialogs/DeleteEditTextDialog")
);
const EditTextDialog = loadable(
  () => import("components/Dialogs/EditTextDialog")
);
const RecordAudioDialog = loadable(
  () => import("components/Dialogs/RecordAudioDialog")
);
const SubmitTextDialog = loadable(
  () => import("components/Dialogs/SubmitTextDialog")
);
const UploadImageDialog = loadable(
  () => import("components/Dialogs/UploadImageDialog")
);
const ViewImageDialog = loadable(
  () => import("components/Dialogs/ViewImageDialog")
);

export {
  ButtonConfirmation,
  CancelConfirmDialog,
  DeleteEditTextDialog,
  EditTextDialog,
  RecordAudioDialog,
  SubmitTextDialog,
  UploadImageDialog,
  ViewImageDialog,
};
