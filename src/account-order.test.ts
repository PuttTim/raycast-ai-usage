import assert from "node:assert/strict";
import test from "node:test";
import { applyAccountOrder, moveAccount } from "./account-order.ts";

const accounts = [{ id: "a" }, { id: "b" }, { id: "c" }];
const ids = (list: { id: string }[]) => list.map((account) => account.id);

test("sorts accounts into the saved order", () => {
  assert.deepEqual(ids(applyAccountOrder(accounts, ["c", "a", "b"])), ["c", "a", "b"]);
});

test("puts accounts missing from the saved order last, in configured order", () => {
  assert.deepEqual(ids(applyAccountOrder(accounts, ["b"])), ["b", "a", "c"]);
  assert.deepEqual(ids(applyAccountOrder(accounts, [])), ["a", "b", "c"]);
});

test("ignores saved ids for accounts that no longer exist", () => {
  assert.deepEqual(ids(applyAccountOrder(accounts, ["gone", "c"])), ["c", "a", "b"]);
});

test("moves an account one step and stops at either end", () => {
  assert.deepEqual(moveAccount(["a", "b", "c"], "b", -1), ["b", "a", "c"]);
  assert.deepEqual(moveAccount(["a", "b", "c"], "b", 1), ["a", "c", "b"]);
  assert.deepEqual(moveAccount(["a", "b", "c"], "a", -1), ["a", "b", "c"]);
  assert.deepEqual(moveAccount(["a", "b", "c"], "c", 1), ["a", "b", "c"]);
});
