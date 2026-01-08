export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { fileName, fileBase64 } = JSON.parse(event.body);

    if (!fileName || !fileBase64) {
      return { statusCode: 400, body: "Missing data" };
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = "Khushi91981";               // 👈 your username
    const REPO = "dadi-nani-achar-pwa";         // 👈 repo name
    const BRANCH = "main";
    const PATH = `public/recipes/${fileName}`;

    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;

    // 🔍 Check if file exists (for replace)
    const existingRes = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json"
      }
    });

    let sha = null;
    if (existingRes.ok) {
      const json = await existingRes.json();
      sha = json.sha;
    }

    // ⬆ Upload / Replace
    const uploadRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        message: sha ? `Replace recipe ${fileName}` : `Add recipe ${fileName}`,
        content: fileBase64,
        branch: BRANCH,
        sha
      })
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      throw new Error(err);
    }

    const publicUrl = `https://${OWNER}.github.io/${REPO}/recipes/${fileName}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ fileUrl: publicUrl })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
