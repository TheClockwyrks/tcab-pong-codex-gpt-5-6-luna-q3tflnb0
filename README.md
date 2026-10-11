# Carom

Carom is a fast top-down paddle duel about spin and bank shots. Guide the cyan
paddle through a solo rally against the pink AI, or challenge another player
locally while the amber obstacles turn every exchange into a geometry puzzle.

## Install and run

```sh
npm ci
npm run dev
```

Open the local Vite URL in a browser. To build the static site:

```sh
npm run build
npm run preview
```

The production files are written to `dist/` and can be served by any static
file server.

## Controls

- `W` / `S`: move player one
- `Up` / `Down`: move player two (or assist player one in Solo)
- `Enter` / `Space`: select a menu item
- `P` / `Escape`: pause or resume
- `M`: mute or unmute sound

Hit the ball near an edge to change its outgoing angle. Paddle movement at the
instant of contact adds spin, so changing speed and position together can bend a
rally around an obstacle.
