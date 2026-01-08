export async function handler(event) {
  try {
    const { filePath } = JSON.parse(event.body);

    const token = process.env.GITHUB_TOKEN;
    const owner = "khushi91981";
    const repo = "dadi-nani-achar-pwa";

    const path = `public${filePath}`;

    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json"
        }
      }
    );

    const file = await fileRes.json();

    await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json"
        },
        body: JSON.stringify({
          message: "Delete recipe",
          sha: file.sha
        })
      }
    );

    return { statusCode: 200, body: "Deleted" };

  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: e.message };
  }
}
