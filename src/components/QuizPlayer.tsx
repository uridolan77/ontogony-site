import React, { useId, useMemo, useState } from 'react';

export type QuizOption = {
  text: string;
  isCorrect: boolean;
  rationale?: string;
};

export type QuizQuestion = {
  question: string;
  options: QuizOption[];
  hint?: string;
};

export type QuizPlayerProps = {
  title: string;
  questions: QuizQuestion[];
};

type AnswerState = {
  selectedIndex: number | null;
  isCorrect: boolean | null;
};

function clampIndex(i: number, n: number) {
  if (n <= 0) return 0;
  return Math.min(Math.max(i, 0), n - 1);
}

export default function QuizPlayer({ title, questions }: QuizPlayerProps) {
  const quizId = useId();
  const total = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [hintOpen, setHintOpen] = useState<Record<number, boolean>>({});
  const [liveMessage, setLiveMessage] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);

  const current = questions[currentIndex];
  const currentAnswer = answers[currentIndex] ?? { selectedIndex: null, isCorrect: null };
  const hasAnswered = currentAnswer.selectedIndex !== null;

  const score = useMemo(() => {
    let s = 0;
    for (let i = 0; i < total; i += 1) {
      const a = answers[i];
      if (a?.isCorrect) s += 1;
    }
    return s;
  }, [answers, total]);

  const answeredCount = useMemo(() => {
    let c = 0;
    for (let i = 0; i < total; i += 1) {
      if (answers[i]?.selectedIndex !== null && answers[i]?.selectedIndex !== undefined) c += 1;
    }
    return c;
  }, [answers, total]);

  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  const feedbackId = `${quizId}-feedback`;
  const hintId = `${quizId}-hint`;

  function selectOption(optionIndex: number) {
    if (hasAnswered) return;
    const option = current.options[optionIndex];
    const ok = Boolean(option?.isCorrect);
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: { selectedIndex: optionIndex, isCorrect: ok },
    }));
    setLiveMessage(ok ? 'Correct.' : 'Incorrect.');
  }

  function go(delta: number) {
    setCurrentIndex((prev) => clampIndex(prev + delta, total));
    setLiveMessage('');
  }

  function restart() {
    setCurrentIndex(0);
    setAnswers({});
    setHintOpen({});
    setLiveMessage('');
    setShowSummary(false);
  }

  if (total === 0) {
    return (
      <section className="quiz-shell" aria-label={`Quiz: ${title}`}>
        <p className="quiz-muted">No questions found.</p>
      </section>
    );
  }

  if (showSummary) {
    return (
      <section className="quiz-shell" aria-label={`Quiz: ${title}`}>
        <header className="quiz-header">
          <div className="quiz-kicker">QUIZ</div>
          <h2 className="quiz-title">{title}</h2>
        </header>

        <div className="quiz-summary">
          <div className="quiz-summary-row">
            <span className="quiz-summary-label">Score</span>
            <span className="quiz-summary-value">
              {score} / {total}
            </span>
          </div>
          <div className="quiz-summary-row">
            <span className="quiz-summary-label">Percentage</span>
            <span className="quiz-summary-value">{percent}%</span>
          </div>
        </div>

        <div className="quiz-controls">
          <button type="button" className="quiz-btn" onClick={restart}>
            Restart
          </button>
          <button
            type="button"
            className="quiz-btn quiz-btn-secondary"
            onClick={() => {
              setShowSummary(false);
              setCurrentIndex(0);
              setLiveMessage('');
            }}
          >
            Review questions
          </button>
        </div>

        <p className="quiz-live" aria-live="polite">
          {liveMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="quiz-shell" aria-label={`Quiz: ${title}`}>
      <header className="quiz-header">
        <div className="quiz-kicker">QUIZ</div>
        <h2 className="quiz-title">{title}</h2>
        <div className="quiz-progress" aria-label="Progress">
          <span className="quiz-progress-primary">
            Question {currentIndex + 1} / {total}
          </span>
          <span className="quiz-progress-secondary">
            Answered {answeredCount} / {total}
          </span>
        </div>
      </header>

      <div className="quiz-rule" role="separator" aria-hidden="true" />

      <div className="quiz-question">
        <p className="quiz-question-text">{current.question}</p>

        {current.hint && (
          <div className="quiz-hint">
            <button
              type="button"
              className="quiz-btn quiz-btn-secondary"
              aria-expanded={Boolean(hintOpen[currentIndex])}
              aria-controls={hintId}
              onClick={() =>
                setHintOpen((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }))
              }
            >
              {hintOpen[currentIndex] ? 'Hide hint' : 'Show hint'}
            </button>
            {hintOpen[currentIndex] && (
              <div id={hintId} className="quiz-hint-body">
                <span className="quiz-pill">HINT</span> {current.hint}
              </div>
            )}
          </div>
        )}

        <div className="quiz-options" role="group" aria-label="Answer options">
          {current.options.map((opt, oi) => {
            const selected = currentAnswer.selectedIndex === oi;
            const isCorrect = Boolean(opt.isCorrect);
            const showCorrect = hasAnswered && isCorrect;
            const showWrong = hasAnswered && selected && !isCorrect;

            const stateLabel = !hasAnswered
              ? ''
              : showCorrect
                ? 'Correct answer.'
                : showWrong
                  ? 'Selected answer. Incorrect.'
                  : selected
                    ? 'Selected answer.'
                    : '';

            return (
              <div key={oi} className="quiz-option">
                <button
                  type="button"
                  className={[
                    'quiz-option-btn',
                    selected ? 'is-selected' : '',
                    showCorrect ? 'is-correct' : '',
                    showWrong ? 'is-wrong' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={hasAnswered}
                  aria-describedby={feedbackId}
                  onClick={() => selectOption(oi)}
                >
                  <span className="quiz-option-text">{opt.text}</span>
                  {hasAnswered && (
                    <span className="quiz-option-mark" aria-hidden="true">
                      {showCorrect ? '✓' : showWrong ? '×' : selected ? '•' : ''}
                    </span>
                  )}
                </button>

                {hasAnswered && (selected || isCorrect) && (opt.rationale || stateLabel) && (
                  <div className="quiz-rationale">
                    <span className="quiz-pill">
                      {showCorrect ? 'CORRECT' : showWrong ? 'INCORRECT' : isCorrect ? 'ANSWER' : 'NOTE'}
                    </span>
                    {opt.rationale ? (
                      <span className="quiz-rationale-text">{opt.rationale}</span>
                    ) : (
                      <span className="quiz-rationale-text">{stateLabel}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p id={feedbackId} className="quiz-live" aria-live="polite">
          {hasAnswered ? (currentAnswer.isCorrect ? 'Correct.' : 'Incorrect.') : liveMessage}
        </p>
      </div>

      <div className="quiz-controls">
        <button
          type="button"
          className="quiz-btn quiz-btn-secondary"
          onClick={() => go(-1)}
          disabled={currentIndex === 0}
        >
          Previous
        </button>

        {!hasAnswered ? (
          <span className="quiz-muted">Select an answer to continue.</span>
        ) : (
          <button
            type="button"
            className="quiz-btn"
            onClick={() => {
              if (currentIndex >= total - 1) {
                setShowSummary(true);
                setLiveMessage('');
                return;
              }
              setCurrentIndex((prev) => clampIndex(prev + 1, total));
              setLiveMessage('');
            }}
          >
            Next
          </button>
        )}
      </div>
    </section>
  );
}

