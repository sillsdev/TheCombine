import { errorToast } from "components/Toast/SwalToast";

const RecordRTC = require("recordrtc");

export default class Recorder {
  private recordRTC: any;

  constructor() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((audioStream) => this.onMicrophoneAvailable(audioStream))
      .catch(Recorder.onError);
  }

  startRecording(): void {
    if (this.recordRTC) {
      this.recordRTC.reset();
      this.recordRTC.startRecording();
    }
  }

  stopRecording(): Promise<string> {
    return new Promise((resolve) => {
      this.recordRTC.stopRecording(resolve);
    });
  }

  getBlob(): Blob {
    return this.recordRTC.getBlob();
  }

  private onMicrophoneAvailable(audioStream: MediaStream): void {
    this.recordRTC = new RecordRTC(audioStream, {
      disableLogs: true, // Comment out or switch to false for dev
      type: "audio",
      mimeType: "audio/webm;codecs=pcm",
    });
  }

  private static onError(err: Error): void {
    console.error(err);
    errorToast.fire({
      title: "Audio Recorder",
      text: "Error getting audio stream!",
    });
  }
}
