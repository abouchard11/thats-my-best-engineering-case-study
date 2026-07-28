export const QUIZ_PHASE = Object.freeze({
  DRAFT: "draft",
  SEALED: "sealed",
});

function requireNonEmpty(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${label} must be a non-empty string`);
  }
}

function questionById(quiz, questionId) {
  const question = quiz.questions.find((candidate) => candidate.id === questionId);
  if (!question) {
    throw new RangeError(`Unknown question: ${questionId}`);
  }
  return question;
}

function requireChoice(question, choiceId) {
  if (!question.choices.some((choice) => choice.id === choiceId)) {
    throw new RangeError(`Unknown choice ${choiceId} for question ${question.id}`);
  }
}

export function applyCreatorCorrections(draft, corrections) {
  if (draft.phase !== QUIZ_PHASE.DRAFT) {
    throw new Error("Only an unsealed draft can be corrected");
  }

  const correctionsByQuestion = new Map(
    corrections.map(({ questionId, correctChoiceId }) => [
      questionId,
      correctChoiceId,
    ]),
  );

  const rewriteQueue = [];
  const questions = draft.questions.map((question) => {
    const correctedChoiceId = correctionsByQuestion.get(question.id);
    if (!correctedChoiceId || correctedChoiceId === question.correctChoiceId) {
      return { ...question };
    }

    requireChoice(question, correctedChoiceId);
    rewriteQueue.push(question.id);

    return {
      ...question,
      correctChoiceId: correctedChoiceId,
      sourceOfTruth: "creator",
    };
  });

  for (const questionId of correctionsByQuestion.keys()) {
    questionById(draft, questionId);
  }

  return {
    ...draft,
    revision: (draft.revision ?? 0) + 1,
    questions,
    rewriteQueue,
  };
}

export function sealQuiz(draft) {
  if (draft.phase !== QUIZ_PHASE.DRAFT) {
    throw new Error("Quiz is already sealed");
  }
  if (!Array.isArray(draft.questions) || draft.questions.length === 0) {
    throw new Error("A quiz needs at least one question");
  }

  for (const question of draft.questions) {
    requireNonEmpty(question.id, "question.id");
    requireNonEmpty(question.prompt, "question.prompt");
    if (!Array.isArray(question.choices) || question.choices.length < 2) {
      throw new Error(`Question ${question.id} needs at least two choices`);
    }
    requireChoice(question, question.correctChoiceId);
  }

  return {
    ...draft,
    phase: QUIZ_PHASE.SEALED,
    sealedRevision: draft.revision ?? 0,
    rewriteQueue: [],
  };
}

export function publicQuizPayload(privateQuiz) {
  if (privateQuiz.phase !== QUIZ_PHASE.SEALED) {
    throw new Error("Only a sealed quiz can be published");
  }

  return {
    id: privateQuiz.id,
    title: privateQuiz.title,
    questionCount: privateQuiz.questions.length,
    questions: privateQuiz.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      choices: question.choices.map(({ id, label }) => ({ id, label })),
    })),
  };
}

export function revealAfterPick(privateQuiz, { questionId, selectedChoiceId }) {
  if (privateQuiz.phase !== QUIZ_PHASE.SEALED) {
    throw new Error("Answers are unavailable before the quiz is sealed");
  }

  const question = questionById(privateQuiz, questionId);
  requireChoice(question, selectedChoiceId);
  const correct = selectedChoiceId === question.correctChoiceId;

  return {
    questionId,
    selectedChoiceId,
    correct,
    correctChoiceId: question.correctChoiceId,
    reaction: correct ? question.correctReaction : question.wrongReaction,
  };
}

function normalizedPlayerName(name) {
  requireNonEmpty(name, "player");
  return name.trim().toLocaleLowerCase("en-US");
}

export function createGroup({
  quizId,
  namedPlayers,
  createdAtMs,
  revealAfterMs,
}) {
  requireNonEmpty(quizId, "quizId");
  if (!Array.isArray(namedPlayers) || namedPlayers.length === 0) {
    throw new Error("A group needs at least one named player");
  }
  if (namedPlayers.length > 3) {
    throw new Error("This reference model supports at most three named players");
  }
  if (!Number.isFinite(createdAtMs) || !Number.isFinite(revealAfterMs)) {
    throw new TypeError("Group timing values must be finite numbers");
  }

  const normalized = namedPlayers.map(normalizedPlayerName);
  if (new Set(normalized).size !== normalized.length) {
    throw new Error("Named player seats must be unique");
  }

  return {
    quizId,
    namedPlayers: namedPlayers.map((name) => name.trim()),
    createdAtMs,
    revealAtMs: createdAtMs + revealAfterMs,
    attempts: {},
  };
}

export function recordAttempt(group, { player, score, submittedAtMs }) {
  const normalizedPlayer = normalizedPlayerName(player);
  const seat = group.namedPlayers.find(
    (candidate) => normalizedPlayerName(candidate) === normalizedPlayer,
  );
  if (!seat) {
    throw new Error(`${player} does not own a named seat`);
  }
  if (group.attempts[normalizedPlayer]) {
    throw new Error(`${seat} has already submitted`);
  }
  if (!Number.isInteger(score) || score < 0) {
    throw new TypeError("score must be a non-negative integer");
  }

  return {
    ...group,
    attempts: {
      ...group.attempts,
      [normalizedPlayer]: {
        player: seat,
        score,
        submittedAtMs,
      },
    },
  };
}

export function groupRevealStatus(group, nowMs) {
  const complete = Object.keys(group.attempts).length === group.namedPlayers.length;
  const timedOut = nowMs >= group.revealAtMs;

  if (!complete && !timedOut) {
    return {
      revealed: false,
      pendingPlayers: group.namedPlayers.filter(
        (player) => !group.attempts[normalizedPlayerName(player)],
      ),
    };
  }

  const ranking = Object.values(group.attempts).sort(
    (a, b) => b.score - a.score || a.submittedAtMs - b.submittedAtMs,
  );

  return {
    revealed: true,
    reason: complete ? "all_named_players_submitted" : "deterministic_timeout",
    ranking,
  };
}

