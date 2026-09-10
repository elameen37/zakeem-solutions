export type ZakkyRole = "user" | "assistant" | "system";

export interface ZakkyActionLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface ZakkyMessage {
  id: string;
  role: ZakkyRole;
  content: string;
  timestamp: Date;
  actions?: ZakkyActionLink[];
  isStreaming?: boolean;
}

export interface ZakkyResponse {
  reply: string;
  actions?: ZakkyActionLink[];
}

export interface ZakkyAIProvider {
  name: string;
  isOnline: boolean;
  sendMessage(
    query: string,
    history: ZakkyMessage[],
    onChunk?: (partial: string) => void
  ): Promise<ZakkyResponse>;
}
