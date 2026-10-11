import type { Game, InitApi, UpdateApi } from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import * as K from "./constants";
import type { Rect } from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";
export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}
export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}
export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}
export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
}
export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
  readonly muted: boolean;
}
export interface CaromSnapshot {
  version: number;
  screen: Screen;
  mode: Mode;
  menuIndex: number;
  titleIndex: number;
  resumeScreen: "countdown" | "playing";
  score: { p1: number; p2: number };
  winner: Side | null;
  muted: boolean;
  paddles: { left: PaddleState; right: PaddleState };
  ai: AiState;
  receiver: Side;
  ball: (BallState & { speed: number }) | null;
  obstacles: ObstacleState[];
  simTime: number;
}
export interface CaromDebugApi {
  readonly version: number;
  clearWorld(s: DeepReadonly<CaromState>): CaromState;
  spawnBall(s: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(s: DeepReadonly<CaromState>, index: number): CaromState;
  reset(s: DeepReadonly<CaromState>): CaromState;
  reconcile(s: DeepReadonly<CaromState>): CaromState;
  setScreen(s: DeepReadonly<CaromState>, v: Screen): CaromState;
  setMode(s: DeepReadonly<CaromState>, v: Mode): CaromState;
  setMenuIndex(s: DeepReadonly<CaromState>, v: number): CaromState;
  setTitleIndex(s: DeepReadonly<CaromState>, v: number): CaromState;
  setResumeScreen(
    s: DeepReadonly<CaromState>,
    v: "countdown" | "playing",
  ): CaromState;
  setScore(s: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(s: DeepReadonly<CaromState>, v: Side | null): CaromState;
  setReceiver(s: DeepReadonly<CaromState>, v: Side): CaromState;
  setPaddleCy(s: DeepReadonly<CaromState>, side: Side, v: number): CaromState;
  setPaddleVy(s: DeepReadonly<CaromState>, side: Side, v: number): CaromState;
  setPaddleDriven(
    s: DeepReadonly<CaromState>,
    side: Side,
    v: boolean,
  ): CaromState;
  setBallPosition(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallSpin(s: DeepReadonly<CaromState>, v: number): CaromState;
  setBallHeld(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setBallHoldTimer(s: DeepReadonly<CaromState>, v: number): CaromState;
  setBallServeSign(s: DeepReadonly<CaromState>, v: 1 | -1): CaromState;
  drawBallServeSign(s: DeepReadonly<CaromState>): CaromState;
  setAiTracking(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setAiMovement(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setMuted(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  snapshot(s: DeepReadonly<CaromState>): CaromSnapshot;
  menuItemRect(
    s: DeepReadonly<CaromState>,
    index: number,
  ): { x: number; y: number; w: number; h: number } | null;
}
export const BACKGROUND = "#08111f";
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const drawSign = (): 1 | -1 => (Math.random() < 0.5 ? -1 : 1);
const mkPaddle = (): PaddleState => ({
  cy: K.FIELD_CY,
  vy: 0,
  driven: false,
  drivenVy: 0,
});
const mkBall = (): BallState => ({
  x: K.FIELD_CX,
  y: K.FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: K.HOLD_TIME,
  serveSign: drawSign(),
  trail: [],
});
const mkObstacle = (index: number): ObstacleState => ({
  index,
  cx: K.OBSTACLE_CENTERS[index].x,
  cy: K.OBSTACLE_CENTERS[index].y,
});
const title = (muted = false): CaromState => ({
  screen: "title",
  mode: "solo",
  menuIndex: 0,
  titleIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  paddles: { left: mkPaddle(), right: mkPaddle() },
  ai: { tracking: true, movement: true },
  receiver: "left",
  ball: mkBall(),
  obstacles: [mkObstacle(0), mkObstacle(1)],
  simTime: 0,
  muted,
});
const requireBall = (s: DeepReadonly<CaromState>) => {
  if (!s.ball) throw new Error("Carom: no ball present");
  return s.ball;
};
const items = (screen: Screen): readonly string[] =>
  screen === "title"
    ? K.TITLE_ITEMS
    : screen === "paused"
      ? K.PAUSE_ITEMS
      : screen === "matchover"
        ? K.MATCHOVER_ITEMS
        : screen === "howto"
          ? ["BACK"]
          : [];
const itemRect = (screen: Screen, index: number) =>
  index >= 0 && index < items(screen).length
    ? { x: 430, y: 320 + index * 62, w: 420, h: 48 }
    : null;
const move = (p: PaddleState, desired: number, dt: number): PaddleState => {
  if (dt <= 0) return { ...p, vy: 0 };
  const cy = clamp(p.cy + desired * dt, K.PADDLE_MIN_CY, K.PADDLE_MAX_CY);
  return { ...p, cy, vy: (cy - p.cy) / dt };
};
const park = () => mkBall();
const serve = (b: BallState, receiver: Side): BallState => {
  const d = receiver === "left" ? -1 : 1;
  return {
    ...b,
    held: false,
    holdTimer: 0,
    vx: d * K.SERVE_SPEED * Math.cos(K.SERVE_ANGLE),
    vy: b.serveSign * K.SERVE_SPEED * Math.sin(K.SERVE_ANGLE),
    spin: 0,
    trail: [],
  };
};
function contact(b: BallState, r: Rect): { b: BallState; face: number } | null {
  const ds = [
    b.x - (r.x0 - K.BALL_R),
    r.x1 + K.BALL_R - b.x,
    b.y - (r.y0 - K.BALL_R),
    r.y1 + K.BALL_R - b.y,
  ];
  if (ds.some((d) => d <= 0)) return null;
  const face = ds.indexOf(Math.min(...ds));
  if (face === 0) return { b: { ...b, x: r.x0 - K.BALL_R }, face };
  if (face === 1) return { b: { ...b, x: r.x1 + K.BALL_R }, face };
  if (face === 2) return { b: { ...b, y: r.y0 - K.BALL_R }, face };
  return { b: { ...b, y: r.y1 + K.BALL_R }, face };
}
function stepBall(
  s: DeepReadonly<CaromState>,
  original: BallState,
  dt: number,
  api: UpdateApi,
): BallState {
  let b = original;
  const n = Math.max(
    1,
    Math.ceil((Math.hypot(b.vx, b.vy) * dt) / K.MAX_SUBSTEP),
  );
  const h = dt / n;
  for (let j = 0; j < n; j++) {
    const speed = Math.hypot(b.vx, b.vy);
    if (speed > 0) {
      const a = (b.spin / speed) * h,
        c = Math.cos(a),
        d = Math.sin(a);
      b = { ...b, vx: b.vx * c - b.vy * d, vy: b.vx * d + b.vy * c };
    }
    b = {
      ...b,
      spin: b.spin * Math.pow(0.5, h / K.SPIN_HALFLIFE),
      x: b.x + b.vx * h,
      y: b.y + b.vy * h,
    };
    if (b.y - K.BALL_R < 0 && b.vy < 0) {
      b = { ...b, y: K.BALL_R, vy: -b.vy };
      api.audio.play(K.CUES.wallBounce);
    } else if (b.y + K.BALL_R > K.FIELD_H && b.vy > 0) {
      b = { ...b, y: K.FIELD_H - K.BALL_R, vy: -b.vy };
      api.audio.play(K.CUES.wallBounce);
    }
    for (const side of ["left", "right"] as const) {
      const p = s.paddles[side];
      const r =
        side === "left"
          ? {
              x0: K.P1_X0,
              y0: p.cy - K.PADDLE_HALF,
              x1: K.P1_X1,
              y1: p.cy + K.PADDLE_HALF,
            }
          : {
              x0: K.P2_X0,
              y0: p.cy - K.PADDLE_HALF,
              x1: K.P2_X1,
              y1: p.cy + K.PADDLE_HALF,
            };
      const hit = contact(b, r);
      if (!hit) continue;
      b = hit.b;
      const front = side === "left" ? hit.face === 1 : hit.face === 0;
      if (front) {
        const theta =
          clamp((b.y - p.cy) / K.PADDLE_HALF, -1, 1) * K.MAX_BOUNCE_ANGLE;
        const ns = Math.min(Math.hypot(b.vx, b.vy) * K.SPEED_MULT, K.SPEED_CAP);
        const d = side === "left" ? 1 : -1;
        b = {
          ...b,
          x: side === "left" ? K.P1_X1 + K.BALL_R : K.P2_X0 - K.BALL_R,
          vx: d * ns * Math.cos(theta),
          vy: ns * Math.sin(theta),
          spin: clamp(
            b.spin + p.vy * K.SPIN_FROM_PADDLE,
            -K.SPIN_CLAMP,
            K.SPIN_CLAMP,
          ),
        };
        api.audio.play(K.CUES.paddleHit);
      } else {
        b = { ...b, vy: -b.vy };
        api.audio.play(K.CUES.wallBounce);
      }
    }
    for (const o of s.obstacles) {
      const hit = contact(b, K.OBSTACLES[o.index]);
      if (!hit) continue;
      b =
        hit.face < 2
          ? { ...hit.b, vx: -hit.b.vx }
          : { ...hit.b, vy: -hit.b.vy };
      api.audio.play(K.CUES.obstacleBounce);
    }
  }
  return b;
}
const start = (s: DeepReadonly<CaromState>, mode: Mode): CaromState => ({
  ...s,
  screen: "countdown",
  mode,
  menuIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  receiver: "left",
  paddles: { left: mkPaddle(), right: mkPaddle() },
  ball: park(),
});
const menuPick = (s: DeepReadonly<CaromState>, index: number): CaromState => {
  if (s.screen === "title")
    return index === 0
      ? start(s, "solo")
      : index === 1
        ? start(s, "versus")
        : { ...s, screen: "howto", menuIndex: 0 };
  if (s.screen === "howto")
    return {
      ...title(s.muted),
      titleIndex: s.titleIndex,
      menuIndex: s.titleIndex,
      simTime: s.simTime,
    };
  if (s.screen === "paused")
    return index === 0
      ? { ...s, screen: s.resumeScreen }
      : index === 1
        ? start(s, s.mode)
        : {
            ...title(s.muted),
            titleIndex: s.titleIndex,
            menuIndex: s.titleIndex,
            simTime: s.simTime,
          };
  return index === 0
    ? start(s, s.mode)
    : {
        ...title(s.muted),
        titleIndex: s.titleIndex,
        menuIndex: s.titleIndex,
        simTime: s.simTime,
      };
};
function pointerChoice(s: DeepReadonly<CaromState>, api: UpdateApi) {
  const samples = api.input.pointerSamples().filter((v) => v.primary);
  const find = (x: number, y: number) =>
    items(s.screen).findIndex((_, i) => {
      const r = itemRect(s.screen, i);
      return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
    });
  let down: number | null = null,
    up: number | null = null;
  for (const sample of samples) {
    const i = find(sample.x, sample.y);
    if (sample.type === "down") down = i;
    if (sample.type === "up") up = i;
  }
  const hover = find(api.input.pointer().x, api.input.pointer().y);
  return {
    index: hover >= 0 ? hover : null,
    confirm: down !== null && down === up && down >= 0,
  };
}

export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>) {
    for (const a of K.ACTIONS)
      api.input.register(a, { keys: [...K.BINDINGS[a]] });
    api.audio.define(K.CUES.paddleHit, {
      wave: "square",
      freq: 260,
      freqTo: 520,
      durationMs: 70,
      gain: 0.04,
    });
    api.audio.define(K.CUES.wallBounce, {
      freq: 180,
      freqTo: 300,
      durationMs: 60,
      gain: 0.03,
    });
    api.audio.define(K.CUES.obstacleBounce, {
      wave: "triangle",
      freq: 350,
      freqTo: 180,
      durationMs: 80,
      gain: 0.035,
    });
    api.audio.define(K.CUES.score, {
      wave: "sawtooth",
      freq: 220,
      freqTo: 90,
      durationMs: 180,
      gain: 0.04,
    });
    api.diagnostics.register("screen", (s) => s.screen);
    api.diagnostics.register("mode", (s) => s.mode);
    api.diagnostics.register("score", (s) => `${s.score.p1}-${s.score.p2}`);
    api.diagnostics.register("ball", (s) =>
      s.ball ? `${s.ball.x.toFixed(0)},${s.ball.y.toFixed(0)}` : "none",
    );
    api.diagnostics.register("velocity", (s) =>
      s.ball ? `${s.ball.vx.toFixed(0)},${s.ball.vy.toFixed(0)}` : "none",
    );
    api.diagnostics.register("speed", (s) =>
      s.ball ? Math.hypot(s.ball.vx, s.ball.vy).toFixed(0) : "0",
    );
    api.diagnostics.register("spin", (s) => s.ball?.spin.toFixed(0) ?? "0");
    api.diagnostics.register(
      "p1",
      (s) =>
        `${s.paddles.left.cy.toFixed(0)} (${s.paddles.left.vy.toFixed(0)})`,
    );
    api.diagnostics.register(
      "p2",
      (s) =>
        `${s.paddles.right.cy.toFixed(0)} (${s.paddles.right.vy.toFixed(0)})`,
    );
    const side = (
      s: DeepReadonly<CaromState>,
      x: Side,
      p: Partial<PaddleState>,
    ) => ({ ...s, paddles: { ...s.paddles, [x]: { ...s.paddles[x], ...p } } });
    const debug: CaromDebugApi = {
      version: K.CAROM_DEBUG_VERSION,
      clearWorld: (s) => ({ ...s, ball: null, obstacles: [] }),
      spawnBall: (s) => ({ ...s, ball: park() }),
      spawnObstacle: (s, i) => {
        if (i !== 0 && i !== 1)
          throw new Error("Carom: invalid obstacle index");
        return {
          ...s,
          obstacles: [
            ...s.obstacles.filter((o) => o.index !== i),
            mkObstacle(i),
          ].sort((a, b) => a.index - b.index),
        };
      },
      reset: (s) => title(s.muted),
      reconcile: (s) => ({ ...s }),
      setScreen: (s, v) => ({ ...s, screen: v }),
      setMode: (s, v) => ({ ...s, mode: v }),
      setMenuIndex: (s, v) => ({ ...s, menuIndex: v }),
      setTitleIndex: (s, v) => ({ ...s, titleIndex: v }),
      setResumeScreen: (s, v) => ({ ...s, resumeScreen: v }),
      setScore: (s, p1, p2) => ({ ...s, score: { p1, p2 } }),
      setWinner: (s, v) => ({ ...s, winner: v }),
      setReceiver: (s, v) => ({ ...s, receiver: v }),
      setPaddleCy: (s, x, v) => side(s, x, { cy: v }),
      setPaddleVy: (s, x, v) => side(s, x, { drivenVy: v }),
      setPaddleDriven: (s, x, v) => side(s, x, { driven: v }),
      setBallPosition: (s, x, y) => ({
        ...s,
        ball: { ...requireBall(s), x, y },
      }),
      setBallVelocity: (s, x, y) => ({
        ...s,
        ball: { ...requireBall(s), vx: x, vy: y },
      }),
      setBallSpin: (s, v) => ({ ...s, ball: { ...requireBall(s), spin: v } }),
      setBallHeld: (s, v) => ({ ...s, ball: { ...requireBall(s), held: v } }),
      setBallHoldTimer: (s, v) => ({
        ...s,
        ball: { ...requireBall(s), holdTimer: v },
      }),
      setBallServeSign: (s, v) => ({
        ...s,
        ball: { ...requireBall(s), serveSign: v },
      }),
      drawBallServeSign: (s) => ({
        ...s,
        ball: { ...requireBall(s), serveSign: drawSign() },
      }),
      setAiTracking: (s, v) => ({ ...s, ai: { ...s.ai, tracking: v } }),
      setAiMovement: (s, v) => ({ ...s, ai: { ...s.ai, movement: v } }),
      setMuted: (s, v) => ({ ...s, muted: v }),
      snapshot: (s) => ({
        version: K.CAROM_DEBUG_VERSION,
        screen: s.screen,
        mode: s.mode,
        menuIndex: s.menuIndex,
        titleIndex: s.titleIndex,
        resumeScreen: s.resumeScreen,
        score: { ...s.score },
        winner: s.winner,
        muted: s.muted,
        paddles: { left: { ...s.paddles.left }, right: { ...s.paddles.right } },
        ai: { ...s.ai },
        receiver: s.receiver,
        ball: s.ball
          ? {
              ...s.ball,
              trail: s.ball.trail.map((t) => ({ ...t })),
              speed: Math.hypot(s.ball.vx, s.ball.vy),
            }
          : null,
        obstacles: s.obstacles.map((o) => ({ ...o })),
        simTime: s.simTime,
      }),
      menuItemRect: (s, i) => itemRect(s.screen, i),
    };
    return [title(false), debug];
  },
  update(state, api, dt) {
    let s: CaromState = {
      ...state,
      simTime: state.simTime + dt,
      muted: api.audio.muted(),
    };
    if (api.input.pressed("mute")) {
      api.audio.setMuted(!api.audio.muted());
      s = { ...s, muted: api.audio.muted() };
    }
    const pointer = pointerChoice(s, api);
    const up = api.input.pressed("p1-up") || api.input.pressed("p2-up");
    const down = api.input.pressed("p1-down") || api.input.pressed("p2-down");
    if (["title", "howto", "paused", "matchover"].includes(s.screen)) {
      if (
        s.screen === "paused" &&
        (api.input.pressed("pause") || api.input.pressed("back"))
      )
        return { ...s, screen: s.resumeScreen };
      if (
        s.screen === "howto" &&
        (api.input.pressed("confirm") || api.input.pressed("back"))
      )
        return menuPick(s, 0);
      const count = items(s.screen).length;
      let i = s.menuIndex;
      if (up) i = (i + count - 1) % count;
      else if (down) i = (i + 1) % count;
      if (pointer.index !== null) i = pointer.index;
      if (i !== s.menuIndex)
        s = {
          ...s,
          menuIndex: i,
          ...(s.screen === "title" ? { titleIndex: i } : {}),
        };
      if ((api.input.pressed("confirm") || pointer.confirm) && !(up || down))
        return menuPick(s, s.menuIndex);
      return s;
    }
    if (s.screen === "countdown" || s.screen === "playing") {
      if (api.input.pressed("pause"))
        return { ...s, screen: "paused", resumeScreen: s.screen, menuIndex: 0 };
      const left = s.paddles.left.driven
        ? s.paddles.left.drivenVy
        : (api.input.value("p1-down") +
            (s.mode === "solo" ? api.input.value("p2-down") : 0) -
            api.input.value("p1-up") -
            (s.mode === "solo" ? api.input.value("p2-up") : 0)) *
          K.PADDLE_SPEED;
      let right = s.paddles.right.driven ? s.paddles.right.drivenVy : 0;
      if (s.mode === "versus")
        right =
          (api.input.value("p2-down") - api.input.value("p2-up")) *
          K.PADDLE_SPEED;
      else if (s.ai.movement) {
        let target = K.AI_HOME_Y,
          deadzone = K.AI_HOME_DEADZONE;
        if (
          s.ai.tracking &&
          s.screen === "playing" &&
          s.ball &&
          s.ball.vx > 0
        ) {
          target = s.ball.y - s.ball.vy * K.AI_REACT;
          deadzone = K.AI_DEADZONE;
        }
        const d = target - s.paddles.right.cy;
        right =
          Math.abs(d) <= deadzone || dt <= 0
            ? 0
            : Math.sign(d) * Math.min(K.AI_SPEED, Math.abs(d) / dt);
      }
      s = {
        ...s,
        paddles: {
          left: move(s.paddles.left, left, dt),
          right: move(s.paddles.right, right, dt),
        },
      };
      if (!s.ball) return s;
      let b = s.ball;
      if (s.screen === "countdown") {
        const remain = b.holdTimer - dt;
        if (remain <= 0) {
          b = serve(b, s.receiver);
          s = { ...s, screen: "playing" };
        } else b = { ...b, holdTimer: remain };
      }
      if (s.screen === "playing" && !b.held) {
        b = stepBall(s, b, dt, api);
        if (b.x - K.BALL_R > K.FIELD_W || b.x + K.BALL_R < 0) {
          const p1 = b.x - K.BALL_R > K.FIELD_W;
          const score = {
            p1: s.score.p1 + (p1 ? 1 : 0),
            p2: s.score.p2 + (p1 ? 0 : 1),
          };
          api.audio.play(K.CUES.score);
          const winner =
            score.p1 >= K.WIN_SCORE && score.p1 - score.p2 >= K.WIN_LEAD
              ? "left"
              : score.p2 >= K.WIN_SCORE && score.p2 - score.p1 >= K.WIN_LEAD
                ? "right"
                : null;
          s = {
            ...s,
            score,
            winner,
            screen: winner ? "matchover" : "countdown",
            menuIndex: winner ? 0 : s.menuIndex,
            receiver: p1 ? "right" : "left",
            ball: winner ? b : park(),
          };
          if (winner) return s;
        }
      }
      const trail = [...b.trail, { x: b.x, y: b.y, t: s.simTime }].filter(
        (t) => s.simTime - t.t <= K.TRAIL_TIME,
      );
      return { ...s, ball: { ...b, trail } };
    }
    return s;
  },
  render(state, api) {
    const c = api.ctx;
    c.fillStyle = BACKGROUND;
    c.fillRect(0, 0, K.FIELD_W, K.FIELD_H);
    const glow = (
      color: string,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
    ) => {
      c.shadowColor = color;
      c.shadowBlur = 18;
      c.fillStyle = color;
      c.beginPath();
      c.roundRect(x, y, w, h, r);
      c.fill();
      c.shadowBlur = 0;
    };
    c.strokeStyle = "rgba(140,190,220,.18)";
    c.lineWidth = 2;
    c.setLineDash([10, 16]);
    c.beginPath();
    c.moveTo(K.FIELD_CX, 34);
    c.lineTo(K.FIELD_CX, K.FIELD_H - 34);
    c.stroke();
    c.setLineDash([]);
    for (const o of state.obstacles)
      glow("#efb366", o.cx - 10, o.cy - 70, 20, 140, 10);
    glow(
      "#59d9ff",
      K.P1_X0,
      state.paddles.left.cy - K.PADDLE_HALF,
      K.PADDLE_W,
      K.PADDLE_H,
      8,
    );
    glow(
      "#ff5c91",
      K.P2_X0,
      state.paddles.right.cy - K.PADDLE_HALF,
      K.PADDLE_W,
      K.PADDLE_H,
      8,
    );
    if (state.ball) {
      if (state.ball.trail.length > 1) {
        c.beginPath();
        c.moveTo(state.ball.trail[0].x, state.ball.trail[0].y);
        for (const t of state.ball.trail.slice(1)) c.lineTo(t.x, t.y);
        c.strokeStyle = "rgba(244,248,255,.22)";
        c.lineWidth = 8;
        c.stroke();
      }
      glow(
        "#f7fbff",
        state.ball.x - K.BALL_R,
        state.ball.y - K.BALL_R,
        22,
        22,
        11,
      );
    }
    c.textAlign = "center";
    c.font = "700 30px system-ui,sans-serif";
    c.fillStyle = "#edf7ff";
    c.fillText(String(state.score.p1), 560, 72);
    c.fillText(String(state.score.p2), 720, 72);
    if (["title", "howto", "paused", "matchover"].includes(state.screen)) {
      c.fillStyle = "rgba(3,8,18,.78)";
      c.fillRect(250, 100, 780, 540);
      c.fillStyle = "#edf7ff";
      c.font = "800 82px system-ui,sans-serif";
      c.fillText("CAROM", 640, 220);
      c.font = "500 18px system-ui,sans-serif";
      c.fillStyle = "#9db4c8";
      c.fillText(
        state.screen === "title"
          ? "SPIN. BANK. OUTPLAY."
          : state.screen === "howto"
            ? "READ THE ANGLE. MOVE WITH PURPOSE."
            : state.screen === "paused"
              ? "MATCH PAUSED"
              : `${state.winner === "left" ? "PLAYER ONE" : "PLAYER TWO"} WINS • ${state.score.p1} — ${state.score.p2}`,
        640,
        270,
      );
      const list = items(state.screen);
      c.font = "700 22px system-ui,sans-serif";
      list.forEach((v, i) => {
        const r = itemRect(state.screen, i)!;
        c.fillStyle = i === state.menuIndex ? "#59d9ff" : "#b8c9d7";
        c.fillText(i === state.menuIndex ? `› ${v} ‹` : v, 640, r.y + 31);
      });
      if (state.screen === "howto") {
        c.font = "400 16px system-ui,sans-serif";
        c.fillStyle = "#a8bdcc";
        c.fillText(
          "W/S or ↑/↓ move paddles • P / Esc pause • M mute",
          640,
          455,
        );
        c.fillText(
          "Paddle motion adds spin. Use the amber bars for bank shots.",
          640,
          485,
        );
      }
    } else {
      c.textAlign = "left";
      c.font = "600 15px system-ui,sans-serif";
      c.fillStyle = "#9db4c8";
      c.fillText(
        state.mode === "solo" ? "SOLO // ARENA" : "VERSUS // LOCAL",
        38,
        34,
      );
      if (state.screen === "countdown" && state.ball) {
        c.textAlign = "center";
        c.font = "800 42px system-ui,sans-serif";
        c.fillStyle = "#edf7ff";
        c.fillText(state.ball.holdTimer.toFixed(1), 640, 400);
      }
    }
  },
};
