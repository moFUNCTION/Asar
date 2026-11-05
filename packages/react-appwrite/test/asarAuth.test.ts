// =============================================================
// ASAR (Athar / أثر) — Authentication & Profile Unit Tests
// =============================================================

import test from "node:test";
import assert from "node:assert/strict";
import { parseUserProfile, ASAR_COLLECTIONS, type AsarUserProfile } from "../src/index.ts";

test("ASAR Auth: users collection ID is strictly defined", () => {
  assert.equal(ASAR_COLLECTIONS.USERS, "users");
});

test("ASAR Auth: parseUserProfile safely extracts valid profile with defaults", () => {
  const profile = parseUserProfile({
    $id: "profile_101",
    userId: "usr_abc_456",
    name: "سارة أحمد",
    email: "sarah@example.com",
    role: "client",
    phone: "+966501234567",
    organization: "عائلة آل سعيد",
  });

  assert.ok(profile);
  assert.equal(profile.userId, "usr_abc_456");
  assert.equal(profile.name, "سارة أحمد");
  assert.equal(profile.email, "sarah@example.com");
  assert.equal(profile.role, "client");
  assert.equal(profile.phone, "+966501234567");
  assert.equal(profile.organization, "عائلة آل سعيد");
  assert.equal(profile.locale, "ar");
});

test("ASAR Auth: parseUserProfile strictly assigns 'admin' or defaults to 'client'", () => {
  const adminProfile = parseUserProfile({
    userId: "usr_admin",
    name: "مدير النظام",
    email: "admin@asar.audio",
    role: "admin",
  });
  assert.equal(adminProfile?.role, "admin");

  const arbitraryRoleProfile = parseUserProfile({
    userId: "usr_guest",
    name: "مستخدم",
    email: "user@asar.audio",
    role: "super_admin_fake",
  });
  assert.equal(arbitraryRoleProfile?.role, "client");
});

test("ASAR Auth: parseUserProfile handles null, empty and primitive inputs safely without throwing", () => {
  assert.equal(parseUserProfile(null), null);
  assert.equal(parseUserProfile(undefined), null);
  assert.equal(parseUserProfile("invalid string"), null);
  assert.equal(parseUserProfile(123), null);
});

