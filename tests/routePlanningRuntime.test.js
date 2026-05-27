import test from "node:test";
import assert from "node:assert/strict";

import { createRoutePlanningRuntime } from "../src/gameplay/routePlanningRuntime.js";

function imageData(width, height, value = 0) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }
  return { width, height, data };
}

function createRuntime(overrides = {}) {
  const map = { width: 16, height: 16 };
  const runtime = createRoutePlanningRuntime({
    playerState: { pixelX: 0, pixelY: 0 },
    getMapSize: () => map,
    getSlopeImageData: () => imageData(map.width, map.height, 0),
    getHeightImageData: () => imageData(map.width, map.height, 0),
    getWaterImageData: () => imageData(map.width, map.height, 0),
    clientToNdc: () => ({ x: 0, y: 0 }),
    worldFromNdc: () => ({ x: 0, y: 0 }),
    worldToUv: () => ({ x: 0, y: 0 }),
    uvToMapPixelIndex: () => ({ x: 0, y: 0 }),
    onChange: () => {},
    ...overrides,
  });
  runtime.updateSettings({ gridSize: 8 });
  return runtime;
}

test("route planning previews and commits projected route nodes", () => {
  const runtime = createRuntime();

  runtime.setActive(true);
  assert.equal(runtime.updateHoverAtPixel({ x: 15, y: 15 }), true);
  const preview = runtime.getSnapshot().hoverPathPixels;

  assert.ok(preview.length > 1);
  assert.deepEqual(preview[0], { x: 0, y: 0 });
  assert.deepEqual(runtime.getSnapshot().hoverPixel, { x: 15, y: 15 });

  assert.equal(runtime.commitHover(), true);
  const committed = runtime.getSnapshot().committed;
  assert.ok(committed);
  assert.deepEqual(committed.polyline, preview);
  assert.equal(committed.cells.length, preview.length);
  assert.equal(runtime.getSnapshot().segments.length, 1);
  assert.equal(runtime.getSnapshot().waypointPlacementActive, false);
});

test("route planning keeps committed route when mode deactivates", () => {
  const runtime = createRuntime();

  runtime.setActive(true);
  runtime.updateHoverAtPixel({ x: 15, y: 15 });
  runtime.commitHover();
  runtime.setActive(false);
  const snapshot = runtime.getSnapshot();

  assert.equal(snapshot.active, false);
  assert.equal(snapshot.hoverPathPixels.length, 0);
  assert.ok(snapshot.committed);
  assert.ok(snapshot.committed.polyline.length > 1);
});

test("route planning activation starts armed only for empty routes", () => {
  const runtime = createRuntime();

  runtime.setActive(true);
  assert.equal(runtime.getSnapshot().waypointPlacementActive, true);
  runtime.updateHoverAtPixel({ x: 15, y: 15 });
  runtime.commitHover();
  assert.equal(runtime.getSnapshot().waypointPlacementActive, false);

  runtime.setActive(false);
  runtime.setActive(true);
  assert.equal(runtime.getSnapshot().waypointPlacementActive, false);
  assert.equal(runtime.updateHoverAtPixel({ x: 15, y: 0 }), false);
});

test("route planning appends waypoints and rebuilds from last destination", () => {
  const runtime = createRuntime();

  runtime.setActive(true);
  runtime.updateHoverAtPixel({ x: 15, y: 0 });
  assert.equal(runtime.commitHover(), true);
  let snapshot = runtime.getSnapshot();
  assert.equal(snapshot.segments.length, 1);
  assert.deepEqual(snapshot.anchor, snapshot.segments[0].destination);
  assert.deepEqual(snapshot.source, snapshot.segments[0].destination);
  assert.equal(runtime.setAnchorFromEndpoint(snapshot.segments[0].id, "destination"), true);

  runtime.updateHoverAtPixel({ x: 15, y: 15 });
  assert.equal(runtime.commitHover(), true);
  snapshot = runtime.getSnapshot();

  assert.equal(snapshot.segments.length, 2);
  assert.deepEqual(snapshot.segments[1].source, snapshot.segments[0].destination);
  assert.deepEqual(snapshot.anchor, snapshot.segments[1].destination);
  assert.equal(snapshot.committed.segmentCount, 2);
  assert.equal(snapshot.totals.segmentCount, 2);
  assert.equal(snapshot.selectedSegmentId, snapshot.segments[1].id);
  assert.deepEqual(snapshot.selectedWaypoint, snapshot.segments[1].destination);
  assert.equal(snapshot.canDeleteSelectedWaypoint, true);
});

test("route planning clear resets route anchor to player", () => {
  const runtime = createRuntime();

  runtime.setActive(true);
  runtime.updateHoverAtPixel({ x: 15, y: 15 });
  runtime.commitHover();
  runtime.clearCommitted();
  const snapshot = runtime.getSnapshot();

  assert.equal(snapshot.segments.length, 0);
  assert.equal(snapshot.committed, null);
  assert.equal(snapshot.selectedSegmentId, null);
  assert.deepEqual(snapshot.anchor, { x: 0, y: 0 });
  assert.deepEqual(snapshot.source, { x: 0, y: 0 });
});

test("route planning empty-route activation uses current player position after deleting last segment", () => {
  const playerState = { pixelX: 0, pixelY: 0 };
  const runtime = createRuntime({ playerState });

  runtime.setActive(true);
  runtime.updateHoverAtPixel({ x: 15, y: 15 });
  runtime.commitHover();
  const segmentId = runtime.getSnapshot().segments[0].id;
  runtime.selectSegment(segmentId);
  runtime.deleteSelectedSegment();
  runtime.setActive(false);

  playerState.pixelX = 7;
  playerState.pixelY = 9;
  runtime.setActive(true);
  const snapshot = runtime.getSnapshot();

  assert.deepEqual(snapshot.anchor, { x: 7, y: 9 });
  assert.deepEqual(snapshot.source, { x: 7, y: 9 });
  assert.equal(snapshot.waypointPlacementActive, true);
  assert.equal(snapshot.segments.length, 0);
});

test("route planning can hide committed overlay without deleting segments", () => {
  const runtime = createRuntime();

  runtime.setActive(true);
  runtime.updateHoverAtPixel({ x: 15, y: 15 });
  runtime.commitHover();

  assert.equal(runtime.setShowCommittedOverlay(false), true);
  const snapshot = runtime.getSnapshot();

  assert.equal(snapshot.showCommittedOverlay, false);
  assert.equal(snapshot.segments.length, 1);
  assert.ok(snapshot.committed);
});

test("route planning can cancel waypoint placement without clearing segments", () => {
  const runtime = createRuntime();

  runtime.setActive(true);
  runtime.updateHoverAtPixel({ x: 15, y: 15 });
  runtime.commitHover();

  assert.equal(runtime.getSnapshot().waypointPlacementActive, false);
  assert.equal(runtime.setWaypointPlacementActive(false), false);
  assert.equal(runtime.updateHoverAtPixel({ x: 15, y: 0 }), false);
  assert.equal(runtime.commitHover(), false);
  let snapshot = runtime.getSnapshot();

  assert.equal(snapshot.waypointPlacementActive, false);
  assert.equal(snapshot.segments.length, 1);
  assert.equal(snapshot.hoverPathPixels.length, 0);

  assert.equal(runtime.setWaypointPlacementActive(true), true);
  assert.equal(runtime.updateHoverAtPixel({ x: 15, y: 0 }), true);
  snapshot = runtime.getSnapshot();

  assert.equal(snapshot.waypointPlacementActive, true);
  assert.ok(snapshot.hoverPathPixels.length > 0);
});

test("route planning deletes only selected leaf waypoints", () => {
  const runtime = createRuntime();

  runtime.setActive(true);
  runtime.updateHoverAtPixel({ x: 15, y: 0 });
  runtime.commitHover();
  runtime.setAnchorFromEndpoint(runtime.getSnapshot().segments[0].id, "destination");
  runtime.updateHoverAtPixel({ x: 15, y: 15 });
  runtime.commitHover();
  const snapshotBefore = runtime.getSnapshot();
  const firstId = snapshotBefore.segments[0].id;
  const secondId = snapshotBefore.segments[1].id;

  assert.equal(runtime.setAnchorFromEndpoint(firstId, "destination"), true);
  assert.equal(runtime.getSnapshot().canDeleteSelectedWaypoint, false);
  assert.equal(runtime.deleteSelectedWaypoint(), false);
  assert.equal(runtime.setAnchorFromEndpoint(secondId, "destination"), true);
  assert.equal(runtime.getSnapshot().canDeleteSelectedWaypoint, true);
  assert.equal(runtime.deleteSelectedWaypoint(), true);
  const snapshot = runtime.getSnapshot();

  assert.equal(snapshot.segments.length, 1);
  assert.equal(snapshot.segments[0].id, firstId);
  assert.equal(snapshot.selectedWaypoint, null);
  assert.equal(snapshot.canDeleteSelectedWaypoint, false);
  assert.equal(snapshot.totals.segmentCount, 1);
});

test("route planning hit tests endpoints before segments and can anchor from endpoint", () => {
  const runtime = createRuntime();

  runtime.setActive(true);
  runtime.updateHoverAtPixel({ x: 15, y: 15 });
  runtime.commitHover();
  const segment = runtime.getSnapshot().segments[0];
  const hit = runtime.hitTestAtPixel(segment.destination);

  assert.equal(hit.type, "endpoint");
  assert.equal(hit.segmentId, segment.id);
  assert.equal(hit.endpoint, "destination");
  assert.equal(runtime.selectWaypointFromEndpoint(segment.id, "destination"), true);
  assert.deepEqual(runtime.getSnapshot().selectedWaypoint, segment.destination);
  assert.equal(runtime.getSnapshot().waypointPlacementActive, false);
  assert.equal(runtime.setAnchorFromEndpoint(segment.id, "source"), true);
  assert.deepEqual(runtime.getSnapshot().anchor, segment.source);
  assert.equal(runtime.getSnapshot().waypointPlacementActive, true);
});

test("route planning clears selected waypoint", () => {
  const runtime = createRuntime();

  runtime.setActive(true);
  runtime.updateHoverAtPixel({ x: 15, y: 15 });
  runtime.commitHover();
  const segment = runtime.getSnapshot().segments[0];
  runtime.selectWaypointFromEndpoint(segment.id, "destination");

  assert.deepEqual(runtime.getSnapshot().selectedWaypoint, segment.destination);
  assert.equal(runtime.clearSelection(), true);
  assert.equal(runtime.getSnapshot().selectedWaypoint, null);
  assert.equal(runtime.clearSelection(), false);
});

test("route planning undo restores previous anchor", () => {
  const runtime = createRuntime();

  runtime.setActive(true);
  runtime.updateHoverAtPixel({ x: 15, y: 0 });
  runtime.commitHover();
  const firstDestination = runtime.getSnapshot().segments[0].destination;
  runtime.setAnchorFromEndpoint(runtime.getSnapshot().segments[0].id, "destination");
  runtime.updateHoverAtPixel({ x: 15, y: 15 });
  runtime.commitHover();

  assert.equal(runtime.undoLastSegment(), true);
  const snapshot = runtime.getSnapshot();

  assert.equal(snapshot.segments.length, 1);
  assert.deepEqual(snapshot.anchor, firstDestination);
  assert.deepEqual(snapshot.source, firstDestination);
});

test("route planning reports outside hover state", () => {
  const runtime = createRuntime();

  runtime.setActive(true);
  runtime.setHoverOutside();
  const snapshot = runtime.getSnapshot();

  assert.equal(snapshot.hoverStatus, "outside");
  assert.equal(snapshot.hoverPathPixels.length, 0);
});

test("route planning debug overlay builds while route mode is inactive", () => {
  const runtime = createRuntime();

  runtime.updateSettings({ debugOverlayMode: "dijkstra" });
  const snapshot = runtime.getSnapshot();

  assert.equal(snapshot.active, false);
  assert.equal(snapshot.debugOverlay.mode, "dijkstra");
  assert.equal(snapshot.debugOverlay.width, 8);
  assert.equal(snapshot.debugOverlay.height, 8);
  assert.equal(snapshot.debugOverlay.values.length, 64);
});

test("route planning uses active pathfinding movement weights for cost", () => {
  const map = { width: 16, height: 16 };
  const water = imageData(map.width, map.height, 255);
  const runtime = createRuntime({
    getMapSize: () => map,
    getWaterImageData: () => water,
    getPathfindingStateSnapshot: () => ({
      range: 30,
      weightSlope: 0,
      weightHeight: 0,
      weightWater: 0,
      slopeCutoff: 90,
      baseCost: 1,
    }),
  });
  runtime.updateSettings({
    gridSize: 8,
    weightSlope: 0,
    weightHeight: 0,
    weightWater: 100,
    slopeCutoff: 1,
  });

  runtime.setActive(true);
  assert.equal(runtime.updateHoverAtPixel({ x: 15, y: 0 }), true);
  const cost = runtime.getSnapshot().hoverCost;

  assert.ok(cost > 0);
  assert.ok(cost < 40);
});

test("route planning applies NAV-only planning bias to effective costs", () => {
  const map = { width: 16, height: 16 };
  const water = imageData(map.width, map.height, 255);
  const runtime = createRuntime({
    getMapSize: () => map,
    getWaterImageData: () => water,
    getPathfindingStateSnapshot: () => ({
      range: 30,
      weightSlope: 0,
      weightHeight: 0,
      weightWater: 0,
      slopeCutoff: 90,
      baseCost: 1,
    }),
  });
  runtime.updateSettings({
    gridSize: 8,
    planningWaterAdd: 10,
  });

  runtime.setActive(true);
  assert.equal(runtime.updateHoverAtPixel({ x: 15, y: 0 }), true);
  const snapshot = runtime.getSnapshot();

  assert.equal(snapshot.settings.planningWaterAdd, 10);
  assert.equal(snapshot.settings.weightWater, 0);
  assert.ok(snapshot.hoverCost > 40);
});

test("route planning treats low discovery knowledge as impassable at cutoff", () => {
  const cells = new Uint8ClampedArray(8 * 8);
  cells[0] = 255;
  const runtime = createRuntime({
    getNavigationKnowledgeSnapshots: () => [{
      resourceId: "water",
      width: 8,
      height: 8,
      mapWidth: 16,
      mapHeight: 16,
      cells,
    }],
  });
  runtime.updateSettings({
    gridSize: 8,
    discoveryCutoff: 0.5,
  });

  runtime.setActive(true);

  assert.equal(runtime.updateHoverAtPixel({ x: 15, y: 0 }), false);
  assert.equal(runtime.getSnapshot().hoverStatus, "unreachable");
});

test("route planning estimates ticks with per-step rounding", () => {
  const runtime = createRuntime();
  runtime.updateSettings({
    gridSize: 8,
    baseCost: 0.25,
    weightSlope: 0,
    weightHeight: 0,
    weightWater: 0,
    slopeCutoff: 1,
  });

  runtime.setActive(true);
  assert.equal(runtime.updateHoverAtPixel({ x: 15, y: 0 }), true);
  const preview = runtime.getSnapshot();

  assert.equal(preview.hoverPathPixels.length, 8);
  assert.equal(preview.hoverCost, 3.5);
  assert.equal(preview.hoverTicks, 7);

  assert.equal(runtime.commitHover(), true);
  const committed = runtime.getSnapshot();

  assert.equal(committed.segments[0].cost, 3.5);
  assert.equal(committed.segments[0].ticks, 7);
  assert.equal(committed.totals.cost, 3.5);
  assert.equal(committed.totals.ticks, 7);
  assert.equal(committed.committed.ticks, 7);
});
