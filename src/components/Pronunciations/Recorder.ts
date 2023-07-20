import RecordRTC from "recordrtc";

export default class Recorder {
  private toast: (text: string) => void;
  private recordRTC?: RecordRTC;

  static blobType: "audio" = "audio";

  constructor(toast?: (text: string) => void) {
    this.toast = toast ?? ((text: string) => alert(text));
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((audioStream) => this.onMicrophoneAvailable(audioStream))
      .catch((err) => this.onError(err));
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

  private onError(err: Error): void {
    console.error(err);
    this.toast("Error getting audio stream!");
  }
}
