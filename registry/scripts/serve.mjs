// Serves dist/ so fixtures can `shadcn add` from http://localhost:4400/r/{name}.json
import fs from "node:fs"
import http from "node:http"
import path from "node:path"

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../dist")
const port = Number(process.env.PORT ?? 4400)

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost")
    const file = path.join(root, path.normalize(decodeURIComponent(url.pathname)))
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end("not found")
      return
    }
    res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" })
    fs.createReadStream(file).pipe(res)
  })
  .listen(port, () => console.log(`registry on http://localhost:${port}/r/`))
