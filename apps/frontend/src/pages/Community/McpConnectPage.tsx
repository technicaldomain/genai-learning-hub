/**
 * MCP Connect — documentation on connecting to MCP servers and their available tools.
 */

import * as React from "react";
import { useMcpServers } from "../../api/hooks";
import { ServerIcon, ShieldIcon, CopyIcon } from "lucide-react";
import { getMcpBaseUrl } from "../../runtime-config";

export default function McpConnectPage() {
  const { data, isLoading, error } = useMcpServers();
  const [copied, setCopied] = React.useState("");
  const mcpBaseUrl = getMcpBaseUrl();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <svg
          className="h-10 w-10 animate-spin text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30">
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load MCP servers.</p>
      </div>
    );
  }

  const servers = data?.data ?? [];

  const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";

  const resolveEndpointUrl = (rawUrl: string | undefined, serverId: string): string => {
    const fallbackPath = `${mcpBaseUrl}/${serverId}/sse`;

    if (!rawUrl) {
      return `${browserOrigin}${fallbackPath}`;
    }

    try {
      const parsed = new URL(rawUrl);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        return `${browserOrigin}${parsed.pathname}`;
      }
      return parsed.toString();
    } catch {
      if (rawUrl.startsWith("/")) {
        return `${browserOrigin}${rawUrl}`;
      }
      return `${browserOrigin}/${rawUrl.replace(/^\/+/, "")}`;
    }
  };

  const resolvedServers = servers.map((server: any) => ({
    ...server,
    resolvedUrl: resolveEndpointUrl(server?.config?.url, server.id),
  }));

  const communityToolsServer = resolvedServers.find((s: any) => s.id === "community-tools");
  const otherServers = resolvedServers.filter((s: any) => s.id !== "community-tools");
  const communityToolsUrl = communityToolsServer?.resolvedUrl || `${browserOrigin}${mcpBaseUrl}/community-tools/sse`;
  const claudeAddCommand = `claude mcp add genai-learning-hub --transport http --url ${communityToolsUrl}`;
  const qwenAddCommand = `qwen mcp add --transport http genai-learning-hub ${communityToolsUrl}`;
  const openCodeConfig = `{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "genai-learning-hub": {
      "type": "remote",
      "url": "${communityToolsUrl}",
      "enabled": true
    }
  }
}`;
  const clientGuides = [
    {
      name: "Claude CLI",
      description: "Add the remote MCP server from terminal.",
      command: claudeAddCommand,
      steps: [
        "Run the add command below",
        "If prompted, authenticate in browser",
        "Reconnect and test tools",
      ],
    },
    {
      name: "Qwen CLI",
      description: "Add the server using HTTP transport and the SSE endpoint URL.",
      command: qwenAddCommand,
      steps: [
        "Run the add command below",
        "If auth is requested, complete browser sign-in",
        "Verify the server appears in the MCP list",
      ],
    },
    {
      name: "OpenCode",
      description: "Configure the MCP server in opencode.json, then run auth.",
      command: "opencode mcp auth genai-learning-hub",
      snippet: openCodeConfig,
      steps: [
        "Create or edit opencode.json with the config below",
        "Run the auth command to open browser OAuth",
        "Use opencode mcp list to confirm connection",
      ],
    },
    {
      name: "VS Code",
      description: "Add a remote MCP server in VS Code MCP settings using HTTP transport.",
      steps: [
        "Open MCP server settings in VS Code",
        "Add server name: genai-learning-hub",
        `Set transport to http and URL to ${communityToolsUrl}`,
      ],
    },
    {
      name: "Antigravity",
      description: "Create a remote MCP server entry and point it to this endpoint.",
      steps: [
        "Open MCP integrations",
        "Create a new remote MCP server",
        `Use URL ${communityToolsUrl} with HTTP transport and sign in when prompted`,
      ],
    },
    {
      name: "Kiro",
      description: "Add the remote MCP endpoint in Kiro MCP connections.",
      steps: [
        "Open Kiro MCP configuration",
        "Add server: genai-learning-hub",
        `Set transport http with URL ${communityToolsUrl}`,
      ],
    },
    {
      name: "Cursor",
      description: "Add a remote MCP server in Cursor settings.",
      steps: [
        "Open Cursor MCP settings",
        "Add a remote server named genai-learning-hub",
        `Set transport to http and endpoint to ${communityToolsUrl}`,
      ],
    },
    {
      name: "IntelliJ IDEA",
      description: "Configure MCP via IntelliJ integration/plugin settings for remote servers.",
      link: "https://topbusinesssoftware.com/products/IntelliJ-IDEA/reviews/",
      steps: [
        "Open IntelliJ MCP/plugin configuration",
        "Create a remote server named genai-learning-hub",
        `Use HTTP transport and URL ${communityToolsUrl}`,
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">MCP Connect</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Connect your MCP client to our servers. Each server exposes tools accessible via SSE or stdio.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Getting Started</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">1</div>
            <div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Authenticate</h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Sign in to get a JWT token via OIDC Authorization Code Flow + PKCE.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">2</div>
            <div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Connect</h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Point your MCP client to the SSE endpoint with your Bearer token in the Authorization header.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">3</div>
            <div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Call Tools</h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                List available tools via MCP protocol, then invoke them with the documented parameters.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Tools MCP Server */}
      {communityToolsServer && (
        <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4 flex items-center gap-3">
            <ServerIcon className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{communityToolsServer.name}</h2>
            {communityToolsServer.auth_required && (
              <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <ShieldIcon className="h-3 w-3" /> OIDC required
              </span>
            )}
          </div>
          <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">{communityToolsServer.description}</p>

          {/* Connection info */}
          <div className="mb-6">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Connection</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-neutral-100 px-3 py-2 font-mono text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {communityToolsUrl}
              </code>
              <button
                onClick={() => copyToClipboard(communityToolsUrl, "url")}
                className="rounded-lg bg-neutral-100 p-2 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                title="Copy endpoint URL"
              >
                {copied === "url" ? (
                  <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                ) : (
                  <CopyIcon className="h-4 w-4 text-neutral-500" />
                )}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Auth: Bearer token</span>
              <span className="text-xs text-neutral-300 dark:text-neutral-600">·</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Transport: SSE</span>
            </div>
          </div>

          {/* Available tools */}
          <div>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Available Tools</h3>
            <div className="space-y-4">
              {communityToolsServer.tools?.map((tool: any) => (
                <div key={tool.name} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="mb-2 flex items-center justify-between">
                    <code className="text-sm font-semibold text-primary-500 dark:text-primary-400">{tool.name}</code>
                    <button
                      onClick={() => copyToClipboard(tool.name, `tool-${tool.name}`)}
                      className="rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Copy tool name"
                    >
                      {copied === `tool-${tool.name}` ? (
                        <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                      ) : (
                        <CopyIcon className="h-3.5 w-3.5 text-neutral-400" />
                      )}
                    </button>
                  </div>
                  <p className="mb-3 text-xs text-neutral-600 dark:text-neutral-400">{tool.description}</p>
                  {tool.parameters && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Parameters:</span>
                      <div className="space-y-0.5">
                        {Object.entries(tool.parameters).map(([key, value]) => (
                          <div key={key} className="flex gap-2 text-xs">
                            <code className="min-w-[80px] font-mono text-neutral-700 dark:text-neutral-300">{key}</code>
                            <span className="text-neutral-500 dark:text-neutral-400">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other MCP Servers */}
      {otherServers.length > 0 && (
        <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Other Servers</h2>
          <div className="flex flex-col gap-4">
            {otherServers.map((server: any) => (
              <div key={server.id} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ServerIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{server.name}</h3>
                    {server.auth_required && (
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                        <ShieldIcon className="h-3 w-3" /> OIDC required
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(server.resolvedUrl, `url-${server.id}`)}
                    className="rounded p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Copy endpoint URL"
                  >
                    {copied === `url-${server.id}` ? (
                      <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                    ) : (
                      <CopyIcon className="h-3.5 w-3.5 text-neutral-400" />
                    )}
                  </button>
                </div>
                <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">{server.description}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-neutral-100 px-2 py-1 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {server.resolvedUrl}
                  </code>
                  <span className="shrink-0 text-xs uppercase text-neutral-400">{server.transport}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Client guide */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">How to connect from different clients</h2>
        <p className="mb-5 text-sm text-neutral-600 dark:text-neutral-400">
          Use the exact client syntax below. The endpoint for this environment is shown in each command.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          {clientGuides.map((guide) => (
            <div key={guide.name} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-950/50">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{guide.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-neutral-600 dark:text-neutral-400">{guide.description}</p>
                  {guide.link && (
                    <a
                      href={guide.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs text-primary-600 underline-offset-2 hover:underline dark:text-primary-400"
                    >
                      Documentation
                    </a>
                  )}
                </div>
                <button
                  onClick={() => copyToClipboard(communityToolsUrl, `guide-${guide.name}`)}
                  className="rounded-md bg-white p-1.5 text-neutral-500 shadow-sm transition-colors hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                  title="Copy server URL"
                >
                  {copied === `guide-${guide.name}` ? (
                    <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                  ) : (
                    <CopyIcon className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <ul className="space-y-2">
                {guide.steps.map((step) => (
                  <li key={step} className="flex gap-2 text-xs leading-5 text-neutral-700 dark:text-neutral-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>

              {guide.command && (
                <div className="mt-3 rounded-lg bg-neutral-900 p-3">
                  <code className="block overflow-x-auto text-xs text-blue-200">{guide.command}</code>
                </div>
              )}

              {guide.snippet && (
                <div className="mt-3 rounded-lg bg-neutral-900 p-3">
                  <pre className="overflow-x-auto text-xs text-blue-200">{guide.snippet}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
