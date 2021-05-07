# C# Style Guide and Coding Conventions

## Overview

In general, follow the Microsoft C# Coding Guidelines described in the following links:

- https://docs.microsoft.com/en-us/dotnet/standard/design-guidelines/naming-guidelines
- https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/inside-a-program/identifier-names
- https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/inside-a-program/coding-conventions

# Exceptions

The following guidelines supersede the Microsoft C# Coding Guidelines, an should be used.

## Type Inference

Use type inference (`var`) wherever possible. This can improve readability and ease of refactoring.

## One-line `if` statements

Add braces to one-line `if` statements;

```c#
# Yes:
if (isEmpty) {
  callFun();
}

# No:
if (isEmpty)
  callFun();
```

> Reason: Avoiding braces can cause developers to miss bugs, such as Apple's infamous
> [goto-fail bug](https://nakedsecurity.sophos.com/2014/02/24/anatomy-of-a-goto-fail-apples-ssl-bug-explained-plus-an-unofficial-patch/)

# Prefer `Range` for simple loop iteration

```c#
# Yes:
using static System.Linq.Enumerable;

foreach (var i in Range(0, 4))

# No:
for (var i = 0; i < 4; i++)
```

Rationale:

- Only need to mention loop variable (e.g. `i`) once
- Remove some error-prone boilerplate (`i++`)
- Remove the possibly of incrementing the wrong value (e.g. incrementing `i` instead of `j` in an inner loop)
- Express clearly the intent
