/**
 * MCP Connect — documentation on connecting to MCP servers and their available tools.
 */

import * as React from "react";
import { useMcpServers } from "../../api/hooks";
import { ServerIcon, TerminalIcon, ShieldIcon, CopyIcon } from "lucide-react";

export default function McpConnectPage() {
  const { data, isLoading, error } = useMcpServers();
  const [copied, setCopied] = React.useState("");

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

  const communityToolsServer = servers.find((s: any) => s.id === "community-tools");
  const otherServers = servers.filter((s: any) => s.id !== "community-tools");

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white text-sm font-bold">1</div>
            <div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Authenticate</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Sign in to get a JWT token via OIDC Authorization Code Flow + PKCE.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white text-sm font-bold">2</div>
            <div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Connect</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Point your MCP client to the SSE endpoint with your Bearer token in the Authorization header.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white text-sm font-bold">3</div>
            <div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Call Tools</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                List available tools via MCP protocol, then invoke them with the documented parameters.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Tools MCP Server */}
      {communityToolsServer && (
        <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-3 mb-4">
            <ServerIcon className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{communityToolsServer.name}</h2>
            {communityToolsServer.auth_required && (
              <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <ShieldIcon className="h-3 w-3" /> OIDC required
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">{communityToolsServer.description}</p>

          {/* Connection info */}
          <div className="mb-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Connection</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm font-mono text-neutral-700 dark:text-neutral-300 truncate">
                {communityToolsServer.config.url}
              </code>
              <button
                onClick={() => copyToClipboard(communityToolsServer.config.url, "url")}
                className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
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
            <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">Available Tools</h3>
            <div className="space-y-4">
              {communityToolsServer.tools?.map((tool: any) => (
                <div key={tool.name} className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-semibold text-primary-500 dark:text-primary-400">{tool.name}</code>
                    <button
                      onClick={() => copyToClipboard(tool.name, `tool-${tool.name}`)}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Copy tool name"
                    >
                      {copied === `tool-${tool.name}` ? (
                        <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                      ) : (
                        <CopyIcon className="h-3.5 w-3.5 text-neutral-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">{tool.description}</p>
                  {tool.parameters && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Parameters:</span>
                      <div className="space-y-0.5">
                        {Object.entries(tool.parameters).map(([key, value]) => (
                          <div key={key} className="flex gap-2 text-xs">
                            <code className="font-mono text-neutral-700 dark:text-neutral-300 min-w-[80px]">{key}</code>
                            <span className="text-neutral-500 dark:text-neutral-400">{value}</span>
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
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Other Servers</h2>
          <div className="flex flex-col gap-4">
            {otherServers.map((server: any) => (
              <div key={server.id} className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                <div className="flex items-center justify-between mb-2">
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
                    onClick={() => copyToClipboard(server.config.url, `url-${server.id}`)}
                    className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Copy endpoint URL"
                  >
                    {copied === `url-${server.id}` ? (
                      <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                    ) : (
                      <CopyIcon className="h-3.5 w-3.5 text-neutral-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">{server.description}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-1 text-xs font-mono text-neutral-700 dark:text-neutral-300 truncate">
                    {server.config.url}
                  </code>
                  <span className="text-xs text-neutral-400 shrink-0 uppercase">{server.transport}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Example cURL */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Example cURL Request</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Test the community-tools server from the command line:</p>
        <div className="relative">
          <pre className="rounded-lg bg-neutral-900 text-blue-200 p-4 text-xs font-mono overflow-x-auto">
{`# Authenticate and get a token first (OIDC flow)
# Then call the MCP server:

curl -X POST http://localhost:8000/mcp/community-tools/sse \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "post_usecase", "arguments": {"title": "My Use Case", "description": "Description", "tags": ["ai", "demo"]}}, "id": 1}'`}
          </pre>
          <button
            onClick={() => copyToClipboard(
              `# Authenticate and get a token first (OIDC flow)\n# Then call the MCP server:\n\ncurl -X POST http://localhost:8000/mcp/community-tools/sse \\\n  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "post_usecase", "arguments": {"title": "My Use Case", "description": "Description", "tags": ["ai", "demo"]}}, "id": 1}'`,
              "curl"
            )}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors"
            title="Copy to clipboard"
          >
            {copied === "curl" ? (
              <span className="text-xs text-green-400">✓</span>
            ) : (
              <CopyIcon className="h-3.5 w-3.5 text-neutral-400" />
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
