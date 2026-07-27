/**
 * chatbotService.ts
 *
 * Talks ONLY to the n8n webhook. n8n is purely an orchestration layer —
 * it forwards the user's JWT to existing Flask endpoints for any tool call
 * that needs real data (products, cart, orders, account). This service
 * never talks to Flask directly and never contains business logic.
 */

// Set VITE_N8N_CHAT_WEBHOOK_URL in Frontend/.env, e.g.:
// VITE_N8N_CHAT_WEBHOOK_URL=https://sdlworkspace.app.n8n.cloud/webhook/baker-chat
const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL || "https://sdlworkspace.app.n8n.cloud/webhook/baker-chat";

const SESSION_STORAGE_KEY = "chatbot_session_id";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  redirectUrl?: string;
  redirectLabel?: string;
  products?: ChatProduct[];
}

export interface ChatProduct {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  productUrl?: string;
}

interface N8nChatResponse {
  sessionId: string;
  response: string;
  redirectUrl?: string;
  redirectLabel?: string;
  products?: ChatProduct[];
  timestamp?: string;
}

/** Reuses the same localStorage key the rest of the app already writes on login. */
const getToken = (): string | null => localStorage.getItem("token");

const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId =
      "sess_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
};

export const resetChatSession = (): void => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

/**
 * Sends a user message to the Baker AI Agent via the n8n webhook.
 * Includes the JWT (if logged in) so n8n's HTTP Request tool nodes can
 * forward it as `Authorization: Bearer <token>` to Flask — Flask remains
 * the only place that ever validates the token or touches the database.
 */
export const sendChatMessage = async (
  message: string,
  opts?: { signal?: AbortSignal }
): Promise<ChatMessage> => {
  const sessionId = getOrCreateSessionId();
  const token = getToken();

  const res = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: opts?.signal,
    body: JSON.stringify({
      message,
      sessionId,
      // n8n forwards this to Flask tool calls; Flask validates it normally.
      token,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chatbot request failed (${res.status})`);
  }

  const data: N8nChatResponse = await res.json();

  return {
    id: "a_" + Date.now().toString(36),
    role: "assistant",
    text: data.response ?? "Sorry, I didn't quite catch that.",
    timestamp: data.timestamp ?? new Date().toISOString(),
    redirectUrl: data.redirectUrl,
    redirectLabel: data.redirectLabel,
    products: data.products,
  };
};