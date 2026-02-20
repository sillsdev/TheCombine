# C# Style Guide and Coding Conventions

## Overview

In general, follow the Microsoft C# Coding Guidelines described in the following links:

- https://docs.microsoft.com/en-us/dotnet/standard/design-guidelines/naming-guidelines
- https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/inside-a-program/identifier-names
- https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/inside-a-program/coding-conventions

# Exceptions

The following guidelines supersede the Microsoft C# Coding Guidelines, and should be used.

## Type Inference

Use type inference (`var`) wherever possible. This can improve readability and ease of refactoring.

### `ObjectResult` exception

A Controller method with return type `IActionResult`, may return an `OkObjectResult`. If the method returns with
`Ok(<something>)`, the type of `<something>` is specified in

```c#
[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(<type>))]
```

but nowhere is that type enforced.

If `<type>` is (e.g.), `string`, considering using something like

```
string thingId = _service.Update(thing);
return Ok(thinkId)
```

Using `string thingId` instead of `var stringId` is a guard in case the return type of `Update` changes.

### Initiating empty collections

If the type is otherwise inferred, prefer `[]` over (e.g.) `new List<string>()` or `new Dictionary<string, int>()`, for
the sake of concision.

## One-line `if` statements

Add braces to one-line `if` statements;

```c#
# Yes:
if (isEmpty)
{
    callFun();
}

# No:
if (isEmpty)
    callFun();
```

### Rationale

Avoiding braces can cause developers to miss bugs, such as Apple's infamous
[goto-fail bug](https://nakedsecurity.sophos.com/2014/02/24/anatomy-of-a-goto-fail-apples-ssl-bug-explained-plus-an-unofficial-patch/)

## Prefer `Range` for simple loop iteration

As an example, to loop `0`, `1`, `2`, `3`:

```c#
# Yes:
using static System.Linq.Enumerable;

foreach (var i in Range(0, 4))

# No:
for (var i = 0; i < 4; i++)
```

The signature of [`Range`](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable.range) is:

```c#
Range (int start, int count);
```

Another example that loops `1`, `2`, `3`:

```c#
# Yes:
using static System.Linq.Enumerable;

foreach (var i in Range(1, 3))

# No:
for (var i = 1; i < 4; i++)
```

### Rationale

- Only need to mention loop variable (e.g. `i`) once
- Remove some error-prone boilerplate (`i++`)
- Remove the possibly of incrementing the wrong value (e.g. incrementing `i` instead of `j` in an inner loop)
- Express clearly the intent

## Use `IsNullOrEmpty` to compare with empty string

```c#
var str = "Am I empty?";

# Yes
if (string.IsNullOrEmpty(str))

if (!string.IsNullOrEmpty(str))

# No
if (str == "")

if (str != string.Empty)

if (str.Equals(''))
```

### Rational

Uniform style, and still works if variable being check becomes nullable.

## NUnit testing

### Prefer `InstanceOf` over `TypeOf`

Prefer asserts with `Is.InstanceOf` over `Is.TypeOf` to allow for inheritance, unless the specific type is needed.

### Prefer `AsyncMethod().Wait()` over `_ = AsyncMethod().Result`

If you want to make sure an async method finishes but don't need what it returns, use `.Wait()` rather than assigning it
to an unused `_` variable.
