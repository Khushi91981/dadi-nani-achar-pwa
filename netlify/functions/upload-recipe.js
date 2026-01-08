export async function handler(event) {
  try {
    const { title, uploadedBy, fileName, fileBase64 } = JSON.parse(event.body);

    const token = process.env.GITHUB_TOKEN;
    const owner = "khushi91981";
    const repo = "dadi-nani-achar-pwa";
    const path = `public/recipes/${fileName}`;

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // 1️⃣ Check if file exists (for replace)
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

    // 2️⃣ Upload / Replace
    const upload = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        message: sha ? `Replace recipe ${fileName}` : `Upload recipe ${fileName}`,
        content: fileBase64,
        sha
      })
    });

    if (!upload.ok) {
      const err = await upload.text();
      throw new Error(err);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        fileUrl: `/recipes/${fileName}`
      })
    };

  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
}
