# Privacy and safety boundaries

This public repository contains no user photos, production prompts, credentials,
deployment identifiers, private analytics, or raw quiz records.

## Product boundaries represented here

1. **User-supplied evidence**
   Questions are grounded in screenshots supplied by the creator.
2. **Creator-confirmed truth**
   The person who knows the photos confirms or corrects the answer key.
3. **No answer leakage**
   The player payload excludes correct answers and raw model guesses.
4. **Progressive reveal**
   The server returns the current answer only after a valid pick.
5. **Deterministic group completion**
   Named players or a fixed timeout control the reveal; the model does not.

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

