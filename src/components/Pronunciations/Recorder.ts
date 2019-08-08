const RecordRTC = require("recordrtc");

export class Recorder {
  private recordRTC: any;
  private audioBlob!: Blob;
  private stream?: MediaStream;

  constructor() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(audioStream => this.onMicrophoneAvailable(audioStream))
      .catch(error => Recorder.onError(error));
  }

  startRecording() {
    if (this.recordRTC) {
      this.recordRTC.reset();
      this.recordRTC.startRecording();
    }
  }

  stopRecording(): Promise<string> {
    return new Promise(resolve => {
      this.recordRTC.stopRecording(resolve);
    });
  }

  getBlob(): Blob {
    return this.recordRTC.getBlob();
  }

  clearData(): any {
    //this.recordRTC.clearData();
  }

  private onMicrophoneAvailable(audioStream: MediaStream) {
    this.stream = audioStream;
    this.recordRTC = RecordRTC(audioStream, {
      type: "audio",
      bitrate: "128000",
      mimeType: "audio/webm",
      ignoreMutedMedia: false
    });
  }

  private static onError(error: Error) {
    console.error("Error getting audio stream!", error);
  }
}
