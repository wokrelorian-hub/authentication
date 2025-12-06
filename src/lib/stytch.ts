import * as stytch from "stytch";

// This file creates a single instance of the Stytch client
// that we will use across our entire backend.

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID || "",
  secret: process.env.STYTCH_SECRET || "",
  env: process.env.STYTCH_PROJECT_ENV === "live" 
    ? stytch.envs.live 
    : stytch.envs.test,
});

export default client;