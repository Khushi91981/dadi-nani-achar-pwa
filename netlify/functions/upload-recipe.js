import fetch from "node-fetch";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { fileName, fileBase64, message } = JSON.parse(event.body);

    const owner = "Khushi1981";
    const repo = "dadi-nani-achar-pwa";
    const path = `public/recipes/${fileName}`;
    const token = process.env.GITHUB_TOKEN;

    const check = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const existing = check.ok ? await check.json() : null;

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          content: fileBase64,
          sha: existing?.sha
        })
      }
    );

    if (!res.ok) throw await res.text();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        url: `/recipes/${fileName}`
      })
    };

  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
}
