# Data Model

## Project

- Name

- Semantic Domains

- Vernacular Writing System

- Analysis Writing Systems

- Valid Character Set

- Rejected Character Set

- Custom Fields - Not implemented: optional fields for projects

- Word Fields - Not implemented: optional fields for words in a project

- Parts of Speech

### Custom Field

- Name

- Type

## Word

- Vernacular

- Plural

- Senses - consists of glosses and semantic domains

- Audio

- Created

- Modified

- History - We are storing the history of a word in a linked tree. Each word will point to the previous word(s) in its
  history.

- Part of Speech

- Edited By

- Other Field

- Project Id

### Sense

- Glosses

- Semantic Domains

- Accessibility

### Gloss

- Language

- Definition

### Semantic Domain

- Name

- Id Number

- Description

## User

- Avatar

- Name

- Email

- Phone

- Other Connection Field - Other form of contact if phone/email are unavailable

- Worked Projects - A user may be involved with more than one project at a time

- Project Roles - A user may have different roles for different projects

- Agreement - If the user has consented for audio/video containing them to be used

- Password

- Username

- UI Language - The language the user wants used for the user interface of The Combine.

- Token - stored JWT token to permit access to certain features.

## User Edit

- Edits

- Project Id

### Edit

- Goal Type

- StepData

## User Role

- Permissions

- Project Id
