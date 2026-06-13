"use client";

const riskColors: Record<string, string> = {
  HIGH: "#dc2626",
  MEDIUM: "#d97706",
  LOW: "#16a34a",
};

const riskBgColors: Record<string, string> = {
  HIGH: "#fef2f2",
  MEDIUM: "#fffbeb",
  LOW: "#f0fdf4",
};

export default function ReportTemplate({ contract }: { contract: any }) {
  const reviews = contract.clauseReviews || [];
  const totalFlagged = reviews.filter((r: any) => r.riskLevel === "HIGH" || r.riskLevel === "MEDIUM").length;
  const highRisk = reviews.filter((r: any) => r.riskLevel === "HIGH").length;
  const date = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div id="report-content" style={{ width: "210mm", padding: "20mm 15mm", fontFamily: "Inter, system-ui, sans-serif", color: "#1a1a2e", background: "#fff" }}>
      {/* Cover */}
      <div style={{ textAlign: "center", padding: "30mm 0 20mm", borderBottom: "3px solid #d97706", marginBottom: "10mm" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: "#1a1a2e" }}>ClauseGuard India</h1>
        <p style={{ fontSize: "14px", color: "#d97706", margin: "4px 0 20px", letterSpacing: "2px", textTransform: "uppercase" }}>Contract Review Report</p>
        <h2 style={{ fontSize: "22px", fontWeight: 600, margin: "8px 0" }}>{contract.title}</h2>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0" }}>Review Date: {date}</p>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0" }}>
          {contract.jurisdictionGuess} &middot; {contract.governingLawGuess}
        </p>
      </div>

      {/* Summary */}
      <div style={{ marginBottom: "10mm" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px", color: "#1a1a2e" }}>Review Summary</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 12px", background: riskBgColors["HIGH"], borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ fontWeight: 600, color: riskColors["HIGH"] }}>{highRisk}</span>
                <span style={{ color: "#6b7280", marginLeft: "4px" }}>High Risk Clauses</span>
              </td>
              <td style={{ padding: "8px 12px", background: riskBgColors["MEDIUM"], borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ fontWeight: 600, color: riskColors["MEDIUM"] }}>{totalFlagged - highRisk}</span>
                <span style={{ color: "#6b7280", marginLeft: "4px" }}>Medium Risk Clauses</span>
              </td>
              <td style={{ padding: "8px 12px", background: riskBgColors["LOW"], borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ fontWeight: 600, color: riskColors["LOW"] }}>{reviews.length - totalFlagged}</span>
                <span style={{ color: "#6b7280", marginLeft: "4px" }}>Low Risk Clauses</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: "10mm" }}>
        <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.6, margin: 0 }}>
          This report contains the full AI-powered review of <strong>{contract.title}</strong>, conducted by ClauseGuard India.
          {reviews.length} clauses were analyzed, with <strong>{totalFlagged}</strong> flagged clauses requiring attention.
          Each flagged clause includes a risk assessment, suggested redline wording, and the relevant evidence source.
        </p>
      </div>

      {/* Flagged Clauses */}
      {reviews
        .filter((r: any) => r.riskLevel === "HIGH" || r.riskLevel === "MEDIUM")
        .map((review: any, i: number) => {
          const clause = contract.clauses?.find((c: any) => c.id === review.clauseId);
          const redline = review.redlineSuggestions?.[0];
          const evidence = review.evidenceSources?.[0];

          return (
            <div key={review._id} style={{ marginBottom: "8mm", pageBreakInside: "avoid" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{
                  display: "inline-block", padding: "2px 10px", borderRadius: "4px",
                  fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px",
                  color: "#fff", background: riskColors[review.riskLevel] || "#6b7280",
                }}>
                  {review.riskLevel}
                </span>
                <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0, color: "#1a1a2e" }}>
                  Clause {i + 1}: {clause?.heading || review.clauseType?.replace(/_/g, " ") || "Untitled Clause"}
                </h4>
              </div>

              <div style={{ padding: "8px 12px", background: "#f9fafb", borderRadius: "6px", marginBottom: "6px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Summary</p>
                <p style={{ fontSize: "12px", color: "#374151", margin: 0, lineHeight: 1.5 }}>{review.summary || "No summary available."}</p>
              </div>

              {redline && (
                <div style={{ padding: "8px 12px", background: "#f0fdf4", borderRadius: "6px", marginBottom: "6px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#16a34a", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Suggested Redline</p>
                  <p style={{ fontSize: "12px", color: "#374151", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>
                    &ldquo;{redline.suggestedText?.substring(0, 300)}{redline.suggestedText?.length > 300 ? "..." : ""}&rdquo;
                  </p>
                  <p style={{ fontSize: "11px", color: "#6b7280", margin: "4px 0 0" }}>{redline.rationale}</p>
                </div>
              )}

              {evidence && (
                <div style={{ padding: "8px 12px", background: "#fff7ed", borderRadius: "6px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#d97706", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Evidence Source</p>
                  <p style={{ fontSize: "12px", color: "#374151", margin: 0 }}>
                    <strong>{evidence.title}</strong>
                    {evidence.ruleName && <span> &middot; {evidence.ruleName}</span>}
                    {evidence.preferredLanguage && <span> &middot; Preferred: {evidence.preferredLanguage}</span>}
                  </p>
                </div>
              )}
            </div>
          );
        })}

      {/* Footer */}
      <div style={{ marginTop: "15mm", paddingTop: "5mm", borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
        <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>
          Generated by ClauseGuard India &middot; {date} &middot; This is an AI-generated review and should be verified by a qualified legal professional.
        </p>
      </div>
    </div>
  );
}
