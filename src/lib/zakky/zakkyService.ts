import { CognitiveEngine } from "./cognitiveEngine";
import { ZakkyAIProvider, ZakkyMessage, ZakkyResponse } from "./types";

export class LocalCognitiveProvider implements ZakkyAIProvider {
  public name = "Zakeem Embedded Cognitive Engine";
  public isOnline = true;
  private engine = new CognitiveEngine();

  public async sendMessage(
    query: string,
    history: ZakkyMessage[],
    onChunk?: (partial: string) => void
  ): Promise<ZakkyResponse> {
    return this.engine.processQuery(query, history, onChunk);
  }
}

// Future Production Backend API Provider template
export class BackendApiProvider implements ZakkyAIProvider {
  public name = "Zakeem Cloud Gateway";
  public isOnline = false;
  private endpoint: string;

  constructor(endpoint = "/api/zakky/chat") {
    this.endpoint = endpoint;
  }

  public async sendMessage(
    query: string,
    history: ZakkyMessage[]
  ): Promise<ZakkyResponse> {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, history }),
      });

      if (!response.ok) {
        throw new Error(`Gateway returned ${response.status}`);
      }

      return (await response.json()) as ZakkyResponse;
    } catch {
      // Fallback to local cognitive engine if backend is offline/unreachable
      const fallback = new LocalCognitiveProvider();
      return fallback.sendMessage(query, history);
    }
  }
}

class ZakkyService {
  private activeProvider: ZakkyAIProvider = new LocalCognitiveProvider();

  public setProvider(provider: ZakkyAIProvider): void {
    this.activeProvider = provider;
  }

  public getProviderName(): string {
    return this.activeProvider.name;
  }

  public getInitialGreeting(): ZakkyMessage {
    return {
      id: "initial-greeting",
      role: "assistant",
      content:
        "Hello! I am ZakkyAI, your enterprise assistant for Zakeem Solutions. I can provide real-time details on our ERP platforms, pricing tiers in Nigerian Naira (NGN), engineering services, and career opportunities.",
      timestamp: new Date(),
      actions: [
        { label: "Explore Zakeem Realty ERP", href: "/products/zakeem-realty-erp" },
        { label: "View Pricing in NGN", href: "/pricing" },
        { label: "Browse Open Careers", href: "/careers" },
      ],
    };
  }

  public async sendUserMessage(
    content: string,
    history: ZakkyMessage[],
    onChunk?: (partial: string) => void
  ): Promise<ZakkyResponse> {
    return this.activeProvider.sendMessage(content, history, onChunk);
  }
}

export const zakkyService = new ZakkyService();
