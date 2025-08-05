import { build } from "./build-scripts/build.js";
import handler from "serve-handler";
import http from "node:http";

await build();

const server = http.createServer((request, response) => {
  return handler(request, response, { public: "site/dist" });
});

server.listen(3000, () => {
  console.log("Running at http://localhost:3000");
});
