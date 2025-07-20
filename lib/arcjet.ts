import "server-only";

import arcjet, {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,
  createMiddleware,
} from "@arcjet/next";
import { env } from "./env";

export { detectBot, fixedWindow, protectSignup, sensitiveInfo, shield, slidingWindow, createMiddleware };

export default arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["fingerprint"],
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});
