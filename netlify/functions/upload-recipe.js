export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed"
      };
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("Missing GITHUB_TOKEN");
    }

    const data = JSON.parse(event.body);

    const {
      fileName,
      fileBase64,
      title,
      uploadedBy
    } = data;

    if (!fileName || !fileBase64) {
      throw new Error("Invalid payload");
    }

    const repo = "Khushi91981/dadi-nani-achar-pwa";
    const path = `public/recipes/${fileName}`;

    const githubUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

    const uploadRes = await fetch(githubUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json"
      },
      body: JSON.stringify({
        message: `Add recipe: ${title}`,
        content: fileBase64
      })
    });

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      throw new Error(uploadData.message || "GitHub upload failed");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        url: `/recipes/${fileName}`
      })
    };

  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };
  }
}
