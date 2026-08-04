# Privacy and safety boundaries

This public repository contains no user photos, production prompts, credentials,
deployment identifiers, private analytics, or raw quiz records.

## Product boundaries represented here

1. **User-supplied evidence**
   Questions are grounded in screenshots supplied by the creator.
2. **Model-proposed truth, optionally corrected**
   The model proposes the answer key and, on the default path, that proposal is
   what gets sealed. The person who knows the photos can override it with the
   paid correction tools, but nothing requires them to, so the guarantees below
   are written to hold without that step.
3. **No answer leakage**
   The player payload excludes correct answers and raw model guesses.
4. **Progressive reveal**
   The server returns the current answer only after a valid pick.
5. **Immutable seal**
   Once sealed, the answer key is not editable through the correction path.
6. **Deterministic group completion**
   Named players or a fixed timeout control the reveal; the model does not.

## What a wrong answer key can and cannot do

Because the model's guess is what ships by default, the useful safety question
is not "can it be wrong" — it can, and the product says so on the creation
screen. It is what a wrong one reaches. A wrong key produces one wrong question
and one unfair reaction. It does not reach the sealed record (immutable), the
rest of the answers (never in the player payload), the reveal order (one valid
pick at a time), or the group result (arithmetic on submitted attempts only).

## Deliberately private

- provider prompts and moderation policies;
- credentials and environment configuration;
- storage paths and infrastructure identifiers;
- exact abuse-prevention thresholds;
- private analytics events and user records;
- creator-only access material.

The production product has additional controls. Their omission here is a
disclosure boundary, not a claim that this small reference model is a complete
production system.

