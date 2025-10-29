const bcrypt = jest.requireActual('bcrypt');

bcrypt.hash = jest.fn(() => Promise.resolve('hashedpassword'));
bcrypt.compare = jest.fn(() => Promise.resolve(true));

export default bcrypt;
