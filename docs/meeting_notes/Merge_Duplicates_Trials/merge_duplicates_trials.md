# Thursday, June 13

We had Beth come in a test the first iteration of the Merge Duplicate Step

We found 7 improvements:

- Improve Merge Duplicate Step UX

  - Make next button more visible
  - Change direction of card layout to right-to-left
  - Make the duplicate suggestions list individually scrollable
  - Rename the label of the duplicate suggestions list (was simply "duplicates")
  - (possibly, may become unwarranted) Increase the size of the hitbox on the edge of the screen required to scroll

- Improve Merge Duplicate Card UX

  - Add instructional visuals for stacking exact duplicates
  - Visually differentiate instructional cards from word cards
  - Reformat Cards
    - Display Semantic Domain
    - Some way to display multiple glosses, whether interlinearly or in an option.

- Implement Base Step Progress Indicator

  - The non-functional placeholder was extremely distracting while working. It became a higher priority.

- Implement Duplicate Stack Sort

  - By default sort by vernacular (possibly allow options to sort by other criteria)

- Optimize Duplicate Finder

  - Should not hang when getting new list of possible duplicates
  - Should return a smaller number of words (8?)
  - Should weight vernacular higher
  - Should consider transposition

- Clean Merge Duplicate Step of Debugging Tools

  - Remove Refresh and Clear Database Buttons and Associated Functions

- Fix Word Card Dissappearing when Dropped on Possible Duplicate List

# Tuesday, June 18

- Merge Duplicate UI Tweaks

  - Adjust possible duplicates scroll size based on window height
  - Grey out possible duplicates when card selected from list
  - Make instructions larger and brighter. Make overly visible. We can make classier later
  - Display instruction cards when no cards have been dragged into rows

- Add Merge Confirmation Dialogue

- Add Stack Display Dialogue

  - Allows reordering
  - Allows removal from stack

- Allow Multi-Card Selection

- Continued Duplicate Finding Improvements

  - Improve quicksearch
  - Improve accuracy
  - Show loading bar when waiting

- Tweaks to Proj Creation and Login Screens

  - Should give confirmation when registering a new user
  - Should give confirmation when project is created
  - Should list required fields

- Tune Goal Selection Component UX

  - Should not distinguish between single and double clicks
  - Should bring goal into focus if clicked on while out of focus
  - Should include keyboard controls

- Work out Browser History

  - The back button is not behaving in a way which makes sense to the user. This should be examined.

  ## Eventually

- Add Function on Right Click

  - Display card styles

- Add a Way to Edit Entry
  - Flagging
  - Merge Confirmation
  - Stack View

The tester also requested an undo button. We determined this was unnecessary.
