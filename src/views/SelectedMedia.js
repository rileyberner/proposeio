// src/views/CampaignBrief.js
import React, { useContext, useState } from "react";
import { ProposalContext } from "../context/ProposalContext";
import config from "../config";

export default function CampaignBrief() {
  const { campaignBrief, setCampaignBrief } = useContext(ProposalContext);
  const [savedTemplates, setSavedTemplates] = useState([
    { name: "Overall Murals Proposal Grid (2025)", isVendorDefault: true },
    { name: "Talon Master Grid", isVendorDefault: false },
    { name: "OOH Standard Template", isVendorDefault: false },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState("Overall Murals Proposal Grid (2025)");
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const gridInUse = campaignBrief.gridFile ? campaignBrief.gridFile.name : selectedTemplate;

  const handleChange = (field, value) => {
    setCampaignBrief({ ...campaignBrief, [field]: value });
  };

  const handleFileChange = (e) => {
    setCampaignBrief({ ...campaignBrief, gridFile: e.target.files[0] });
  };

  const handleExtractClick = async () => {
    const email = campaignBrief.clientEmail;
    if (!email || email.length < 20) return;

    setLoading(true);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an assistant that extracts structured campaign info from messy agency emails.
Always return ONLY valid JSON like this, even if fields are missing:
{
  markets: [{ city: string, submarkets: string[] }],
  flightDates: { start: string, end: string, duration: string },
  audience: string,
  formats: string[],
  notes: string[],
  dueDate: string
}

Important:
- If a field is not found, return an empty string or empty array.
- Provide the most feasible date if only partial is given (e.g. "9/29 x 2 weeks" => start: "2025-09-29", duration: "2 weeks") or (any time in September start => "2025-09-1", duration "4 Weeks") (noting all start dates will need to fall on a monday).
- If a location like “Soho” is given, guess its city ("New York") and assign Soho as submarket. If a nearby market is given (e.g. Santa Monica) include nearby markets in the proximity like Venice)
- Always return valid JSON without commentary.`
            },
            { role: "user", content: email },
          ],
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      console.log("🧠 Raw OpenAI content:", content);

      const jsonStart = content.indexOf("{");
      const jsonEnd = content.lastIndexOf("}") + 1;
      const jsonSubstring = content.substring(jsonStart, jsonEnd);

      try {
        const parsed = JSON.parse(jsonSubstring);
        setExtractedData(parsed);
      } catch (err) {
        console.error("❌ Failed to extract campaign info from OpenAI:", err);
        console.warn("🔍 Raw content for debugging:", content);
        setExtractedData({
          error: "Sorry, we couldn’t extract any structured info from this brief. Please double check the input."
        });
      }
    } catch (err) {
      console.error("Failed to extract content from OpenAI:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Campaign Brief</h1>

      <label>Proposal Brief</label>
      <br />
      <textarea
        rows={10}
        value={campaignBrief.clientEmail}
        onChange={(e) => handleChange("clientEmail", e.target.value)}
        style={{ width: "100%", border: "1px solid green" }}
        placeholder="Paste agency email here..."
      />

      <button onClick={handleExtractClick} style={{ marginTop: "1rem" }}>
        {loading ? "⏳ Extracting..." : "Extract Brief Info"}
      </button>

      <br />
      <label>Upload Media Grid</label>
      <br />
      <input type="file" onChange={handleFileChange} />

      <div style={{ marginTop: "1rem" }}>
        <label>Or Select Saved Media Grid</label>
        <br />
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          style={{ width: "60%", padding: "0.5rem" }}
        >
          {savedTemplates
            .sort((a, b) => (b.isVendorDefault ? -1 : 1))
            .map((template) => (
              <option key={template.name} value={template.name}>
                {template.name} {template.isVendorDefault ? "(Vendor Default)" : ""}
              </option>
            ))}
        </select>
      </div>

      <p style={{ marginTop: "1rem" }}>
        <strong>Active Grid:</strong> {gridInUse}
      </p>
    </div>
  );
}
