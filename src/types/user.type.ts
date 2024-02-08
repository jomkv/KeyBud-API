interface IUser {
  username: String;
  email: String;
  password: String;
  switchType: String;
}

interface IUserPayload {
  id: String;
  username: String;
  switchType: String;
  email: String;
}

export { IUser, IUserPayload };
