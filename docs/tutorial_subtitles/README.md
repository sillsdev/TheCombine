This folder contains the scripts and timestamps for generating tutorial video subtitles.

Each subfolder (`<folder>`) holds one `times.txt` and at least one `<folder>.<lang>.txt` where `<lang>` is the language
of the script translation (`en` as well as any other languages into which the script has been translated).

All the files in the folder should have the same number of lines.

- `<folder>.en.txt`: each line is one sentence;
- `times.txt`: each line has the ending time of the corresponding English sentence in the tutorial video (format: `m:s`,
  where `s` can have up to 3 digits after the decimal);
- `<folder>.<lang>.txt` for `<lang>` other than `en`: each line has the translation for the corresponding English
  sentence (and if the translation is multiple sentences, it should still be just one line).

To generate the subtitles and attach them to the video ... [to be continued]
