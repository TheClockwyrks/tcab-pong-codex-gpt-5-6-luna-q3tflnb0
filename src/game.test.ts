import { describe, expect, it } from "vitest";
import type { InitApi, UpdateApi } from "@clockwyrks/simple-2d";
import { game, type CaromState } from "./game";

const initApi = () =>
  ({
    input: { register: () => undefined },
    audio: { define: () => undefined },
    diagnostics: { register: () => undefined },
  }) as unknown as InitApi<CaromState>;

const updateApi = (values: Record<string, number> = {}) =>
  ({
    input: {
      value: (name: string) => values[name] ?? 0,
      pressed: () => false,
      pointer: () => ({
        x: 0,
        y: 0,
        down: false,
        device: "mouse",
        buttons: [],
      }),
      pointerSamples: () => [],
    },
    audio: {
      muted: () => false,
      setMuted: () => undefined,
      play: () => undefined,
    },
  }) as unknown as UpdateApi;

describe("Carom simulation", () => {
  it("builds the title state and exposes a faithful snapshot", async () => {
    const [state, debug] = await game.initialize(initApi());
    const snapshot = debug.snapshot(state);
    expect(snapshot.screen).toBe("title");
    expect(snapshot.ball?.speed).toBe(0);
    expect(snapshot.obstacles).toHaveLength(2);
  });

  it("moves a held paddle by delta time and counts simulation time", async () => {
    const [state, debug] = await game.initialize(initApi());
    const next = game.update(
      debug.setScreen(state, "countdown"),
      updateApi({ "p1-down": 1 }),
      0.25,
    );
    expect(next.simTime).toBeCloseTo(0.25);
    expect(next.paddles.left.cy).toBeCloseTo(540);
    expect(next.paddles.left.vy).toBe(720);
  });
});
