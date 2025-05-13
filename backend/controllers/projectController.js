import Project from "../models/Project.js"; // Ensure the Project model is imported

export const getProjectsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const projects = await Project.find({ userId });

    if (!projects || projects.length === 0) {
      return res.status(404).json({ message: "No projects found for this user." });
    }

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};
