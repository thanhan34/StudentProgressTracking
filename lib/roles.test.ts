import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_ROLE, ROLE_LABELS, canAccessContent, isUserRole, resolveRole } from "./roles";

function user(email = "member@example.com", status = "verified", role?: unknown) {
  return {
    primaryEmailAddressId: "email_1",
    emailAddresses: [{ id: "email_1", emailAddress: email, verification: { status } }],
    publicMetadata: { role },
  };
}

test("only the five defined role identifiers are accepted", () => {
  for (const role of Object.keys(ROLE_LABELS)) assert.equal(isUserRole(role), true);
  for (const role of ["owner", "toString", "__proto__", null, undefined, 1]) assert.equal(isUserRole(role), false);
});

test("new users and invalid metadata receive the least privileged default", () => {
  assert.equal(DEFAULT_ROLE, "pending");
  assert.equal(resolveRole(user()), DEFAULT_ROLE);
  assert.equal(resolveRole(user("member@example.com", "verified", "owner")), DEFAULT_ROLE);
});

test("pending, missing, and unknown roles cannot access content", () => {
  for (const role of ["pending", undefined, null, "owner", "toString"]) assert.equal(canAccessContent(role), false);
  assert.equal(canAccessContent(resolveRole(user())), false);
});

test("all four approved roles can access content", () => {
  for (const role of ["admin", "admin_assistant", "teaching_assistant", "reserve_teaching_assistant"]) {
    assert.equal(canAccessContent(role), true);
  }
});

test("assigned roles are preserved", () => {
  for (const role of Object.keys(ROLE_LABELS)) assert.equal(resolveRole(user("member@example.com", "verified", role)), role);
});

test("verified default admin is recognized case-insensitively and cannot be demoted", () => {
  assert.equal(resolveRole(user("DTAN42@gmail.com")), "admin");
  assert.equal(resolveRole(user("dtan42@gmail.com", "verified", DEFAULT_ROLE)), "admin");
});

test("unverified or secondary admin email does not grant admin", () => {
  assert.equal(resolveRole(user("dtan42@gmail.com", "unverified")), DEFAULT_ROLE);
  const secondary = user("dtan42@gmail.com");
  secondary.primaryEmailAddressId = "email_other";
  assert.equal(resolveRole(secondary), DEFAULT_ROLE);
});