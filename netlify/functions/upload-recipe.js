export async function handler(event) {
  try {
    const { title, uploadedBy, fileName, fileBase64 } = JSON.parse(event.body);

    const token = process.env.GITHUB_TOKEN;
    const owner = "khushi91981";
    const repo = "dadi-nani-achar-pwa";

    const path = `public/recipes/${fileName}`;

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json"
        },
        body: JSON.stringify({
          message: `Upload recipe ${fileName}`,
          content: fileBase64
        })
      }
    );

    if (!res.ok) throw new Error("GitHub upload failed");

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        fileUrl: `/recipes/${fileName}`
      })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: err.message };
  }
}
