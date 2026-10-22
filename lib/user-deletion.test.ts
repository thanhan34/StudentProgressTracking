import assert from "node:assert/strict";
import { test } from "node:test";
import { ROLE_LABELS, type UserRole } from "./roles";
import { performUserDeletion, userDeletionRestriction } from "./user-deletion";

function setup(options: { role?: UserRole | null; targetEmail?: string; fail?: "access" | "read" | "delete" } = {}) {
  const calls: string[] = [];
  const dependencies = {
    getAccess: async () => {
      if (options.fail === "access") throw new Error("Unavailable");
      return options.role === null ? null : { userId: "user_admin", role: options.role ?? "admin" };
    },
    getUser: async (userId: string) => {
      calls.push(`read:${userId}`);
      if (options.fail === "read") throw new Error("Not found");
      return {
        primaryEmailAddressId: "email_1",
        emailAddresses: [{ id: "email_1", emailAddress: options.targetEmail ?? "member@example.com", verification: { status: "verified" } }],
        publicMetadata: {},
      };
    },
    deleteUser: async (userId: string) => {
      calls.push(`delete:${userId}`);
      if (options.fail === "delete") throw new Error("Unavailable");
    },
  };
  const form = new FormData();
  form.set("userId", "user_target");
  form.set("confirmUserId", "user_target");
  return { calls, dependencies, form };
}

test("only administrators can delete accounts, including direct server requests", async () => {
  for (const role of [null, ...Object.keys(ROLE_LABELS).filter((role) => role !== "admin")] as (UserRole | null)[]) {
    const { calls, dependencies, form } = setup({ role });
    assert.equal((await performUserDeletion(form, dependencies)).success, false);
    assert.deepEqual(calls, []);
  }
});

test("malformed, missing and unconfirmed targets never reach the user API", async () => {
  for (const id of ["", "other", "user_", "user_target/other"]) {
    const { calls, dependencies, form } = setup();
    form.set("userId", id);
    assert.equal((await performUserDeletion(form, dependencies)).success, false);
    assert.deepEqual(calls, []);
  }
  for (const confirmation of [null, "user_other"]) {
    const { calls, dependencies, form } = setup();
    if (confirmation === null) form.delete("confirmUserId");
    else form.set("confirmUserId", confirmation);
    assert.equal((await performUserDeletion(form, dependencies)).success, false);
    assert.deepEqual(calls, []);
  }
});

test("current account and bootstrap admin are protected on the server", async () => {
  const self = setup();
  self.form.set("userId", "user_admin");
  self.form.set("confirmUserId", "user_admin");
  assert.equal((await performUserDeletion(self.form, self.dependencies)).success, false);
  assert.deepEqual(self.calls, []);

  const bootstrap = setup({ targetEmail: "DTAN42@gmail.com" });
  assert.equal((await performUserDeletion(bootstrap.form, bootstrap.dependencies)).success, false);
  assert.deepEqual(bootstrap.calls, ["read:user_target"]);
});

test("admin deletes only the confirmed target after checking its protection", async () => {
  const { calls, dependencies, form } = setup();
  const result = await performUserDeletion(form, dependencies);
  assert.equal(result.success, true);
  assert.deepEqual(calls, ["read:user_target", "delete:user_target"]);
});

test("authentication, missing users and deletion failures return retryable errors", async () => {
  for (const fail of ["access", "read", "delete"] as const) {
    const { dependencies, form } = setup({ fail });
    const result = await performUserDeletion(form, dependencies);
    assert.equal(result.success, false);
    assert.match(result.message, /thử lại/);
  }
});

test("UI restriction matches the server protection rules", () => {
  assert.match(userDeletionRestriction("user_admin", "user_admin", false)!, /đang đăng nhập/);
  assert.match(userDeletionRestriction("user_admin", "user_other", true)!, /admin mặc định/);
  assert.equal(userDeletionRestriction("user_admin", "user_other", false), null);
});