import { UserModel } from "./user.model";

export const UserService = {
  async getUsers(limit: number, offset: number) {
    return UserModel.findAll(limit, offset);
  },

  async createUser(name: string, email: string) {
    const existing = await UserModel.findByEmail(email);

    if (existing) {
      throw new Error(
        "A user with this email already exists. Please use a different email address.",
      );
    }

    return UserModel.create(name, email);
  },
};
