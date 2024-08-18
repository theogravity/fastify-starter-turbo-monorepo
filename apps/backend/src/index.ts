import { SERVER_PORT } from "./constants";
import { startServer } from "./server";

await startServer({ port: SERVER_PORT });
