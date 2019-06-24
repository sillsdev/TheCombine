# Data Model

## User

- Avatar - makes it easier to distinguish users from one another when collaborating. We will look into automatically generating avatars for users.

- Name

- E-mail

- Phone

- Other Connection Field

- Projects - A user may be involved with more than one project at a time.

- Agreement

- Password

- Username

- UI Language - The language the user wants used for the user interface of The Combine.

- Token - stored JWT token to permit access to certain features.

## Project

- Name

- Semantic Domains

- User Roles

- Words (Frontier)

- Vernacular Writing System

- Analysis Writing System(s)

- Character Set

- Custom Fields[^1]

- Word Fields

- Parts of Speech

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

- Other Field[^1]

## User Role

- Permissions

- History

## Sense

- Glosses

- Semantic Domains

## Gloss

- Language

- Definition

## Semantic Domain

- Name

- Number

## File Upload

- File

- Name

- File Path

## History

- Goal Id

- Number of Steps

- Step Data

## Custom Field[^1]

- Name

- Type

## Goal

- Tool - For now, tool will just be a string. Later, we might create an actual Tool type.

- Steps - The steps necessary to reach the goal. Each step is an object. We have not fleshed out what exactly a step will look like.

[^1]: These parts of our data model are optional at this point. We may or may not include them in our final design.
