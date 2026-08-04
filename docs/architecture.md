# Architecture and authority boundaries

The production system is private. This document describes the public, sanitized
architecture pattern demonstrated by the reference model in this repository.

![Sanitized system flow](architecture.svg)

## The central boundary

The multimodal model proposes:

- which indexed photo tile may support a question;
- question wording and plausible answer choices;
- answer-specific character reactions;
- its own guess at the correct choice;
- focused rewrites after a correction.

On the default creation path that last guess is the answer key. Nothing
downstream asks a human to ratify it, and the sealed quiz records it as
canonical. Correction tools exist and work, but they sit behind a paid upgrade,
so the honest design assumption is that most sealed quizzes carry a
model-proposed key.

The boundary that actually holds, therefore, is not "a human decides truth." It
is that truth — however it was set — becomes immutable at seal time, and every
consumer of it downstream is constrained about what it may read, when, and on
what proof. A wrong key produces a wrong question. It does not produce a
mutable record, a leaked answer set, or a fabricated result.

## Correction as an optional path

`applyCreatorCorrections` is the sanitized form of the real capability:

- it accepts draft state only, so it can never rewrite a sealed quiz;
- it validates that a corrected choice exists on the question it names;
- it validates that every question named in the corrections exists;
- it marks the corrected question `sourceOfTruth: "creator"`, distinguishing it
  from the `model-proposal` default;
- it queues focused rewrites so the character's lines are rebuilt around the new
  truth instead of contradicting it.

That last point is why correction cannot be a cheap toggle: reactions were
authored against the model's guess, so changing the key without rewriting the
lines would ship a quiz that mocks a player for being right. The rewrite queue
is the mechanism that keeps the optional path coherent when it is taken.

## Player payload

The initial player payload contains only:

- quiz identity and title;
- question prompts;
- opaque choice identifiers and labels.

It deliberately excludes correct answers, raw model guesses, private creator
access, and answer reactions. A valid player pick unlocks only the current
question's reveal.

This is the invariant that does the most work under a model-proposed key. The
player cannot read the key, cannot tell from the payload which questions the
model was confident about, and cannot enumerate reactions to infer it.

## Social state

Named player seats provide the normal completion condition. A fixed deadline
provides the fallback condition so one absent friend cannot deadlock the group.
The fallback ranks only submitted attempts; it does not invent missing scores.

A model proposes questions. It does not decide when a group result is released
or what an absent player scored — those transitions are arithmetic on submitted
state.

## What this repository does not model

The public reference deliberately omits production providers, prompts,
deployment identifiers, analytics, image storage, abuse controls, payments, and
private moderation logic.
