import Groq from "groq-sdk";
import { z } from "zod";
import { AI_CONFIG, requireAiSecrets } from "@/lib/ai/config";
import { AppErrorClass, normalizeError } from "@/lib/errors";
import { 
  CommandIntentResult, 
  CommandIntentType, 
  AmbiguousNodeCandidate 
} from "@/lib/ai/types";
import { KnowledgeService } from "@/features/knowledge/services/knowledge.service";
import { RAGService } from "./rag.service";

const IntentClassificationSchema = z.object({
  intent: z.enum(["SEARCH", "CONVERSATION", "CREATE_NODE", "CONNECT_NODES", "SYNTHESIZE"]),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  entities: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    sourceQuery: z.string().optional(),
    targetQuery: z.string().optional(),
    nodeQueries: z.array(z.string()).optional(),
    relationshipType: z.string().optional(),
    label: z.string().optional(),
  }).optional(),
});

export class CommandIntentService {
  /**
   * Parses user natural language command into structured intent or RAG answer.
   */
  static async processCommand(
    workspaceId: string,
    userQuery: string,
    conversationHistory: { role: "user" | "assistant"; content: string }[] = []
  ): Promise<CommandIntentResult> {
    try {
      requireAiSecrets();
      const groq = new Groq({ apiKey: AI_CONFIG.GROQ_API_KEY });

      // Fetch all nodes in workspace to provide grounded entity matching context
      const nodes = await KnowledgeService.getWorkspaceNodes(workspaceId);
      const nodeRoster = nodes.map(n => ({
        id: n.id,
        title: n.title,
        type: n.type,
      }));

      const systemPrompt = `You are MINDSPACE Command Intelligence Core.
Your mission is to classify user input into one of 5 distinct intent modes:

1. "CREATE_NODE": The user explicitly wants to create, draft, or record a new note/concept (e.g. "Create note about Docker", "Draft a policy on NDA").
2. "CONNECT_NODES": The user wants to link/connect concepts or notes together in the knowledge graph (e.g. "Connect note A to note B", "Connect JavaScript, FlowOS and LaunchFlow").
3. "SYNTHESIZE" or "CONVERSATION": The user is asking a conceptual question, exploring knowledge, or continuing a discussion (e.g. "What is our onboarding process?", "Summarize deployment").
4. "SEARCH": The user is doing a simple lookup or search for existing notes (e.g. "Find notes with Supabase").

WORKSPACE KNOWLEDGE ROSTER:
${JSON.stringify(nodeRoster, null, 2)}

RECENT CONVERSATION:
${JSON.stringify(conversationHistory.slice(-4), null, 2)}

OUTPUT FORMAT:
Respond ONLY with a JSON object adhering strictly to this schema:
{
  "intent": "CREATE_NODE" | "CONNECT_NODES" | "SYNTHESIZE" | "SEARCH" | "CONVERSATION",
  "confidence": number between 0 and 1,
  "rationale": "string explanation",
  "entities": {
    "title": "string for CREATE_NODE",
    "content": "drafted markdown content for CREATE_NODE",
    "sourceQuery": "exact or closest title for source node from the roster",
    "targetQuery": "exact or closest title for target node from the roster",
    "nodeQueries": ["array of node titles mentioned if 2 or more nodes are being connected"],
    "relationshipType": "related" | "supports" | "contradicts" | "references" | "derived_from",
    "label": "short human-readable relationship label like 'Configures', 'Depends On', etc."
  }
}
`;

      const response = await groq.chat.completions.create({
        model: AI_CONFIG.MODELS.CHAT,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const rawJson = response.choices[0]?.message?.content || "{}";
      let parsedJson: any;
      try {
        parsedJson = JSON.parse(rawJson);
      } catch (jsonErr) {
        throw new AppErrorClass("Failed to parse AI intent output", "AI_INVALID_RESPONSE", 500);
      }

      const validated = IntentClassificationSchema.safeParse(parsedJson);
      if (!validated.success) {
        const ragRes = await RAGService.askQuestion(workspaceId, userQuery);
        return {
          intent: "SYNTHESIZE",
          confidence: 0.8,
          rationale: "Defaulted to knowledge synthesis",
          answer: ragRes.answer,
          citations: ragRes.citations,
        };
      }

      const { intent, confidence, rationale, entities } = validated.data;

      // ============================================================
      // 1. CREATE_NODE INTENT
      // ============================================================
      if (intent === "CREATE_NODE" && entities?.title) {
        return {
          intent: "CREATE_NODE",
          confidence,
          rationale,
          proposedAction: {
            type: "CREATE_NODE",
            title: entities.title,
            content: entities.content || `Initial knowledge capture for ${entities.title}.`,
            rationale,
          },
        };
      }

      // ============================================================
      // 2. CONNECT_NODES INTENT
      // ============================================================
      if (intent === "CONNECT_NODES") {
        const findMatches = (q: string): AmbiguousNodeCandidate[] => {
          if (!q) return [];
          const lower = q.toLowerCase().trim().replace(/[^\w\s]/g, "");
          return nodes
            .map(n => {
              const nLower = n.title.toLowerCase().replace(/[^\w\s]/g, "");
              let sim = 0;
              if (nLower === lower) sim = 1.0;
              else if (nLower.includes(lower) || lower.includes(nLower)) sim = 0.85;
              else {
                const words = lower.split(/\s+/).filter(w => w.length > 2);
                const nWords = nLower.split(/\s+/).filter(w => w.length > 2);
                const matches = words.filter(w => nWords.some(nw => nw.includes(w) || w.includes(nw)));
                sim = matches.length / Math.max(words.length, 1);
              }
              return { id: n.id, title: n.title, type: n.type, similarity: sim };
            })
            .filter(n => (n.similarity ?? 0) >= 0.25)
            .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
        };

        const queries: string[] = entities?.nodeQueries && entities.nodeQueries.length >= 2
          ? entities.nodeQueries
          : [entities?.sourceQuery || "", entities?.targetQuery || ""];

        const sourceQuery = queries[0] || entities?.sourceQuery || "";
        const targetQuery = queries[1] || entities?.targetQuery || "";

        // If 3 or more nodes are identified, generate a MultiConnect proposal linking the cluster!
        const matchedCluster: AmbiguousNodeCandidate[] = [];
        const seenIds = new Set<string>();

        queries.forEach((q: string) => {
          const m = findMatches(q);
          if (m.length > 0 && !seenIds.has(m[0].id)) {
            seenIds.add(m[0].id);
            matchedCluster.push(m[0]);
          }
        });

        if (matchedCluster.length >= 3) {
          const connections = [];
          for (let i = 0; i < matchedCluster.length - 1; i++) {
            connections.push({
              sourceNodeId: matchedCluster[i].id,
              sourceTitle: matchedCluster[i].title,
              targetNodeId: matchedCluster[i + 1].id,
              targetTitle: matchedCluster[i + 1].title,
              label: "Cluster Link",
            });
          }
          // Also connect last to first to form a closed ring/triangle in 3D Universe
          connections.push({
            sourceNodeId: matchedCluster[matchedCluster.length - 1].id,
            sourceTitle: matchedCluster[matchedCluster.length - 1].title,
            targetNodeId: matchedCluster[0].id,
            targetTitle: matchedCluster[0].title,
            label: "Cluster Link",
          });

          return {
            intent: "CONNECT_NODES",
            confidence: 0.95,
            rationale: `Connecting cluster of ${matchedCluster.length} nodes: ${matchedCluster.map(n => `"${n.title}"`).join(", ")}.`,
            proposedAction: {
              type: "MULTI_CONNECT_NODES",
              connections,
              rationale: `Cluster connection across ${matchedCluster.length} knowledge nodes.`,
            },
          };
        }

        const sourceMatches = findMatches(sourceQuery);
        const targetMatches = findMatches(targetQuery);

        if (sourceMatches.length === 0 || targetMatches.length === 0) {
          // Check if partial title matches exist across any term
          const allPotential = nodes.filter(n => 
            userQuery.toLowerCase().includes(n.title.toLowerCase()) ||
            n.title.toLowerCase().split(/\s+/).some(w => w.length > 3 && userQuery.toLowerCase().includes(w))
          );

          if (allPotential.length >= 3) {
            const connections = [];
            for (let i = 0; i < allPotential.length - 1; i++) {
              connections.push({
                sourceNodeId: allPotential[i].id,
                sourceTitle: allPotential[i].title,
                targetNodeId: allPotential[i + 1].id,
                targetTitle: allPotential[i + 1].title,
                label: "Cluster Link",
              });
            }
            connections.push({
              sourceNodeId: allPotential[allPotential.length - 1].id,
              sourceTitle: allPotential[allPotential.length - 1].title,
              targetNodeId: allPotential[0].id,
              targetTitle: allPotential[0].title,
              label: "Cluster Link",
            });

            return {
              intent: "CONNECT_NODES",
              confidence: 0.95,
              rationale: `Connecting cluster of ${allPotential.length} nodes: ${allPotential.map(n => `"${n.title}"`).join(", ")}.`,
              proposedAction: {
                type: "MULTI_CONNECT_NODES",
                connections,
                rationale: `Direct cluster match across ${allPotential.length} nodes from query.`,
              },
            };
          }

          if (allPotential.length === 2) {
            return {
              intent: "CONNECT_NODES",
              confidence: 0.9,
              rationale: `Connecting "${allPotential[0].title}" with "${allPotential[1].title}".`,
              proposedAction: {
                type: "CONNECT_NODES",
                sourceNodeId: allPotential[0].id,
                sourceTitle: allPotential[0].title,
                targetNodeId: allPotential[1].id,
                targetTitle: allPotential[1].title,
                relationshipType: "related",
                label: "Connected",
                rationale: `Direct multi-node match from workspace context.`,
              },
            };
          }

          if (allPotential.length === 1) {
            return {
              intent: "CONNECT_NODES",
              confidence: 0.8,
              rationale: `Matched "${allPotential[0].title}". Which other note would you like to connect it with?`,
              ambiguousCandidates: {
                slot: "target",
                query: "Select second note to connect",
                candidates: nodes.filter(n => n.id !== allPotential[0].id).slice(0, 5),
              },
            };
          }

          return {
            intent: "CONNECT_NODES",
            confidence,
            rationale: `Could not identify both nodes from query. Please select a candidate note:`,
            ambiguousCandidates: {
              slot: "source",
              query: userQuery,
              candidates: nodes.slice(0, 5),
            },
          };
        }

        // Handle multiple candidates ambiguity
        if (sourceMatches.length > 1 && (sourceMatches[0].similarity ?? 0) < 0.95) {
          return {
            intent: "CONNECT_NODES",
            confidence,
            rationale: `Multiple candidate notes found for "${sourceQuery}". Please select the exact note:`,
            ambiguousCandidates: {
              slot: "source",
              query: sourceQuery,
              candidates: sourceMatches.slice(0, 4),
            },
          };
        }

        if (targetMatches.length > 1 && (targetMatches[0].similarity ?? 0) < 0.95) {
          return {
            intent: "CONNECT_NODES",
            confidence,
            rationale: `Multiple candidate notes found for "${targetQuery}". Please select the exact note:`,
            ambiguousCandidates: {
              slot: "target",
              query: targetQuery,
              candidates: targetMatches.slice(0, 4),
            },
          };
        }

        const sourceNode = sourceMatches[0];
        const targetNode = targetMatches[0];

        if (sourceNode.id === targetNode.id) {
          return {
            intent: "CONNECT_NODES",
            confidence,
            rationale: "Cannot connect a note to itself.",
            answer: "A note cannot be connected to itself in the knowledge universe.",
          };
        }

        return {
          intent: "CONNECT_NODES",
          confidence,
          rationale,
          proposedAction: {
            type: "CONNECT_NODES",
            sourceNodeId: sourceNode.id,
            sourceTitle: sourceNode.title,
            targetNodeId: targetNode.id,
            targetTitle: targetNode.title,
            relationshipType: entities?.relationshipType || "related",
            label: entities?.label || "Related To",
            rationale,
          },
        };
      }

      // ============================================================
      // 3. SYNTHESIZE / CONVERSATION / SEARCH INTENT
      // ============================================================
      const ragRes = await RAGService.askQuestion(workspaceId, userQuery);
      return {
        intent: intent === "SEARCH" ? "SEARCH" : "SYNTHESIZE",
        confidence,
        rationale,
        answer: ragRes.answer,
        citations: ragRes.citations,
      };
    } catch (err) {
      throw normalizeError(err);
    }
  }
}
