import { ProjectModel } from "./project.model";
import { UserModel } from "../user/user.model";

export const ProjectService = {

  async getProjects(limit: number, offset: number) {
    return ProjectModel.findAll(limit, offset);
  },

  async createProject(name: string, description: string, createdBy: string) {

    // Check if user exists
    const user = await UserModel.findById(createdBy);
    if (!user) {
      throw new Error(
        "The specified creator user could not be found. Please verify the user ID.",
      );
    }

    return ProjectModel.create(name, description, createdBy);
  },

};