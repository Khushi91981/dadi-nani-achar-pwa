import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { filename, content } = JSON.parse(event.body);

    const repo = "Khushi91981/dadi-nani-achar-pwa";
    const path = `public/recipes/${filename}`;

    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Upload recipe ${filename}`,
          content
        })
      }
    );

    if (!res.ok) throw new Error("GitHub upload failed");

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: `/recipes/${filename}`
      })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: e.message
      })
    };
  }
}
