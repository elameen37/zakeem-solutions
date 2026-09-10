import { ZAKKY_KNOWLEDGE_BASE, KnowledgeFact } from "./knowledgeBase";
import { ZakkyMessage, ZakkyResponse, ZakkyActionLink } from "./types";

export class CognitiveEngine {
  /**
   * Evaluates user prompt and conversation history to construct
   * an authoritative, grounded response.
   */
  public async processQuery(
    query: string,
    _history: ZakkyMessage[],
    onChunk?: (partial: string) => void
  ): Promise<ZakkyResponse> {
    const cleanQuery = query.toLowerCase().trim();

    // 1. Identify best-matching knowledge topic
    const matchedFact = this.findBestMatch(cleanQuery);

    let replyText = "";
    let actions: ZakkyActionLink[] = [];

    if (matchedFact) {
      replyText = `${matchedFact.summary}\n\n${matchedFact.details}`;
      actions = matchedFact.actions;
    } else if (
      cleanQuery.includes("hello") ||
      cleanQuery.includes("hi") ||
      cleanQuery.includes("hey") ||
      cleanQuery.length < 5
    ) {
      replyText =
        "Greetings. I am ZakkyAI, the enterprise intelligence agent for Zakeem Solutions. How may I assist your organization today?\n\nI can provide verified insights on:\n- Zakeem Realty ERP (features, architecture & modules)\n- Commercial subscription tiers & 20% annual savings in Nigerian Naira (NGN)\n- Enterprise engineering services & sovereign cloud deployments\n- Open engineering roles in Lagos and Abuja\n- Corporate office locations and executive consultations.";
      actions = [
        { label: "Zakeem Realty ERP", href: "/products/zakeem-realty-erp" },
        { label: "Pricing in NGN", href: "/pricing" },
        { label: "Engineering Services", href: "/services" },
      ];
    } else {
      replyText =
        "Thank you for your inquiry. Zakeem Solutions is an enterprise engineering and digital product firm specializing in mission-critical platforms, such as our flagship Zakeem Realty ERP, custom high-throughput microservices, and sovereign cloud infrastructure.\n\nCould you clarify whether your inquiry pertains to platform licensing, bespoke software engineering, careers, or a direct executive consultation?";
      actions = [
        { label: "View Platform Pricing", href: "/pricing" },
        { label: "Schedule Executive RFP", href: "/contact" },
        { label: "Browse Career Openings", href: "/careers" },
      ];
    }

    // 2. Simulate streaming if callback provided
    if (onChunk) {
      const words = replyText.split(" ");
      let accumulated = "";
      for (let i = 0; i < words.length; i++) {
        accumulated += (i === 0 ? "" : " ") + words[i];
        onChunk(accumulated);
        // Micro-delay between tokens for smooth streaming effect
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
    }

    return {
      reply: replyText,
      actions,
    };
  }

  private findBestMatch(query: string): KnowledgeFact | null {
    let bestFact: KnowledgeFact | null = null;
    let highestScore = 0;

    for (const fact of ZAKKY_KNOWLEDGE_BASE) {
      let score = 0;

      // Check keywords
      for (const kw of fact.keywords) {
        if (query.includes(kw)) {
          score += 10;
        }
      }

      // Check topic title
      if (query.includes(fact.topic.toLowerCase())) {
        score += 25;
      }

      if (score > highestScore && score >= 10) {
        highestScore = score;
        bestFact = fact;
      }
    }

    return bestFact;
  }
}
