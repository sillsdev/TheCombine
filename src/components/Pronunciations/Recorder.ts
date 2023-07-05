import RecordRTC from "recordrtc";

import { errorToast } from "components/Toast/SwalToast";

export default class Recorder {
  private recordRTC?: RecordRTC;

  static blobType: "audio" = "audio";

  constructor() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((audioStream) => this.onMicrophoneAvailable(audioStream))
      .catch(Recorder.onError);
  }

  startRecording(): void {
    this.recordRTC?.reset();
    this.recordRTC?.startRecording();
  }

  stopRecording(): Promise<Blob | undefined> {
    return new Promise<Blob | undefined>((resolve) => {
      const rec = this.recordRTC;
      if (rec) {
        rec.stopRecording(() => resolve(rec.getBlob()));
      } else {
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

  private static onError(err: Error): void {
    console.error(err);
    errorToast.fire({
      title: "Audio Recorder",
      text: "Error getting audio stream!",
    });
  }
}
