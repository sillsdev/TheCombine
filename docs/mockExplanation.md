# Mocking

You have a separate folder for test objects, and within it, a folder called `__mocks__`. This folder contains typescript objects which use the name of an existing object/library you want to mock, as well as the implementations you want your tests to use instead of the real implementations, all grouped under a default export. This results in any calls made from the directory containing `__mocks__` to functions mocked in `__mocks__` using the mock definitions instead of the actual definitions.

### Good notes:

- jest.fn creates a mock function, which by default does nothing. By providing a lambda as an argument, we define what this mock function will do. The lambda does not need any parameters, but if you want to analyze arguments sent by the caller, then put a parameter in the lambda of the proper type.

- There is no rule regarding what is returned from a mock function, other than being compatible with what the function expects to return (for axios.get, returning a Promise). Set it to whatever value you want your code to see in testing.

- With mockImplementationOnce(), you can create a function that has different responses depending on when it was called. For an excellent example, follow the link and search 'mockImplementationOnce'

### Useful links:

- [Jest mock functions](https://jestjs.io/docs/en/mock-functions)
