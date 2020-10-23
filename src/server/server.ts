import express from "express";
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from "path";
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.API_PORT || 3000;
const HOST = process.env.API_HOST;
const buildDir = path.join(process.cwd() + "/build");
const app = express();

app.use(express.static(buildDir));
app.use('/api',
  createProxyMiddleware({
    target: HOST,
    changeOrigin: true,
  })
);

app.get("/*", function (req, res) {
  res.sendFile(path.join(buildDir, "index.html"));
});

console.log("checking port", PORT);
app.listen(PORT, () => {
  console.log(`API now running on port: ${PORT}`);
});
