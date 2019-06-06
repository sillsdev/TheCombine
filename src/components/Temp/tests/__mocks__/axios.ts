export default {
  get: jest.fn(() =>
    Promise.resolve({
      types: "get"
    })
  ),
  post: jest.fn(() =>
    Promise.resolve({
      types: "post"
    })
  ),
  create: jest.fn().mockReturnThis()
};
