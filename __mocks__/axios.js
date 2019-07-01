// This file is a manual axios mock. For an explanation, see the mockExplanation document
// on docs

export default {
  // get: when axios.get is called within parent directory, instead call this function
  get: jest.fn(route => {
    return Promise.resolve({
      types: "get"
    });
  }),

  // post: when axios.post is called within parent directory, instead call this function
  post: jest.fn(route => {
    return Promise.resolve({
      types: "post"
    });
  }),

  // create: when axios.create is called within parent directory, instead return this object.
  // mockReturnThis() is just shorthand for jest.fn(function() { return this; });
  create: jest.fn().mockReturnThis()
};
