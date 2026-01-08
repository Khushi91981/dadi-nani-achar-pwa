import { Buffer } from "buffer";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { fileName, fileBase64 } = JSON.parse(event.body || "{}");

    if (!fileName || !fileBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing file data" })
      };
    }

    const repo = "Khushi1981/dadi-nani-achar-pwa"; // ⚠️ change if needed
    const path = `public/recipes/${fileName}`;
    const token = process.env.GITHUB_TOKEN;

    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

    const content = Buffer.from(fileBase64, "base64").toString("base64");

    // check if file exists (for replace)
    let sha = null;
    const check = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      }
    });

    if (check.ok) {
      const existing = await check.json();
      sha = existing.sha;
    }

    const res = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: sha ? "Replace recipe file" : "Upload recipe file",
        content,
        sha
      })
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(t);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        filePath: `/recipes/${fileName}`
      })
    };

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || "Upload failed"
      })
    };
  }
};
