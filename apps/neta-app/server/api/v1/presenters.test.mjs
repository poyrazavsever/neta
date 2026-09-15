import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { presentMeProfile, presentRuntimeCatalog } from "./presenters.ts";

test("backend me presenter produces the shared owner fixture", () => {
  const expected = fixture("me-owner.json");
  assert.deepEqual(presentMeProfile({
    user: expected.user,
    session: expected.session,
    preferences: {
      colorMode: expected.preferences.colorMode,
      language: expected.preferences.locale,
      timezone: expected.preferences.timezone,
    },
    localization: expected.localization,
  }), expected);
});

test("backend catalog presenter produces the shared catalog fixture", () => {
  const expected = fixture("catalog.json");
  assert.deepEqual(presentRuntimeCatalog(expected), expected);
});

function fixture(name) {
  return JSON.parse(readFileSync(
    new URL(`../../../../../packages/api-contracts/fixtures/${name}`, import.meta.url),
    "utf8",
  ));
}
