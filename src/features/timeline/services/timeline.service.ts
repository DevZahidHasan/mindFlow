import { TimelineRepository } from "../repositories/timeline.repository";
import { TimelineEvent, RecordTimelineEventInput } from "../schemas/timeline.schema";
import { AppErrorClass, normalizeError } from "@/lib/errors";

export class TimelineService {
  /**
   * Records a domain action into the chronological knowledge log.
   */
  static async recordEvent(input: RecordTimelineEventInput): Promise<TimelineEvent> {
    try {
      return await TimelineRepository.recordEvent(input);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Retrieves paginated timeline stream.
   */
  static async getWorkspaceTimeline(
    workspaceId: string,
    options: {
      nodeId?: string;
      projectId?: string;
      collectionId?: string;
      eventType?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<TimelineEvent[]> {
    try {
      if (!workspaceId) {
        throw new AppErrorClass("Workspace ID is required", "VALIDATION_ERROR", 400);
      }
      return await TimelineRepository.getEvents(workspaceId, options);
    } catch (err) {
      throw normalizeError(err);
    }
  }
}
