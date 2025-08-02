import { h } from "./escape.js";

export function base(title, style, main) {
  return h`
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="icon"
          href="/icons/icon.png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/icons/icon-light.png"
          media="(prefers-color-scheme: dark)"
        />
        <link rel="stylesheet" type="text/css" href="/css/${style}" />
        <title>${title}</title>
      </head>

      <body>
        <main>$$${main}</main>
      </body>
    </html>
  `;
}
