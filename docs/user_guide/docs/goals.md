# Data Cleanup / Goals

## Review Entries

The Review Entries table shows all entries in a project.

### Sorting and Filtering Columns

The columns are: Actions, Vernacular, Senses, Glosses, Domains, Pronunciations, Note, Flag, and Delete.

![Review Entries column headers](images/reviewEntriesColumns.png)

At the top of text-based columns (Vernacular, Glosses, Domains, Note, or Flag) you can sort alphabetically or filter
with a text search.

At the top of the Senses and Pronunciations columns you can sort or filter by the number of senses or recordings that
entries have.

There is also a Definitions column that can be turned on or off in [Project Settings](project.md#definitions).

### Editing Entry Rows

You can record, play, and delete an entry's audio recordings with the icons in the Pronunciations column. You can delete
an entry with the icon in the Delete column.

To edit an entry's vernacular, senses (including glosses and domains), note, or flag, click the icon in the Actions
column.

## Merge Duplicates

This tool automatically finds sets of potential duplicate entries. First it presents sets of words with identical
vernaculars. Then it presents sets with similar vernaculars or identical glosses (or definitions).

![Merge Duplicates two entries](images/mergeTwo.png)

Each entry is displayed in one column, and each sense of that entry is a displayed as a tile that you can
click-and-drag. There are three basic things you can do with a sense: move it, merge it into another sense, or delete
it.

### Move a Sense

When you click-and-hold a sense, it turns green. You can drag-and-drop the sense to a different place in the same column
to reorder the senses of that entry. Or you can drag-and-drop the sense into another column to move the sense to the
other entry.

![Merge Duplicates moving a sense](images/mergeMove.png)

If you want to split an entry with multiple senses into multiple entries, you can drag one of the senses into the empty
extra column on the right.

### Merge a Sense

--content coming soon--

### Delete a Sense

To delete a sense, drag it to the garbage can icon in the lower-left corner. When the sense turns red, release.

![Merge Duplicates deleting a sense](images/mergeDelete.png)

If you delete the last sense of a column, the whole column will disappear, and that entry will be deleted when you save.

![Merge Duplicates sense deleted](images/mergeDeleted.png)

### Finishing a Set

There are two buttons at the bottom for wrapping up work on the current set of potential duplicates and moving on to the
next set: "Save & Continue" and "Skip".

#### Save & Continue

![Merge Duplicates Save and Continue button](images/mergeSaveAndContinue.png)

The blue "Save and Continue" button does two things. First, it saves all changes made (i.e., all moved, merged, or
deleted senses), updating the words in the database. Second, it saves the ids of unmerged words as non-duplicates.

!!! tip

    Are the potential duplicates not duplicates? Just click Save & Continue to tell The Combine not to show you that set again.

!!! note

    If one of the words in an intentionally unmerged set is edited (e.g., in Review Entries), then the set can appear again as potential duplicates.

#### Skip

![Merge Duplicates Skip button](images/mergeSkip.png)

The grey "Skip" button resets any changes made to the set of potential duplicates. The same set will be suggested again
the next time Merge Duplicates is opened.

## Create Character Inventory

Character Inventory tools are only available to project admins. The character inventory for a project's vernacular
language is included when the project is [exported](project.md#import-and-export).

There is a tile for each unicode character that appears in the vernacular of any entry. Each tile shows the character,
its Unicode "U+" code, the number of times it occurs in entry vernaculars, and its designation (default: Undecided).

![Character Inventory character tiles](images/characterInventoryTiles.png)

### Manage a Single Character

Click on a character tile to open a panel for that character.

!!! tip

    You may have to scroll to see the panel. If your window is wide enough, there will be a blank margin on the
    right; the panel will be at the top of this. If your window is narrow, tiles fill all the way to the right side of the
    window; the panel will be at the bottom, below all the tiles.

![Character Inventory character panel](images/characterInventoryPanel.png){ .center }

The middle of the panel shows up to 5 example vernaculars in which the character occurs, highlighting the character in
each occurrence.

At the top of the panel are three buttons for designating whether the character should be included in the vernacular
language's character inventory: "ACCEPT", "UNDECIDED", and "REJECT". Pressing any of these buttons will update the
designation at the bottom of the character tile. (These updates to the character inventory are not saved to the project
until you click the SAVE button at the bottom of the page.)

At the bottom of the panel is a Find-and-Replace tool. If _every_ occurrence of the character should be replaced with
something else, type the replacement character or string in the "Replace with" box and click the APPLY button.

!!! important

    The find-and-replace operation makes changes to entries, not the the character inventory. It **cannot be undone!**
