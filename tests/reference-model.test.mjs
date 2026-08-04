import test from "node:test";
import assert from "node:assert/strict";

import {
  QUIZ_PHASE,
  applyCreatorCorrections,
  createGroup,
  groupRevealStatus,
  publicQuizPayload,
  recordAttempt,
  revealAfterPick,
  sealQuiz,
} from "../src/reference-model.mjs";

function sampleDraft() {
  return {
    id: "quiz-001",
    title: "Who actually noticed?",
    phase: QUIZ_PHASE.DRAFT,
    revision: 0,
    creatorAccessToken: "private-creator-link",
    questions: [
      {
        id: "q1",
        prompt: "Which tile showed the finish-line certificate?",
        choices: [
          { id: "a", label: "Top left" },
          { id: "b", label: "Bottom center" },
          { id: "c", label: "Top right" },
        ],
        correctChoiceId: "a",
        aiGuess: "a",
        sourceOfTruth: "model-proposal",
        correctReaction: "You looked.",
        wrongReaction: "The certificate had less camouflage than that.",
      },
    ],
  };
}

test("public payload omits answers, model guesses, reactions, and creator access", () => {
  const sealed = sealQuiz(sampleDraft());
  const payload = publicQuizPayload(sealed);
  const serialized = JSON.stringify(payload);

  assert.equal(payload.questionCount, 1);
  assert.equal(payload.questions[0].choices.length, 3);
  assert.doesNotMatch(
    serialized,
    /correctChoiceId|aiGuess|Reaction|creatorAccessToken|sourceOfTruth/,
  );
});

test("a per-question answer is revealed only after a valid pick", () => {
  const sealed = sealQuiz(sampleDraft());
  const publicPayload = publicQuizPayload(sealed);

  assert.equal(publicPayload.questions[0].correctChoiceId, undefined);

  const reveal = revealAfterPick(sealed, {
    questionId: "q1",
    selectedChoiceId: "b",
  });

  assert.deepEqual(reveal, {
    questionId: "q1",
    selectedChoiceId: "b",
    correct: false,
    correctChoiceId: "a",
    reaction: "The certificate had less camouflage than that.",
  });
});

test("an invalid pick cannot probe the answer endpoint", () => {
  const sealed = sealQuiz(sampleDraft());

  assert.throws(
    () =>
      revealAfterPick(sealed, {
        questionId: "q1",
        selectedChoiceId: "not-a-choice",
      }),
    /Unknown choice/,
  );
});

test("an optional creator correction replaces the model proposal and queues a focused rewrite", () => {
  const corrected = applyCreatorCorrections(sampleDraft(), [
    { questionId: "q1", correctChoiceId: "c" },
  ]);

  assert.equal(corrected.questions[0].correctChoiceId, "c");
  assert.equal(corrected.questions[0].sourceOfTruth, "creator");
  assert.deepEqual(corrected.rewriteQueue, ["q1"]);
  assert.equal(corrected.revision, 1);

  const reveal = revealAfterPick(sealQuiz(corrected), {
    questionId: "q1",
    selectedChoiceId: "c",
  });
  assert.equal(reveal.correct, true);
  assert.equal(reveal.correctChoiceId, "c");
});

test("a sealed quiz rejects later answer-key mutation", () => {
  const sealed = sealQuiz(sampleDraft());

  assert.throws(
    () =>
      applyCreatorCorrections(sealed, [
        { questionId: "q1", correctChoiceId: "b" },
      ]),
    /unsealed draft/,
  );
});

test("group reveal waits for every named player", () => {
  let group = createGroup({
    quizId: "quiz-001",
    namedPlayers: ["Alex", "Sam"],
    createdAtMs: 1_000,
    revealAfterMs: 60_000,
  });
  group = recordAttempt(group, {
    player: "Alex",
    score: 4,
    submittedAtMs: 2_000,
  });

  assert.deepEqual(groupRevealStatus(group, 10_000), {
    revealed: false,
    pendingPlayers: ["Sam"],
  });

  group = recordAttempt(group, {
    player: "Sam",
    score: 5,
    submittedAtMs: 3_000,
  });
  const result = groupRevealStatus(group, 4_000);

  assert.equal(result.revealed, true);
  assert.equal(result.reason, "all_named_players_submitted");
  assert.deepEqual(
    result.ranking.map(({ player, score }) => ({ player, score })),
    [
      { player: "Sam", score: 5 },
      { player: "Alex", score: 4 },
    ],
  );
});

test("a deterministic timeout releases the completed attempts without inventing scores", () => {
  let group = createGroup({
    quizId: "quiz-001",
    namedPlayers: ["Alex", "Sam"],
    createdAtMs: 1_000,
    revealAfterMs: 60_000,
  });
  group = recordAttempt(group, {
    player: "Alex",
    score: 4,
    submittedAtMs: 2_000,
  });

  const result = groupRevealStatus(group, 61_000);

  assert.equal(result.revealed, true);
  assert.equal(result.reason, "deterministic_timeout");
  assert.equal(result.ranking.length, 1);
  assert.equal(result.ranking[0].player, "Alex");
});

