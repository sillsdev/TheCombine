const RecordRTC = require("recordrtc");

export default class Recorder {
  private recordRTC: any;

  constructor() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((audioStream) => this.onMicrophoneAvailable(audioStream))
      .catch((error) => Recorder.onError(error));
  }

  startRecording() {
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

  private onMicrophoneAvailable(audioStream: MediaStream) {
    this.recordRTC = new RecordRTC(audioStream, {
      disableLogs: true, // Comment out or switch to false for dev
      type: "audio",
      mimeType: "audio/webm;codecs=pcm",
    });
  }

  private static onError(error: Error) {
    console.error("Error getting audio stream!", error);
  }
}
