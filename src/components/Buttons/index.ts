import loadable from "@loadable/component";

const CloseButton = loadable(() => import("components/Buttons/CloseButton"));
const DeleteButtonWithDialog = loadable(
  () => import("components/Buttons/DeleteButtonWithDialog")
);
const FileInputButton = loadable(
  () => import("components/Buttons/FileInputButton")
);
const FlagButton = loadable(() => import("components/Buttons/FlagButton"));
const IconButtonWithTooltip = loadable(
  () => import("components/Buttons/IconButtonWithTooltip")
);
const LoadingButton = loadable(
  () => import("components/Buttons/LoadingButton")
);
const LoadingDoneButton = loadable(
  () => import("components/Buttons/LoadingDoneButton")
);
const NoteButton = loadable(() => import("components/Buttons/NoteButton"));
const PartOfSpeechButton = loadable(
  () => import("components/Buttons/PartOfSpeechButton")
);
const UndoButton = loadable(() => import("components/Buttons/UndoButton"));

export {
  CloseButton,
  DeleteButtonWithDialog,
  FileInputButton,
  FlagButton,
  IconButtonWithTooltip,
  LoadingButton,
  LoadingDoneButton,
  NoteButton,
  PartOfSpeechButton,
  UndoButton,
};
