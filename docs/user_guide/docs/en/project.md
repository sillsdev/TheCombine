# Projects

A project is for a single vernacular language.

## Create a Project

When creating a project, you have the option to start with an empty project or to import existing lexical data.

![Create Project - Tzotzil](images/projectCreateTzotzil.png){ .center }

### Import Existing Data

If you have lexical data in a [LIFT](https://software.sil.org/lifttools) file (likely exported from The Combine,
[WeSay](https://software.sil.org/wesay), [FLEx](https://software.sil.org/fieldworks), or
[Lexique Pro](https://software.sil.org/lexiquepro)), you can click the BROWSE button next to "Upload existing data?" to
import the data into your project.

If you choose not to import data during project creation, you may still do so later (see [below](#import)).

### Vernacular Language

The _vernacular language_ is the language for which words are being collected. This is usually a local, indigenous,
minority, autochthonous, heritage, or endangered language or dialect. Once a project is created, the vernacular language
cannot be changed.

If you select a LIFT file to import during project creation, a drop-down menu will appear that lets you choose the
project vernacular language from all the languages in the import's LDML files.

### Analysis Language

The _analysis language_ is the primary language into which the vernacular language is being translated. This is usually
a regional, national, official, or majority language of the location where the vernacular is spoken. Additional analysis
languages can be added after project creation (see [below](#project-languages)).

If you select a LIFT file to import during project creation, every language used in a definition or gloss will
automatically be added to the project as an analysis language.

## Manage a Project

When a project has been created or selected, it becomes the active project—you should see a gear icon and/or the project
name in the middle of the App Bar at the top of The Combine. Clicking on the gear icon or project name brings up Project
Settings for managing the project. The following settings are available for project users with sufficient permissions.

### Basic Settings

![BasicSettings](images/projectSettings1Basic.png){ width=750 .center }

#### Project Name

A distinguishing and descriptive name is recommended. The project name is part of the filename when you
[export](#export) your project.

#### Autocomplete

The default setting is On: When a user is entering the vernacular form of a new entry in Data Entry, this setting gives
suggestions of similar existing entries, allowing the user to select an existing entry and add a new sense to that
entry, rather than creating a (mostly) duplicate to something previously entered. See
[Data Entry](dataEntry.md#new-entry-with-duplicate-vernacular-form) for more details.

(This does not affect spelling suggestions for the gloss, since those suggestions are based on a dictionary independent
of existing project data.)

#### Archive Project

This is only available to the project Owner. Archiving a project makes it inaccessible to all users. This can only be
undone by a site administrator. Please contact a site administrator if you wish for the project to be entirely deleted
from the servers.

### Project Languages

![Languages](images/projectSettings2Langs.png){ width=750 .center }

![Project Languages - Tzotzil](images/projectLanguagesTzotzil.png){ .center }

The _vernacular language_ specified at project creation is fixed.

There may be multiple _analysis languages_ associated with the project, but only the top one in the list is associated
with new data entries.

!!! note

    If the project has glosses in multiple languages, those languages must be added here for all the glosses to show up
    in [Data Cleanup](goals.md). Click the magnifying glass icon to see all language codes present in the project.

The _semantic domains language_ controls the language in which semantic domain titles and descriptions are displayed in
[Data Entry](./dataEntry.md).

### Project Users

![Users](images/projectSettings3Users.png){ width=750 .center }

#### Current Users

Beside each project user is an icon with three vertical dots. If you are the project Owner or an Administrator, you can
click this to open a user management menu with the following options:

<pre>
    Remove from project
    Change project role:
        Harvester
        Editor
        Administrator
    Make project Owner [only available to the Owner modifying an Administrator]
</pre>

A _Harvester_ can do [Data Entry](./dataEntry.md) but not [Data Cleanup](./goals.md). In project settings, they can see
the project languages and workshop schedule, but cannot make any changes.

An _Editor_ has permission to do everything that a _Harvester_ can do, as well as
[Review Entries](./goals.md#review-entries), [Merge Duplicates](./goals.md#review-entries), and [Export](#export).

An _Administrator_ has permission to do everything that an _Editor_ can do, as well as modify most project settings and
users.

!!! important

    There is only one Owner per project. If you "Make project Owner" another user, you will automatically change from Owner to
    Administrator for the project, and you will no longer be able to archive the project or make/remove Administrator on other users.

#### Add Users

Either search existing users (shows all users with the search term in their name, username, or email address), or invite
new users by email address (they will be automatically added to the project when they make an account via the
invitation).

### Import/Export

![Import/Export](images/projectSettings4Port.png){ width=750 .center }

#### Import

!!! note

    Currently, the maximum size of LIFT files supported for import is 100MB.

!!! note

    Currently, only one LIFT file can be imported per project.

#### Export

After clicking the Export button, you can navigate to other parts of the website while the data is being prepared for
download. A download icon will appear in the App Bar when the export is ready for download. The default filename is the
[project name](#project-name) with a timestamp affixed.

!!! important

    A project that has reached hundreds of MB in size may take multiple minutes to export.

### Workshop Schedule

![Workshop Schedule](images/projectSettings5Sched.png){ width=750 .center }

This is only available to the project Owner, allowing a schedule to be set for a Rapid Word Collection workshop. Click
the first button to select a date range for the workshop. Click the middle button to add or remove specific dates. Click
the last button to clear the schedule.

![Workshop Schedule](images/projectSchedule.png){ .center }

## Project Statistics

If you are the project Owner, there will be another icon alongside the gear icon in App Bar at the top of The Combine.
This opens statistics about words in the project.

![Project Statistics Button](images/projectStatsButton.png){ .center }

In the context of these statistics, _word_ refers to a sense-domain pair: e.g., an entry with 3 senses, each with 2
semantic domains, will be counted as 6 words.

### Words per User

A table listing number of words and distinct semantic domains for each project user. Imported words have no associated
user and will be counted in an "unknownUser" row.

### Words per Domain

A table listing number of words in each semantic domain.

### Words per Day

Line graphs showing words collected during the days specified in the [Workshop Schedule](#workshop-schedule).

### Workshop Progress

Line graphs showing cumulative words collected across the days of the [Workshop Schedule](#workshop-schedule), as well
as projections for remainder of the workshop.
