import { NextResponse } from "next/server";
import { formatPdfData, type PdfData } from "@/lib/pdf-generator";

export async function POST(request: Request) {
  try {
    const body: PdfData = await request.json();
    const formatted = formatPdfData(body);

    // Build a simple HTML-based PDF (lightweight alternative to @react-pdf/renderer
    // for server-side generation without React rendering context)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #1E293B; }
    .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #4F7CF7; padding-bottom: 16px; }
    .title { font-size: 24px; font-weight: bold; color: #4F7CF7; }
    .subtitle { font-size: 14px; color: #94A3B8; margin-top: 4px; }
    .section { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #E2E8F0; }
    .label { color: #64748B; font-size: 14px; }
    .value { font-weight: bold; font-size: 16px; }
    .disclaimer { margin-top: 32px; padding: 16px; background: #FEF9C3; border-radius: 8px; font-size: 11px; color: #92400E; }
    .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #94A3B8; }
    .date { font-size: 12px; color: #94A3B8; text-align: center; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${formatted.title}</div>
    <div class="subtitle">${formatted.subtitle}</div>
  </div>
  <div class="date">Generated: ${body.generatedAt || new Date().toISOString()}</div>
  ${formatted.sections.map((s) => `
    <div class="section">
      <span class="label">${s.label}</span>
      <span class="value">${s.value}</span>
    </div>
  `).join("")}
  <div class="disclaimer">${formatted.disclaimer}</div>
  <div class="footer">Nub - Plan Your Retirement with Confidence | nub.finance</div>
</body>
</html>`;

    // Return HTML that can be printed to PDF client-side
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="nub-${body.planType}-report.html"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
