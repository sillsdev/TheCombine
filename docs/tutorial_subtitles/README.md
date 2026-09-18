This folder contains the transcripts for tutorial videos and timestamps for generating video subtitles.

The `_in_progress_transcripts_` subfolder holds transcripts that are actively being edited in preparation for a video
recording.

Each other `<vid>` subfolder is in one of two states:

1. **Without `times.txt`**: The transcript is complete but the video has not yet been recorded. The folder holds only
   the `.eng.txt` (and any translated) files.

2. **With `times.txt`**: The video has been recorded. The folder holds one `times.txt` and at least one
   `<vid>.<lang>.txt`. All these files should have the same number of lines:
   - `<vid>.eng.txt`: each line is one sentence;
   - `times.txt`: each line has the ending time of the corresponding English sentence in the tutorial video (format:
     `m:s`, where `s` can have up to 3 digits after the decimal);
   - `<vid>.<lang>.txt` for `<lang>` other than `eng`: each line has the translation for the corresponding English
     sentence (and if one sentence was translated into multiple sentences, the translation should still be just one
     line).

Translations are managed via [Crowdin](https://crowdin.com/project/the-combine) and should **not** be manually added to
the repository — manual translation files will be overwritten during the next Crowdin sync.

To generate the subtitles and attach them to the video, use `scripts/subtitle_tutorial_video.py`.

DON'T EDIT THE `.eng.txt` TRANSCRIPT IN A FOLDER WITH A `times.txt` FILE! It matches an existing video. If changes are
needed to the transcript for an updated video, put a copy into the `_in_progress_transcripts_` folder and edit it there.
