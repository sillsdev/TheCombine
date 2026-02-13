# TypeScript StyleGuide and Coding Conventions

Key Sections:

- [Case](#case) (`camelCase` vs. `PascalCase` vs. `ALL_CAPS`)
  - [Variable](#variable-and-function)
  - [Component](#component)
  - [Class](#class)
  - [Interface](#interface)
  - [Type](#type)
  - [Namespace](#namespace)
  - [Enum](#enum)
  - [Filename](#filename)
- [Interface names](#interface-names)
- [Test filenames](#test-filenames)
- [Type files](#type-files)
- [`null` vs. `undefined`](#null-vs-undefined)
- [`const` vs. `let` vs. `var`](#const-vs-let-vs-var)
- [Formatting](#formatting)
- [Quotes](#quotes) (single vs. double)
- [Use semicolons](#semicolons)
- [Arrays (annotate as `Type[]`)](#arrays)
- [`type` vs. `interface`](#type-vs-interface)
- [One-line `if` statements](#one-line-if-statements)
- [`import`s](#imports)
  - [Absolute vs. relative paths](#absolute-vs-relative-paths)
  - [Specificity preferred](#specificity-preferred)
- [`KeyboardEvent`s](#keyboardevents)
- [Components](#components)
  - [Component Props](#component-props)
- [Function return type](#function-return-type)
- [Hooks](#hooks)

## Case

### Variable and Function

- Use `camelCase` for variable and function names

> Reason: Conventional JavaScript

**Bad**

```ts
var FooVar;
function BarFunc() {}
```

**Good**

```ts
var fooVar;
function barFunc() {}
```

### Component

- Use `PascalCase` for component name, even if function component.

> Reason: Follows React naming convention.

**Bad**

```tsx
function component(): ReactElement {
  return <subComponent />;
}
```

**Good**

```tsx
function Component(): ReactElement {
  return <SubComponent />;
}
```

### Class

- Use `PascalCase` for class names.

> Reason: This is actually fairly conventional in standard JavaScript.

**Bad**

```ts
class foo {}
```

**Good**

```ts
class Foo {}
```

- Use `camelCase` of class members and methods

> Reason: Naturally follows from variable and function naming convention.

**Bad**

```ts
class Foo {
  Bar: number;
  Baz() {}
}
```

**Good**

```ts
class Foo {
  bar: number;
  baz() {}
}
```

### Interface

- Use `PascalCase` for name.

> Reason: Similar to class

- Use `camelCase` for members.

> Reason: Similar to class

### Type

- Use `PascalCase` for name.

> Reason: Similar to class

- Use `camelCase` for members.

> Reason: Similar to class

- Use `ALL_CAPS` for action types.

> Reason: Follows Redux naming convention

### Namespace

- Use `PascalCase` for names

> Reason: Convention followed by the TypeScript team. Namespaces are effectively just a class with static members. Class
> names are `PascalCase` => Namespace names are `PascalCase`

**Bad**

```ts
namespace foo {}
```

**Good**

```ts
namespace Foo {}
```

### Enum

- Use `PascalCase` for enum names

> Reason: Similar to Class. Is a Type.

**Bad**

```ts
enum color {}
```

**Good**

```ts
enum Color {}
```

- Use `PascalCase` for enum member

> Reason: Convention followed by TypeScript team i.e. the language creators e.g `SyntaxKind.StringLiteral`. Also helps
> with translation (code generation) of other languages into TypeScript.

**Bad**

```ts
enum Color {
  red,
}
```

**Good**

```ts
enum Color {
  Red,
}
```

### Filename

Name files and folders with `camelCase` (e.g., `utilities.ts`, `index.tsx`, `tractor.png`, `components/`), unless it is
the name of the contained Component (e.g., `DataEntryTable.tsx`, `ReviewEntries/`).

> Reason: `camelCase` is conventional across many JS teams.

## Interface names

- **Don't** prefix with `I`

> Reason: Unconventional. `lib.d.ts` defines important interfaces without an `I` (e.g. Window, Document etc).

**Bad**

```ts
interface IFoo {}
```

**Good**

```ts
interface Foo {}
```

## Test filenames

- The test file associated with `path/to/Component.tsx` should be `path/to/tests/Component.test.tsx`.

- Auxiliary test files with data or mock objects should have filenames ending in `Mock.ts`, e.g.,
  `path/to/tests/DataMock.ts`.

> Reason: `*.test.*` and `*Mock.ts` files are ignored by our CodeCov settings.

## Type files

- Separate type files should contain `type`s, `class`es, `interface`s, `enum`s but not any classes or functions that
  need unit testings. Such files should have filenames ending in `Types.ts`, e.g., `MergeDupsReduxTypes.ts`.

> Reason: `*Types.ts` files are ignored by our CodeCov settings.

## `null` vs. `undefined`

- Prefer not to use either for explicit unavailability

> Reason: these values are commonly used to keep a consistent structure between values. In TypeScript you use _types_ to
> denote the structure

**Bad**

```ts
let foo = { x: 123, y: undefined };
```

**Good**

```ts
let foo: { x: number; y?: number } = { x: 123 };
```

- Use `undefined` in general (do consider returning an object like `{valid:boolean,value?:Foo}` instead)

**_Bad_**

```ts
return null;
```

**_Good_**

```ts
return undefined;
```

- Use `null` where its a part of the API or conventional

> Reason: It is conventional in Node.js e.g. `error` is `null` for NodeBack style callbacks.

**Bad**

```ts
cb(undefined);
```

**Good**

```ts
cb(null);
```

- Use _truthy_ check for **objects** being `null` or `undefined`

**Bad**

```ts
if (error === null)
```

**Good**

```ts
if (error)
```

> Remark: Use `===` / `!==` to check for `null` / `undefined` on **primitives** that might be other falsy values (like
> `''`,`0`,`false`).

## `const` vs. `let` vs. `var`

- `const` allows the variable to be mutated, but doesn't allow it to be redeclared; prefer `const` any time your
  variable only needs to be declared once.

- `let` and `var` both allow redeclaration, but `var` is a global variable and `let` is limited to the scope of its
  declaration; prefer `let` to `var`.

**Bad**

```ts
var shouldClapHands = false;
for (var i = 0; i < 3; i++) {
  var you = getYouAtTime(i);
  shouldClapHands ||= you.isHappy() && you.knowsIt();
}
```

**Good**

```ts
let shouldClapHands = false;
for (let i = 0; i < 3; i++) {
  const you = getYouAtTime(i);
  shouldClapHands ||= you.isHappy() && you.knowsIt();
}
```

## Formatting

Use [Prettier](https://prettier.io/) to format TypeScript code as described in the README.

> Reason: Reduce the cognitive overload on the team.

## Quotes

- Prefer double quotes (`"your text"`) to single quotes (`'your text'`).

> Reason: Follows Prettier naming convention.

## Semicolons

- Use semicolons.

> Reasons: Explicit semicolons helps language formatting tools give consistent results. Missing ASI (automatic semicolon
> insertion) can trip new devs e.g. `foo() \n (function(){})` will be a single statement (not two). TC39
> [warning on this as well](https://github.com/tc39/ecma262/pull/1062). Example teams:
> [airbnb](https://github.com/airbnb/javascript), [idiomatic](https://github.com/rwaldron/idiomatic.js),
> [google/angular](https://github.com/angular/angular/), [facebook/react](https://github.com/facebook/react),
> [Microsoft/TypeScript](https://github.com/Microsoft/TypeScript/).

## Arrays

- Annotate arrays as `foos:Foo[]` instead of `foos:Array<Foo>`.

> Reasons: Its easier to read. Its used by the TypeScript team. Makes easier to know something is an array as the mind
> is trained to detect `[]`.

## `type` vs. `interface`

- Use `type` when you _might_ need a union or intersection:

```
type Foo = number | { someProperty: number }
```

- Use `interface` when you want `extends` or `implements` e.g

```
interface Foo {
  foo: string;
}
interface FooBar extends Foo {
  bar: string;
}
class X implements FooBar {
  foo: string;
  bar: string;
}
```

- Otherwise use whatever makes you happy that day.

## One line `if` statements

- Add braces to one-line `if` statements;

**Good**

```
if (isEmpty) {
  callFun();
}
```

**Bad**

```
if (isEmpty)
  callFun();
```

> Reason: Avoiding braces can cause developers to miss bugs, such as Apple's infamous
> [goto-fail bug](https://nakedsecurity.sophos.com/2014/02/24/anatomy-of-a-goto-fail-apples-ssl-bug-explained-plus-an-unofficial-patch/)

## `import`s

### Absolute vs. relative paths

- Use absolute `import` statements everywhere for consistency.

**Good**

```ts
import { type Project } from "api/models";
import { getAllProjects } from "backend";
```

**Bad**

```ts
import { type Project } from "../../../../api/models";
import { getAllProjects } from "../../../../backend";
```

> Reason: Provides consistency for imports across all files and shortens imports of commonly used top level modules.
> Developers don't have to count `../` to know where a module is, they can simply start from the root of `src/`.

### Specificity preferred

- Generally import the specific things needed (e.g., not `React` when `{ type ReactElement }` will do), and from a more
  specific target (e.g., `from "api/models"` rather than `from "api"`):

**Good**

```ts
import { type ReactElement } from "react";

import { type Project } from "api/models";

function Component(props: { project: Project }): ReactElement {}
```

**Bad**

```ts
import React from "react";

import { type Project } from "api";

function Component(props: { project: Project }): React.ReactElement {}
```

## `KeyboardEvent`s

- Use `ts-key-enum` when comparing to `React.KeyboardEvent`s.

**Good**

```ts
import { Key } from "ts-key-enum";

if (event.key === Key.Enter) {
}
```

**Bad**

```ts
if (event.key === "Enter") {
}
```

> Reason: Avoid typos and increase the number of mistakes that can be caught at compile time.

## Components

- Prefer functional components to class components.

**Good**

```ts
function Component(props: ComponentProps): ReactElement {
  return <SubComponent />;
}
```

**Bad**

```ts
class Component extends React.Component<ComponentProps, ComponentState> {
  render() {
    return <SubComponent />;
  }
}
```

### Component Props

- Alphabetize React component props for consistency and readability.

**Good**

```tsx
interface MyComponentProps {
  className?: string;
  id: string;
  onClick: () => void;
  title: string;
}
```

**Bad**

```tsx
interface MyComponentProps {
  title: string;
  id: string;
  onClick: () => void;
  className?: string;
}
```

> Reason: Consistent ordering makes props easier to find and reduces merge conflicts.

This convention applies to:
- Interface/type definitions for component props
- Prop destructuring in function parameters
- Props passed to components in JSX

## Function return type

- Specify the return type of a named function, whether declared as a `function` or `const`.
- The return type of a functional component should be `ReactElement`.

**Good**

```tsx
import {ReactElement} from React;

function Component(props: { name: string }): ReactElement {
  const sayHi = (name: string): string => {
    return `Hi, ${name}!`;
  }

  return sayHi(props.name);
}
```

**Bad**

```tsx
function Component(props: { name: string }) {
  const sayHi = (name: string) => {
    return `Hi, ${name}!`;
  };

  return sayHi(props.name);
}
```

> Reason: Ensure all return paths are the expected type.

## Hooks

- Prefer `useAppDispatch` to `useDispatch` and `useAppSelector` to `useSelector`.

**Good**

```ts
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

function Component(): ReactElement {
  const dispatch = useAppDispatch();
  const subState = useAppSelector((state: StoreState) => state.subState);
}
```

**Bad**

```ts
import { useDispatch, useSelector } from "react-redux";

function Component(): ReactElement {
  const dispatch = useDispatch();
  const subState = useSelector((state) => state.subState);
}
```

> Reason: See `types/hooks.ts`.
