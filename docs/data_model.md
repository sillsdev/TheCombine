# Data Model

## Role

- Name

## User

- Avatar - makes it easier to distinguish users from one another when collaborating. We will look into automatically generating avatars for users.

- Name

- E-mail

- Phone

- Other

- Projects - A user may be involved with more than one project at a time.

- Password

- Username

- UI Language - The language the user wants used for the user interface of The Combine.

## Project

- User roles

- Name

- Semantic Domains

- Words (Frontier)

- Vernacular Writing System

- Analysis Writing System(s)

- Character Set

- Custom Fields[^1]

- Word Fields

- Parts of Speech

## Word

- Vern

- Gloss(es)

- File references - Currently, SIL does not store audio and video files of people speaking a specific word. We want to add that ability should SIL want to do that in the future.

- Semantic Domain

- Users

- Part of Speech

- Custom Field[^1]

- Created

- Modified

- History - We are storing the history of a word in a linked tree. Each word will point to the previous word in its history.

## Semantic Domain

- Name

- Number

## File

- User data

- Speaker user

## Custom Field[^1]

- Name

- Type

## Goal

- Tool - For now, tool will just be a string. Later, we might create an actual Tool type.

- Steps - The steps necessary to reach the goal. Each step is an object. We have not fleshed out what exactly a step will look like.

[^1]: These parts of our data model are optional at this point. We may or may not include them in our final design.
