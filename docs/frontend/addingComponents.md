# Adding Components to The Combine

Let's say you want to add a Login component to the app.

First, create the React component that handles login.

The component will need methods to register a user account, as well as to login. This will require a database call or
two. To make the component as reusable as possible, we will pass in these methods through the component's props.

The component will also need access to the Redux store. The data you need from the store should be passed in through
props as well. To pass in the data, you want to create a
[connected component](https://redux.js.org/basics/usage-with-react).

You will need to create action creators and reducers, since you want to be able to dispatch login actions to the store,
and respond to the actions. The reducer should be added to the root reducer, located in
[src/rootReducer.tsx](../../src/rootReducer.tsx).

Adding a login component will require adding new state types to the store. You want to add login state to the store.
This should be defined in your login reducers file. The state should be added to the store state in
[src/types/index.tsx](../../src/types/index.tsx).

Don't forget to write unit tests.
