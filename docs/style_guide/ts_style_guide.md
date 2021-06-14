# TypeScript StyleGuide and Coding Conventions

Key Sections:

- [Variable](#variable-and-function)
- [Class](#class)
- [Component](#component)
- [Interface](#interface)
- [Type](#type)
- [Namespace](#namespace)
- [Enum](#enum)
- [`null` vs. `undefined`](#null-vs-undefined)
- [Formatting](#formatting)
- [Single vs. Double Quotes](#quotes)
- [Use semicolons](#semicolons)
- [Annotate Arrays as `Type[]`](#array)
- [File Names](#filename)
- [`type` vs `interface`](#type-vs-interface)
- [One-line `if` statements](#one-line-if-statements)
- [imports](#imports)
- [KeyBoardEvents](#keyboardevents)

## Variable and Function

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

## Class

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

## Component

- Use `PascalCase` for component name, even if function component.

> Reason: Follows React naming convention.

**Bad**

```tsx
const component: React.FC = () => {
  return <subComponent />;
};
```

**Good**

```tsx
const Component: React.FC = () => {
  return <SubComponent />;
};
```

## Interface

- Use `PascalCase` for name.

> Reason: Similar to class

- Use `camelCase` for members.

> Reason: Similar to class

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

## Type

- Use `PascalCase` for name.

> Reason: Similar to class

- Use `camelCase` for members.

> Reason: Similar to class

- Use `ALL_CAPS` for action types.

> Reason: Follows Redux naming convention

## Namespace

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

## Enum

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

## Null vs. Undefined

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

## Formatting

Use [Prettier](https://prettier.io/) to format TypeScript code as described in the README.

> Reason: Reduce the cognitive overload on the team.

## Quotes

- Prefer double quotes (").

> Reason: Follows Prettier naming convention.

## Semicolons

- Use semicolons.

> Reasons: Explicit semicolons helps language formatting tools give consistent results. Missing ASI (automatic semicolon
> insertion) can trip new devs e.g. `foo() \n (function(){})` will be a single statement (not two). TC39
> [warning on this as well](https://github.com/tc39/ecma262/pull/1062). Example teams:
> [airbnb](https://github.com/airbnb/javascript), [idiomatic](https://github.com/rwaldron/idiomatic.js),
> [google/angular](https://github.com/angular/angular/), [facebook/react](https://github.com/facebook/react),
> [Microsoft/TypeScript](https://github.com/Microsoft/TypeScript/).

## Array

- Annotate arrays as `foos:Foo[]` instead of `foos:Array<Foo>`.

> Reasons: Its easier to read. Its used by the TypeScript team. Makes easier to know something is an array as the mind
> is trained to detect `[]`.

## Filename

Name files with `camelCase`. E.g. `accordian.tsx`, `myControl.tsx`, `utils.ts`, `map.ts` etc.

> Reason: Conventional across many JS teams.

## type vs. interface

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

Add braces to one-line `if` statements;

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

## imports

Use absolute `import` statements everywhere for consistency.

**Good**

```ts
import { getAllProjects } from "backend";
import { Project } from "types/project";
```

**Bad**

```ts
import { getAllProjects } from "../../../../backend";
import { Project } from "../../../../types/project";
```

> Reason: Provides consistency for imports across all files and shortens imports of commonly used top level modules.
> Developers don't have to count `../` to know where a module is, they can simply start from the root of `src/`.

## KeyboardEvents

Use `ts-key-enum` when comparing to `React.KeyboardEvent`s.

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
