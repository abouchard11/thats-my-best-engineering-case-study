# That's My Best: Human-Confirmed Multimodal Quiz System

[![CI](https://github.com/abouchard11/thats-my-best-engineering-case-study/actions/workflows/ci.yml/badge.svg)](https://github.com/abouchard11/thats-my-best-engineering-case-study/actions/workflows/ci.yml)

**Screenshots in. A playable social memory test out.**

[Live product](https://thatsmybest.com/) ·
[iPhone app](https://apps.apple.com/us/app/thats-my-best-ai-friend-quiz/id6788340469) ·
[Engineering workfolio](https://midnightdev.dev/work/thatsmybest)

> **Generate boldly. Validate cheaply. Kill ruthlessly. Scale what survives.**

My operating rule is simple: models propose and challenge; explicit authority
boundaries, human confirmation, and machine-checkable invariants decide what
ships.

That's My Best turns one to four social-grid screenshots into a five-question
friend quiz. A multimodal model proposes visual evidence, questions, choices,
and character reactions. The creator confirms the answer key before the quiz
is sealed and shared.

The defining product decision is simple:

> **The model can propose the quiz. It cannot become the answer key.**

## Public disclosure

This is a **sanitized engineering case study and executable reference model**,
not the private production source. It preserves the authority boundaries that
matter while withholding prompts, credentials, user content, provider wiring,
private analytics, and operational defenses.

![Sanitized architecture](docs/architecture.svg)

## What the code proves

| Invariant | Reference implementation | Test |
|---|---|---|
| Player payloads do not contain answers | `publicQuizPayload` copies only prompts and choices | Payload serialization rejects private fields |
| Answers appear only after a valid pick | `revealAfterPick` validates question and choice IDs | Invalid-choice probing fails |
| Human corrections replace model proposals | `applyCreatorCorrections` changes the canonical key and queues focused rewrites | Corrected key controls the sealed reveal |
| Sealed state is immutable through the correction API | Corrections accept draft state only | Post-seal correction fails |
| Group reveal has deterministic completion rules | `groupRevealStatus` waits for named players or a fixed deadline | Completion and timeout paths are tested |
| Missing players never receive invented scores | Timeout ranking uses submitted attempts only | Partial ranking stays partial |

## Product loop

1. The creator supplies one to four grid screenshots.
2. A deterministic image pipeline indexes the visible tiles.
3. The multimodal model proposes questions and reactions from those tiles.
4. The creator confirms or corrects the selected evidence and answer key.
5. The sealed public payload excludes answers and creator-only material.
6. Each valid player pick unlocks only that question's reveal.
7. Named-player completion or a fixed deadline releases the group result.

The production system adds image processing, storage, moderation, analytics,
payments, anti-abuse controls, and native-app integration. Those details are
outside this public disclosure.

## Evidence snapshot

Verified on **2026-07-28**:

- The product is live on the web and in the Apple App Store.
- Apple lists **Alex Bouchard** as the developer.
- Public product copy documents the one-to-four-screenshot input, five-question
  output, creator-confirmed answer key, and one-to-three-friend social loop.
- Early soft-launch generation cost measured roughly **6–7¢ per completed
  quiz**. That is a cost observation, not a traction claim.

See the [evidence ledger](docs/evidence-ledger.md) for sources and
qualifications.

## Run the reference model

Requires Node.js 20 or newer. It has no runtime dependencies.

```bash
npm test
```

## Repository map

```text
src/reference-model.mjs       Authority-boundary reference implementation
tests/reference-model.test.mjs
docs/architecture.md          System and trust-boundary explanation
docs/evidence-ledger.md       Public claims and qualifications
docs/privacy-and-safety.md    Disclosure and safety boundaries
```

## Why this belongs in an applied-AI workfolio

The hard part was not calling a vision model. It was deciding what a probabilistic
system may suggest, what a human must confirm, what the player may receive, and
which state transitions must remain deterministic.

That pattern carries into any AI product where a fluent output can be mistaken
for truth.

---

Designed and authored by **Alex Bouchard**, solo founder and applied AI product
engineer in Houston, Texas.
