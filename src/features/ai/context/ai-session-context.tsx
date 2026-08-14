"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Citation, ProposedCommandAction, AmbiguousNodeCandidate } from "@/lib/ai/types";

export type AiSessionState =
  | "EMPTY"
  | "THINKING"
  | "RETRIEVING"
  | "SYNTHESIZING"
  | "PROPOSING"
  | "CONFIRMING"
  | "EXECUTING"
  | "INSIGHT"
  | "ERROR";

export interface MessageTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  proposedAction?: ProposedCommandAction;
  ambiguousCandidates?: {
    slot: "source" | "target";
    query: string;
    candidates: AmbiguousNodeCandidate[];
  };
  isActionResolved?: boolean;
  timestamp: number;
}

interface AiSessionData {
  lastQuery: string;
  lastResponse: string;
  citations: Citation[];
  status: AiSessionState;
  messages: MessageTurn[];
  pendingAction?: ProposedCommandAction;
}

interface AiSessionContextType {
  session: AiSessionData;
  setSession: React.Dispatch<React.SetStateAction<AiSessionData>>;
  appendUserMessage: (query: string) => void;
  appendAssistantMessage: (
    content: string,
    citations?: Citation[],
    proposedAction?: ProposedCommandAction,
    ambiguousCandidates?: MessageTurn["ambiguousCandidates"]
  ) => void;
  resolveAction: (messageId: string) => void;
  clearSession: () => void;
}

const defaultSession: AiSessionData = {
  lastQuery: "",
  lastResponse: "",
  citations: [],
  status: "EMPTY",
  messages: [],
};

const AiSessionContext = createContext<AiSessionContextType | undefined>(undefined);

export const AiSessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AiSessionData>(defaultSession);

  const clearSession = () => setSession(defaultSession);

  const appendUserMessage = (query: string) => {
    const newTurn: MessageTurn = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      role: "user",
      content: query,
      timestamp: Date.now(),
    };
    setSession(prev => ({
      ...prev,
      lastQuery: query,
      status: "THINKING",
      messages: [...prev.messages, newTurn],
    }));
  };

  const appendAssistantMessage = (
    content: string,
    citations?: Citation[],
    proposedAction?: ProposedCommandAction,
    ambiguousCandidates?: MessageTurn["ambiguousCandidates"]
  ) => {
    const newTurn: MessageTurn = {
      id: `ast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      role: "assistant",
      content,
      citations,
      proposedAction,
      ambiguousCandidates,
      isActionResolved: false,
      timestamp: Date.now(),
    };
    setSession(prev => ({
      ...prev,
      lastResponse: content,
      citations: citations || [],
      pendingAction: proposedAction,
      status: proposedAction ? "PROPOSING" : "INSIGHT",
      messages: [...prev.messages, newTurn],
    }));
  };

  const resolveAction = (messageId: string) => {
    setSession(prev => ({
      ...prev,
      pendingAction: undefined,
      status: "INSIGHT",
      messages: prev.messages.map(m =>
        m.id === messageId ? { ...m, isActionResolved: true } : m
      ),
    }));
  };

  return (
    <AiSessionContext.Provider
      value={{
        session,
        setSession,
        appendUserMessage,
        appendAssistantMessage,
        resolveAction,
        clearSession,
      }}
    >
      {children}
    </AiSessionContext.Provider>
  );
};

export const useAiSession = () => {
  const context = useContext(AiSessionContext);
  if (context === undefined) {
    throw new Error("useAiSession must be used within an AiSessionProvider");
  }
  return context;
};
