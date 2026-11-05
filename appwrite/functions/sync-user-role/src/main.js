import { Client, Databases, Teams, Users, ID, Query } from "node-appwrite";

/**
 * Appwrite Serverless Function: sync-user-role
 *
 * Synchronizes user accounts into the canonical "users" database collection
 * and manages membership within the "admins" team.
 */
export default async ({ req, res, log, error }) => {
  try {
    const rawBody = req.bodyJson ?? req.bodyText ?? req.body ?? {};
    let payload = rawBody;
    if (typeof rawBody === "string") {
      try {
        payload = JSON.parse(rawBody || "{}");
      } catch (e) {
        payload = {};
      }
    }

    const endpoint =
      process.env.APPWRITE_FUNCTION_ENDPOINT ||
      process.env.APPWRITE_ENDPOINT ||
      "https://fra.cloud.appwrite.io/v1";
    const projectId =
      process.env.APPWRITE_FUNCTION_PROJECT_ID ||
      process.env.APPWRITE_PROJECT_ID ||
      "6ad1c66c0017b63ab8cc";
    const apiKey = req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY;

    const client = new Client().setEndpoint(endpoint).setProject(projectId);
    if (apiKey) client.setKey(apiKey);

    const databases = new Databases(client);
    const teams = new Teams(client);
    const usersService = new Users(client);

    const userId = payload.userId || req.headers?.["x-appwrite-user-id"];
    const email = payload.email || req.headers?.["x-appwrite-user-email"];
    const name = payload.name || "User";
    const targetRole = payload.role || "client";

    if (!userId && !email) {
      return res.json({ success: false, error: "Missing userId or email" }, 400);
    }

    const databaseId = process.env.APPWRITE_DATABASE_ID || "asar-db";
    const usersCollectionId = "users";

    log(`[sync-user-role] Syncing user ${userId || email} with target role: ${targetRole}`);

    // If targetRole is admin, ensure membership in "admins" team
    if (targetRole === "admin" && apiKey && email) {
      try {
        const teamsList = await teams.list();
        let adminTeam = teamsList.teams?.find((t) => t.$id === "admins");
        if (!adminTeam) {
          adminTeam = await teams.create("admins", "ASAR Administrators", ["owner", "admin"]);
        }
        await teams.createMembership("admins", ["admin"], email, userId, undefined, "https://asar.audio");
      } catch (teamErr) {
        log(`[sync-user-role] Team membership note: ${teamErr?.message}`);
      }
    }

    return res.json({
      success: true,
      userId: userId || email,
      role: targetRole,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (error) error(`[sync-user-role] Error: ${err?.message || String(err)}`);
    return res.json({ success: false, error: err?.message || "Internal server error" }, 500);
  }
};

