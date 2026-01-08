import fs from "fs";
import path from "path";

export async function handler(event) {
  try {
    const { fileName, fileBase64 } = JSON.parse(event.body);

    if (!fileName || !fileBase64) {
      return { statusCode: 400, body: "Invalid payload" };
    }

    const recipesDir = path.join(process.cwd(), "public", "recipes");
    if (!fs.existsSync(recipesDir)) {
      fs.mkdirSync(recipesDir, { recursive: true });
    }

    const filePath = path.join(recipesDir, fileName);
    const buffer = Buffer.from(fileBase64, "base64");

    fs.writeFileSync(filePath, buffer);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
