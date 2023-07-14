# Data Entry

## Semantic Domain Tree

Browse or search for the domain of interest.

!!! tip

    To make searching for a domain quicker, The Combine will automatically insert `.` between consecutive digits as you
    type. For example, `1234` will automatically become `1.2.3.4`. This behavior does not happen if any non-numeric
    characters are entered.

## New Entry

### Vernacular

A word as found in the vernacular language, usually spelled either phonetically or with the local orthography.

### Gloss

While an entry can have multiple senses/glosses, only one can be added when the entry is first created.

### Note

You can have one note on each entry. Any annotation for an entry's senses, glosses, semantic domains, etc. can be added
to the entry's note.

### Recording

You can add multiple recordings to an entry (e.g., a male voice and a female voice). As with the [Note](#note), audio
recordings are associated with the entry and not individual senses.

To record audio, there is a red circle button. For each recorded audio, there is a green triangle button.

**With a mouse:** Click-and-hold the red circle to record. Click a green triangle to play its audio, or shift-click to
delete its recording.

**On a touch screen:** Press-and-hold the red circle to record. Tap a green triangle to play its audio, or
press-and-hold to bring up a menu (with options to play or delete).

## New Entry with Duplicate Vernacular Form

If you submit a new entry with identical vernacular form and gloss to an existing entry, that entry will be updated
instead of a new entry created. For example, if you submit [Vernacular: dedo; Gloss: finger] in domain 2.1.3.1 (Arm) and
again in domain 2.1.3.3 (Finger, Toe), the result will be a single entry for "dedo" with a single sense that has gloss
"finger" and two domains.

The Combine has an optional feature to assist with data entry involving duplicate vernacular forms. It can be turned on
or off in [Project Settings > Autocomplete](project.md#autocomplete). When the setting is on, as you type the vernacular
form in Data Entry, a drop-down menu appears with identical/similar vernacular forms that already exist in other entries
in the project. If you ignore the menu options and type a new vernacular form, you can simply continue on to the gloss
and submit a new entry.

![Data Entry duplicate vernacular forms](images/data-entry-dup-vern.png){ .center }

When the autocomplete setting is on and you type or select a vernacular form that already exists in another entry, a box
will pop up with options. You will be shown all entries with that vernacular form and get to choose whether to update
one of those entries or create a new entry. If you choose to create a new entry, the pop-up box with go away and you can
type the gloss for your new entry.

![Data Entry duplicate vernacular entries](images/data-entry-dup-vern-select-entry.png){ .center }

!!! note

    Even if you selected to create a new entry, if the gloss you type is identical to a gloss of another entry with the same vernacular form, a new entry will not be created, but rather that entry will be updated.

If you choose to update one of the existing entries, a second box will appear. Here you can choose to update an existing
sense on the selected entry or to add a new sense to that entry.

![Data Entry duplicate vernacular senses](images/data-entry-dup-vern-select-sense.png){ .center }
