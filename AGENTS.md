<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Game is a single route (`/`) with a screen state machine; character model/options live in `src/game/character.ts`, worlds registry in `src/game/worlds.ts` — add new worlds there so the saved character is reused everywhere.
- Character and progress use separate localStorage keys so editing the avatar never resets progress.
- Offline: vite-plugin-pwa generateSW (`/sw.js`), registered only via `src/lib/pwa.ts` guards (never in dev/preview).
- World activities are isolated game components backed by browser-safe domain helpers; completion updates the existing progress store without touching the character.
