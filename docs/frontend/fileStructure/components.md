# Components

Most React components are stored in this directory. Here are the ones currently
provided:

- App - App is the top-level component in The Combine. It should not contain
  any logic. It should only render other components.
- CreateProject - The Create Project component is where users create a project.
- GoalTimeline - All the goals the user has selected appear here. The Combine
  also gives suggestions to the user about which goals they should pursue.
- Login - The login screen
- PrivateRoute - A component that either navigates to a route if the user is
  logged in, or redirects to the login screen.

Each directory should contain at least:

- The component class
- A tests subdirectory containing unit tests that test the component

Sometimes, there will also be these files/folders:

- index.tsx - a component that injects props into the component. These props are
  retrieved from the Redux store
- a file containing Redux actions
- a file containing a Redux reducer

Components can be nested. Nested components should be stored in
subdirectories of their parent, unless there are other components that use
them.

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
