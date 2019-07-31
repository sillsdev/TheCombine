# Data Model

## User

- Avatar

- Name

- Email

- Phone

- Other Connection Field - Other form of contact if phone/email are unavailable 

- Worked Projects - A user may be involved with more than one project at a time.

- Agreement

- Password

- Username

- UI Language - The language the user wants used for the user interface of The Combine.

- Token - stored JWT token to permit access to certain features.

## Project

- Name

- Semantic Domains

- Vernacular Writing System

- Analysis Writing System(s)

- Valid Character Set

- Rejected Character Set

- Custom Fields[^1]

- Word Fields

- Parts of Speech

### Custom Field[^1]

- Name

- Type

## Word

- Vernacular

- Plural

- Senses - consists of glosses and semantic domains

- Audio - Currently, SIL does not store audio and video files of people speaking a specific word. We want to add that ability should SIL want to do that in the future.

- Created

- Modified

- History - We are storing the history of a word in a linked tree. Each word will point to the previous word in its history.

- Part of Speech

- Edited By

- Accessability

* Other Field[^1]

### Sense

- Glosses

- Semantic Domains

### Gloss

- Language

- Definition

### Semantic Domain

- Name

- Number

### File Upload

- File

- Name

- File Path

## User Edit

- Edits

### Edit

- GoalType

- StepData

[^1]: These parts of our data model are optional at this point. We may or may not include them in our final design.
