import dotenv from "dotenv";
import { createApp } from "./app";
import { prisma } from "./db";

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const app = createApp();

if (process.env.NODE_ENV !== "test") {
  app.use((req, _res, next) => {
    // eslint-disable-next-line no-console
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

prisma
  .$connect()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to connect DB:", err);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
