# Architecture and authority boundaries

The production system is private. This document describes the public, sanitized
architecture pattern demonstrated by the reference model in this repository.

![Sanitized system flow](architecture.svg)

## The central boundary

The multimodal model is allowed to propose:

- which indexed photo tile may support a question;
- question wording and plausible answer choices;
- answer-specific character reactions;
- focused rewrites after a correction.

It is not allowed to establish product truth.

Before publication, the creator reviews the selected visual evidence and
confirms or changes the answer key. The sealed revision becomes the canonical
quiz state.

## Player payload

The initial player payload contains only:

- quiz identity and title;
- question prompts;
- opaque choice identifiers and labels.

It deliberately excludes correct answers, raw model guesses, private creator
access, and answer reactions. A valid player pick unlocks only the current
question's reveal.

## Social state

Named player seats provide the normal completion condition. A fixed deadline
provides the fallback condition so one absent friend cannot deadlock the group.
The fallback ranks only submitted attempts; it does not invent missing scores.

## What this repository does not model

The public reference deliberately omits production providers, prompts,
deployment identifiers, analytics, image storage, abuse controls, payments, and
private moderation logic.

