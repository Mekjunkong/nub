import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Nub";
  const subtitle = searchParams.get("subtitle") || "Plan Your Retirement";
  const score = searchParams.get("score");
  const survivalRate = searchParams.get("survivalRate");
  const gap = searchParams.get("gap");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4F7CF7 0%, #7C5CFC 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 60, fontWeight: "bold", marginBottom: 16 }}>{title}</div>
        <div style={{ fontSize: 28, opacity: 0.9, marginBottom: 40 }}>{subtitle}</div>
        <div style={{ display: "flex", gap: 40 }}>
          {score && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "20px 32px" }}>
              <div style={{ fontSize: 48, fontWeight: "bold" }}>{score}</div>
              <div style={{ fontSize: 16, opacity: 0.8 }}>Health Score</div>
            </div>
          )}
          {survivalRate && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "20px 32px" }}>
              <div style={{ fontSize: 48, fontWeight: "bold" }}>{survivalRate}%</div>
              <div style={{ fontSize: 16, opacity: 0.8 }}>Survival Rate</div>
            </div>
          )}
          {gap && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "20px 32px" }}>
              <div style={{ fontSize: 48, fontWeight: "bold" }}>{gap}</div>
              <div style={{ fontSize: 16, opacity: 0.8 }}>Retirement Gap</div>
            </div>
          )}
        </div>
        <div style={{ position: "absolute", bottom: 24, fontSize: 18, opacity: 0.7 }}>nub.finance</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
