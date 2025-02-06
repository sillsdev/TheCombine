import RecordRTC from "recordrtc";

import {
  checkMicPermission,
  getFileNameForWord,
} from "components/Pronunciations/utilities";

export default class Recorder {
  private toast: (textId: string) => void;
  private recordRTC?: RecordRTC;
  private id?: string;

  static blobType: RecordRTC.Options["type"] = "audio";

  constructor(toast?: (textId: string) => void) {
    this.toast = toast ?? ((text: string) => alert(text));
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((audioStream) => this.onMicrophoneAvailable(audioStream))
      .catch((err) => this.onError(err));
  }

  /** Checks if the recorder state is `"recording"`.
   * If so, returns the `id` used with `startRecording()`.
   * If not, returns `undefined`. */
  getRecordingId(): string | undefined {
    return this.recordRTC?.getState() === "recording"
      ? (this.id ?? "")
      : undefined;
  }

  /** If recorder exists, start recording and return true.
   * If no recorder, return false. */
  startRecording(id?: string): boolean {
    if (!this.recordRTC) {
      return false;
    }
    this.recordRTC.reset();
    this.id = id;
    this.recordRTC.startRecording();
    return true;
  }

  stopRecording(): Promise<File | undefined> {
    return new Promise<File | undefined>((resolve) => {
      const rec = this.recordRTC;
      if (rec) {
        rec.stopRecording(() => {
          const fileName = getFileNameForWord(this.id ?? "");
          const file = new File([rec.getBlob()], fileName, {
            lastModified: Date.now(),
            type: Recorder.blobType,
          });
          this.id = undefined;
          resolve(file);
        });
      } else {
        this.id = undefined;
        resolve(undefined);
      }
    });
  }

  private onMicrophoneAvailable(audioStream: MediaStream): void {
    const options: RecordRTC.Options = {
      disableLogs: true, // Comment out or switch to false for dev
      mimeType: "audio/webm;codecs=pcm",
      type: Recorder.blobType,
    };
    this.recordRTC = new RecordRTC(audioStream, options);
  }

  private onError(err: Error): void {
    console.error(err);
    checkMicPermission().then((hasPermission: boolean) =>
      this.toast(
        hasPermission
          ? "pronunciations.audioStreamError"
          : "pronunciations.noMicAccess"
      )
    );
  }
}
