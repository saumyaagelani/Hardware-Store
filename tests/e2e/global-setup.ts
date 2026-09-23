import fs from "node:fs";

export default function globalSetup() {
  // Fresh demo data for every run.
  fs.rmSync(".data-e2e", { recursive: true, force: true });
}
