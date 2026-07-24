import { NextResponse } from "next/server";

export const runtime = "edge";
const FREE_PRD_LIMIT = 3;

const systemPrompt = `You are a principal product manager and an exceptional product writer.
Create a decision-ready Product Requirements Document in Markdown.
Use the supplied facts, make modest and clearly marked assumptions, and never invent research or customer evidence.
Use these sections: Executive summary, Context and problem, Goals and success metrics, Non-goals, Target users, User stories, Scope, Functional requirements, Experience requirements, Technical considerations, Risks and mitigations, Launch plan, and Open questions.
Requirements must be specific and testable. Metrics should include a baseline placeholder when unknown.
Return only the PRD in clean Markdown—no preamble or code fence.`;

function getClientIp(request: Request) {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local-development"
  );
}

async function usageKey(request: Request) {
  const salt = process.env.RATE_LIMIT_SALT || "briefly-rate-limit";
  const data = new TextEncoder().encode(`${salt}:${getClientIp(request)}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `briefly:usage:${hash}`;
}

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function redisCommand(command: string, key: string) {
  const config = redisConfig();
  if (!config) throw new Error("RATE_LIMIT_NOT_CONFIGURED");
  const response = await fetch(
    `${config.url}/${command}/${encodeURIComponent(key)}`,
    { headers: { Authorization: `Bearer ${config.token}` }, cache: "no-store" },
  );
  if (!response.ok) throw new Error("RATE_LIMIT_UNAVAILABLE");
  const data = await response.json();
  return Number(data.result || 0);
}

async function currentUsage(request: Request) {
  return redisCommand("get", await usageKey(request));
}

export async function GET(request: Request) {
  try {
    const used = await currentUsage(request);
    return NextResponse.json({
      limit: FREE_PRD_LIMIT,
      used,
      remaining: Math.max(0, FREE_PRD_LIMIT - used),
    });
  } catch (error) {
    const configurationError =
      error instanceof Error && error.message === "RATE_LIMIT_NOT_CONFIGURED";
    return NextResponse.json(
      {
        error: configurationError
          ? "Free usage is not configured yet."
          : "Usage information is temporarily unavailable.",
      },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  let reservationKey = "";
  try {
    const body = await request.json();
    const { title, idea, audience, problem, constraints, tone } = body ?? {};
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "PRD generation is not configured yet." },
        { status: 503 },
      );
    }
    if (!idea || !problem) {
      return NextResponse.json({ error: "The product idea and problem are required." }, { status: 400 });
    }

    reservationKey = await usageKey(request);
    const used = await redisCommand("incr", reservationKey);
    if (used > FREE_PRD_LIMIT) {
      await redisCommand("decr", reservationKey).catch(() => undefined);
      return NextResponse.json(
        {
          error: "You have used all three free PRDs.",
          limit: FREE_PRD_LIMIT,
          used: FREE_PRD_LIMIT,
          remaining: 0,
        },
        { status: 429 },
      );
    }

    const deepSeek = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.35,
        max_tokens: 4000,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Working title: ${title || "Untitled product"}
Product idea: ${idea}
Target users: ${audience || "Not yet defined"}
Problem: ${problem}
Constraints: ${constraints || "None supplied"}
Writing style: ${tone || "Clear and concise"}`,
          },
        ],
      }),
    });

    const data = await deepSeek.json();
    if (!deepSeek.ok) {
      await redisCommand("decr", reservationKey).catch(() => undefined);
      const message = data?.error?.message || "DeepSeek rejected the request. Check your key and try again.";
      return NextResponse.json({ error: message }, { status: deepSeek.status });
    }

    const document = data?.choices?.[0]?.message?.content;
    if (!document) {
      await redisCommand("decr", reservationKey).catch(() => undefined);
      return NextResponse.json({ error: "DeepSeek returned an empty document." }, { status: 502 });
    }
    const finalUsage = await currentUsage(request);
    return NextResponse.json({
      document,
      limit: FREE_PRD_LIMIT,
      used: finalUsage,
      remaining: Math.max(0, FREE_PRD_LIMIT - finalUsage),
    });
  } catch (error) {
    if (reservationKey) {
      await redisCommand("decr", reservationKey).catch(() => undefined);
    }
    const configurationError =
      error instanceof Error && error.message === "RATE_LIMIT_NOT_CONFIGURED";
    return NextResponse.json(
      {
        error: configurationError
          ? "Free usage is not configured yet."
          : "The request could not be completed. Please try again.",
      },
      { status: configurationError ? 503 : 500 },
    );
  }
}
