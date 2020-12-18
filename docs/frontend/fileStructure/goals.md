# Goals

The Combine provides tools for people to clean up after a Rapid Word Collection workshop. We call each of these tools a
goal that the user wants to accomplish. The goal types The Combine provides are:

- Create Character Inventory
- Create Structural Character Inventory
- Handle Flags
- Merge Duplicates
- Spell Check Gloss
- Validate Characters
- Validate Structural Words
- Review Entries

Each directory should contain at least:

- The component class
- The goal class
- A tests subdirectory containing unit tests that test the component

Sometimes, there will also be these files/folders:

- index.tsx - a component that injects props into the component. These props are retrieved from the Redux store
- a file containing Redux actions
- a file containing a Redux reducer
