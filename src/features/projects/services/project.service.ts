import { ProjectRepository } from "../repositories/project.repository";
import { TimelineService } from "@/features/timeline/services/timeline.service";
import { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput,
  CreateProjectSchema,
  UpdateProjectSchema
} from "../schemas/project.schema";
import { AppErrorClass, normalizeError } from "@/lib/errors";

export class ProjectService {
  static async createProject(input: CreateProjectInput, userId: string): Promise<Project> {
    try {
      const validated = CreateProjectSchema.parse(input);
      const project = await ProjectRepository.createProject(validated, userId);

      // Record in historical knowledge log
      await TimelineService.recordEvent({
        workspace_id: validated.workspace_id,
        event_type: "NODE_ASSIGNED_PROJECT", // generic project creation marker
        project_id: project.id,
        actor_id: userId,
        title: `Project Created: ${project.name}`,
        description: project.description || undefined,
      }).catch(err => console.error("Timeline record error:", err));

      return project;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async getWorkspaceProjects(workspaceId: string): Promise<Project[]> {
    try {
      if (!workspaceId) throw new AppErrorClass("Workspace ID is required", "VALIDATION_ERROR", 400);
      return await ProjectRepository.getWorkspaceProjects(workspaceId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async getProjectById(workspaceId: string, projectId: string): Promise<Project | null> {
    try {
      if (!workspaceId || !projectId) throw new AppErrorClass("Invalid parameters", "VALIDATION_ERROR", 400);
      return await ProjectRepository.getProjectById(workspaceId, projectId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async updateProject(input: UpdateProjectInput): Promise<Project> {
    try {
      const validated = UpdateProjectSchema.parse(input);
      return await ProjectRepository.updateProject(validated);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async assignNode(workspaceId: string, projectId: string, nodeId: string, userId?: string): Promise<void> {
    try {
      if (!workspaceId || !projectId || !nodeId) {
        throw new AppErrorClass("Invalid assignment parameters", "VALIDATION_ERROR", 400);
      }
      await ProjectRepository.assignNodeToProject(workspaceId, projectId, nodeId);

      const project = await ProjectRepository.getProjectById(workspaceId, projectId);
      await TimelineService.recordEvent({
        workspace_id: workspaceId,
        event_type: "NODE_ASSIGNED_PROJECT",
        node_id: nodeId,
        project_id: projectId,
        actor_id: userId,
        title: `Note assigned to project ${project?.name || ""}`,
      }).catch(err => console.error("Timeline record error:", err));
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async removeNode(workspaceId: string, projectId: string, nodeId: string, userId?: string): Promise<void> {
    try {
      if (!workspaceId || !projectId || !nodeId) {
        throw new AppErrorClass("Invalid parameters", "VALIDATION_ERROR", 400);
      }
      await ProjectRepository.removeNodeFromProject(workspaceId, projectId, nodeId);

      await TimelineService.recordEvent({
        workspace_id: workspaceId,
        event_type: "NODE_REMOVED_PROJECT",
        node_id: nodeId,
        project_id: projectId,
        actor_id: userId,
        title: `Note removed from project`,
      }).catch(err => console.error("Timeline record error:", err));
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async getProjectNodeIds(workspaceId: string, projectId: string): Promise<string[]> {
    try {
      return await ProjectRepository.getProjectNodeIds(workspaceId, projectId);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  static async getNodeProjectIds(workspaceId: string, nodeId: string): Promise<string[]> {
    try {
      return await ProjectRepository.getNodeProjectIds(workspaceId, nodeId);
    } catch (err) {
      return [];
    }
  }
}
