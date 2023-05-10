export interface ISetCurrency {
  userId: string;
  fiatId: string;
}

export interface IValidatePassword {
  incomePassword: string;
  passDB: string;
}

export interface ICreateUser {
  password: string;
  username: string;
}

export interface ISetNewUserPassword {
  userId: string;
  newPassword: string;
}
