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

- Add Merge Confirmation Dialog

- Add Stack Display Dialog

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

# Wednesday, June 26

- Tweak Character Inventory

  - Clarify purpose
  - Disable 'Add Characters' button until characters have been typed in.
  - Save button should give feedback

- Bugfix

  - Allow cards to be dropped anywhere on wordlist

- Add Register Dialog

  - User was expecting register to be a seperate dialog

- Add way to Explicitly Return to Goal Navigation

  - User had to ask to figure out how to get back to the goal navigator from a goal
  - Separate button
  - Hamburger with nav return and logout

- Rework Duplicate Rows Scrolling

  - User had to scroll to bottom to view new row
  - Resize cards based on number of rows

- Deal with Non-Duplicates in Word List

  - Make title/goal purpose clearer
  - Add way for user to acknowledge non-duplicates
  - Improve accuracy in duplicate finder

- Rework Goal Navigation UI

  - Remove decision dimension
  - Make horizontal
  - Make suggestions selectable and scrollable
  - Make cards vertical

- Greater Granularity of Control in Merge Duplicate Goal

  - Add way to add as plural
  - Add way to edit word in merge tool
  - Add button to expand stack

- Improve User Guidance in Merge Duplicate Goal

  - Make stacking mechanic and purpose clearer
  - Make dragging mechanic more quickly evident
  - Disable right-click for now

# Wednesday, July 3

### Merge Duplicate Goal

- Minimize Mouse Movement

  - Add keybindings
    - Arrow keys to move selected card
    - Spacebar/enter? to select card
    - Number keys to drop card onto corresponding word
  - Possibly move 'save & continue' button

- Handle Right Click (Still)

  - Select card?
  - Show stack?

- Allow Editing of Card Fields

  - Editable Dropdown/Autocomplete for:
    - Vernacular
    - Gloss
  - Dropdown for:
    - Semantic Domain

- Add Stacking Visuals to New UI

  - Display number of cards in stack
  - Display cards in stack on click
  - Clarify only one gloss per language per sense

- Clarify Card Mechanics

  - Add animation to show card has moved, not been deleted (dragndrop library?)
  - Make it clearer that cards can be stacked

- Add Way to Delete Cards?
  - "To be Deleted" stack

### Navigation Component View

- Don't Append Empty Goals to History
  - Check if user did anything within the goal before adding it to the history

### Create Character Inventory Goal

- Eliminate Initial Click on 'Add Chars' Button

  - Disable button until field is filled?
  - Make buttons invisible until can be used?
  - Rename goal more clearly?

- Move Sliding Buttons to Left Side of Words in Create Char. Inv.

### Bugfixes

- Goal History Remains After Logging Out
