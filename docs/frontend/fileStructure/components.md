# Components

Most React components are stored in this directory.

Each directory should contain at least:

- The component class
- A tests subdirectory containing unit tests that test the component

Sometimes, there will also be these files/folders:

- index.tsx - a component that injects props into the component. These props are retrieved from the Redux store
- a file containing Redux actions
- a file containing a Redux reducer

Components can be nested. Nested components should be stored in subdirectories of their parent, unless there are other
components that use them.

Here is an example of what a directory in components should look like:

- GoalTimeline/
  - GoalHistory/
    - tests/
      - component.test.tsx
    - component.tsx
  - GoalSuggestions/
    - tests/
      - component.test.tsx
    - component.tsx
  - GoalSwitcher/
    - tests/
      - component.test.tsx
      - actions.test.tsx
      - reducers.test.tsx
    - component.tsx
    - actions.tsx
    - reducers.tsx
  - tests/
    - component.test.tsx
    - actions.test.tsx
    - reducers.test.tsx
  - component.tsx
  - actions.tsx
  - reducers.tsx
