import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

function fmtUsd(value) {
  const n = Number(value || 0);
  if (!n) return "N/A";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function scoreColor(score) {
  const t = clamp((score || 0) / 100, 0, 1);
  // red -> yellow -> green
  const r = Math.round(255 * (1 - t) + 40 * t);
  const g = Math.round(80 * (1 - t) + 255 * t);
  const b = Math.round(60 * (1 - t) + 110 * t);
  return `rgb(${r},${g},${b})`;
}

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "Token";
  const symbol = searchParams.get("symbol") || "";
  const score = Number(searchParams.get("score") || 0);
  const freshness = searchParams.get("freshness") || "";
  const action = searchParams.get("action") || "";
  const mcap = searchParams.get("mcap") || "";
  const vol24h = searchParams.get("vol24h") || "";
  const captured = searchParams.get("captured") || "";
  const image = searchParams.get("image") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          padding: "48px",
          background:
            "radial-gradient(900px 420px at 20% 20%, rgba(68,210,255,0.18), rgba(0,0,0,0)), radial-gradient(900px 420px at 80% 20%, rgba(120,255,170,0.12), rgba(0,0,0,0)), linear-gradient(180deg, #0a0f16, #070b10)",
          color: "#e7eef8",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.10)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            boxShadow:
              "0 28px 90px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.10)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "28px 32px 18px 32px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} width={68} height={68} style={{ objectFit: "cover" }} />
                ) : (
                  <div style={{ fontSize: 18, opacity: 0.7 }}>AL</div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 14, opacity: 0.7, letterSpacing: 2 }}>
                  ALPHA LEAK
                </div>
                <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.1 }}>
                  {name}
                  {symbol ? (
                    <span style={{ fontSize: 18, opacity: 0.8, marginLeft: 10 }}>
                      {symbol}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: 28,
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 44, fontWeight: 800, color: scoreColor(score) }}>
                {score || 0}
              </div>
              <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 2 }}>SCORE</div>
            </div>
          </div>

          <div style={{ display: "flex", flex: 1, padding: "22px 32px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 16, opacity: 0.75 }}>Captured</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{captured || "—"}</div>

              <div style={{ height: 18 }} />

              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    flex: 1,
                    borderRadius: 20,
                    padding: "16px 18px",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.65, letterSpacing: 2 }}>
                    WINDOW
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#6cc6ff" }}>
                    {freshness || "—"}
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    borderRadius: 20,
                    padding: "16px 18px",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.65, letterSpacing: 2 }}>
                    EDGE
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#56ffb7" }}>
                    {action || "—"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <div
                  style={{
                    flex: 1,
                    borderRadius: 20,
                    padding: "16px 18px",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.65, letterSpacing: 2 }}>
                    MCAP
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>{mcap || "N/A"}</div>
                </div>
                <div
                  style={{
                    flex: 1,
                    borderRadius: 20,
                    padding: "16px 18px",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.65, letterSpacing: 2 }}>
                    24H VOL
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>{vol24h || "N/A"}</div>
                </div>
              </div>
            </div>

            <div style={{ width: 18 }} />

            <div
              style={{
                width: 320,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                paddingLeft: 26,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 14, opacity: 0.65, letterSpacing: 2 }}>
                  OPEN LINKS
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, opacity: 0.92 }}>
                  DEX / Website / X
                </div>
                <div style={{ fontSize: 14, opacity: 0.65, lineHeight: 1.35 }}>
                  Delivered automatically when score crosses the threshold.
                </div>
              </div>
              <div style={{ fontSize: 12, opacity: 0.55 }}>alpha-leak</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

