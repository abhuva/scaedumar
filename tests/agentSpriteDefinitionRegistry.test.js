import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  loadAgentSpriteDefinitionFile,
  normalizeAgentSpriteDefinitionFile,
} from "../src/gameplay/agentSpriteDefinitionRegistry.js";

test("normalizes agent sprite definition files", () => {
  const file = normalizeAgentSpriteDefinitionFile({
    version: 1,
    sprites: {
      player: {
        spriteSrc: "assets/sprites/agents/default/player.png",
        slotWidth: 64,
        slotHeight: 64,
        directionCount: 1,
        frameCount: 1,
        layer: "ground",
      },
      bird: {
        spriteSrc: "assets/sprites/agents/default/bird.png",
        directionCount: 1,
        frameCount: 6,
        animationFps: 10,
        animationMode: "renderTime",
        rotateToVelocity: true,
        transparentColor: "#ffffff",
        palette: {
          mode: "grayscale-lut",
          lutRefs: [
            { id: "animal.bird.dark", weight: 2, tags: ["forest"] },
            { range: { family: "animal.bird", start: 0, count: 2 }, rare: true, tags: ["winter"] },
          ],
        },
      },
    },
  });

  assert.equal(file.version, 1);
  assert.equal(file.sprites.player.id, "player");
  assert.equal(file.sprites.player.spriteSrc, "assets/sprites/agents/default/player.png");
  assert.equal(file.sprites.player.slotWidth, 64);
  assert.equal(file.sprites.player.slotHeight, 64);
  assert.equal(file.sprites.player.directionCount, 1);
  assert.equal(file.sprites.player.frameCount, 1);
  assert.equal(file.sprites.bird.id, "bird");
  assert.equal(file.sprites.bird.frameCount, 6);
  assert.equal(file.sprites.bird.animationMode, "renderTime");
  assert.equal(file.sprites.bird.rotateToVelocity, true);
  assert.equal(file.sprites.bird.transparentColor, "#ffffff");
  assert.equal(file.sprites.bird.palette.mode, "grayscale-lut");
  assert.deepEqual(file.sprites.bird.palette.lutRefs, [
    { id: "animal.bird.dark", weight: 2, rare: false, tags: ["forest"] },
    { range: { family: "animal.bird", start: 0, count: 2 }, weight: 0.1, rare: true, tags: ["winter"] },
  ]);
});

test("loads agent sprite definition files", async () => {
  const loadedUrls = [];
  const file = await loadAgentSpriteDefinitionFile({
    url: "sprites.json",
    fetchFn: async (url) => {
      loadedUrls.push(url);
      return {
        ok: true,
        json: async () => ({
          version: 1,
          sprites: {
            player: {
              spriteSrc: "player.png",
              directionCount: 1,
              frameCount: 1,
            },
          },
        }),
      };
    },
  });

  assert.deepEqual(loadedUrls, ["sprites.json"]);
  assert.equal(file.sprites.player.spriteSrc, "player.png");
  assert.equal(file.sprites.player.directionCount, 1);
  assert.equal(file.sprites.player.frameCount, 1);
});

test("shipped agent sprite definition files declare current player and swarm metadata", async () => {
  const playerFile = normalizeAgentSpriteDefinitionFile(JSON.parse(
    await readFile("assets/data/agents/player_sprites.json", "utf8"),
  ));
  const swarmFile = normalizeAgentSpriteDefinitionFile(JSON.parse(
    await readFile("assets/data/agents/swarm_sprites.json", "utf8"),
  ));

  assert.equal(playerFile.sprites.player.spriteSrc, "assets/sprites/agents/default/player.png");
  assert.equal(playerFile.sprites.player.slotWidth, 64);
  assert.equal(playerFile.sprites.player.slotHeight, 64);
  assert.equal(playerFile.sprites.player.directionCount, 1);
  assert.equal(playerFile.sprites.player.frameCount, 1);
  assert.equal(swarmFile.sprites.bird.spriteSrc, "assets/sprites/agents/default/bird.png");
  assert.equal(swarmFile.sprites.bird.frameCount, 6);
  assert.equal(swarmFile.sprites.bird.animationMode, "renderTime");
  assert.equal(swarmFile.sprites.bird.palette.mode, "grayscale-lut");
  assert.equal(
    swarmFile.sprites.bird.palette.lutRefs.some((ref) => ref.id === "animal.bird.rare.white" && ref.rare === true),
    true,
  );
  assert.equal(swarmFile.sprites.hawk.spriteSrc, "assets/sprites/agents/default/hawk.png");
  assert.equal(swarmFile.sprites.hawk.frameCount, 1);
});
