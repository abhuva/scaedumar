import test from "node:test";
import assert from "node:assert/strict";

import { withImageCacheBust } from "../src/render/renderSupportRuntime.js";

test("image cache busting skips normal local asset URLs", () => {
  assert.equal(
    withImageCacheBust("assets/sprites/agents/default/player.png", 123),
    "assets/sprites/agents/default/player.png",
  );
  assert.equal(
    withImageCacheBust("./assets/sprites/agents/default/player.png?rev=1", 123),
    "./assets/sprites/agents/default/player.png?rev=1",
  );
  assert.equal(
    withImageCacheBust("../assets/sprites/agents/default/player.png", 123),
    "../assets/sprites/agents/default/player.png",
  );
});

test("image cache busting only refreshes browser-served URLs with explicit timestamps", () => {
  assert.equal(
    withImageCacheBust("https://example.test/player.png"),
    "https://example.test/player.png",
  );
  assert.equal(
    withImageCacheBust("https://example.test/player.png", 123),
    "https://example.test/player.png?terrainImageBust=123",
  );
});

test("image cache busting leaves non-browser asset schemes unchanged", () => {
  assert.equal(withImageCacheBust("data:image/png;base64,abc", 123), "data:image/png;base64,abc");
  assert.equal(withImageCacheBust("blob:http://local/abc", 123), "blob:http://local/abc");
  assert.equal(withImageCacheBust("file:///tmp/player.png", 123), "file:///tmp/player.png");
  assert.equal(withImageCacheBust("asset:player.png", 123), "asset:player.png");
});
