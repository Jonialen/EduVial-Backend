export default {
  hash: jest.fn(() => Promise.resolve('hashedpassword')),
  compare: jest.fn(() => Promise.resolve(true)),
};
