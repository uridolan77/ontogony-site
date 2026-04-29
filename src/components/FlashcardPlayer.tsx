import React, { useId, useMemo, useState } from 'react';

export type Flashcard = {
  front: string;
  back: string;
};

export type FlashcardPlayerProps = {
  title: string;
  cards: Flashcard[];
};

type Mark = 'unmarked' | 'got-it' | 'review-again';

function clampIndex(i: number, n: number) {
  if (n <= 0) return 0;
  return Math.min(Math.max(i, 0), n - 1);
}

export default function FlashcardPlayer({ title, cards }: FlashcardPlayerProps) {
  const deckId = useId();
  const total = cards.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [marks, setMarks] = useState<Record<number, Mark>>({});
  const [reviewMode, setReviewMode] = useState<'all' | 'missed'>('all');
  const [liveMessage, setLiveMessage] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const activeIndices = useMemo(() => {
    if (reviewMode === 'all') return cards.map((_, i) => i);
    const missed = [];
    for (let i = 0; i < total; i += 1) {
      if ((marks[i] ?? 'unmarked') === 'review-again') missed.push(i);
    }
    return missed;
  }, [cards, marks, reviewMode, total]);

  const viewTotal = activeIndices.length;
  const viewIndex = clampIndex(currentIndex, Math.max(viewTotal, 1));
  const absoluteIndex = viewTotal > 0 ? activeIndices[viewIndex] : 0;
  const card = cards[absoluteIndex];

  const gotItCount = useMemo(() => {
    let c = 0;
    for (let i = 0; i < total; i += 1) if ((marks[i] ?? 'unmarked') === 'got-it') c += 1;
    return c;
  }, [marks, total]);

  const reviewAgainCount = useMemo(() => {
    let c = 0;
    for (let i = 0; i < total; i += 1) if ((marks[i] ?? 'unmarked') === 'review-again') c += 1;
    return c;
  }, [marks, total]);

  const markedCount = useMemo(() => {
    let c = 0;
    for (let i = 0; i < total; i += 1) if ((marks[i] ?? 'unmarked') !== 'unmarked') c += 1;
    return c;
  }, [marks, total]);

  const hasMissed = reviewAgainCount > 0;

  function go(delta: number) {
    if (viewTotal <= 0) return;
    setCurrentIndex((prev) => clampIndex(prev + delta, viewTotal));
    setIsFlipped(false);
    setLiveMessage('');
  }

  function setMark(mark: Exclude<Mark, 'unmarked'>) {
    const wasUnmarked = (marks[absoluteIndex] ?? 'unmarked') === 'unmarked';
    const willBeFullyMarked = reviewMode === 'all' && wasUnmarked && markedCount + 1 >= total;

    setMarks((prev) => ({ ...prev, [absoluteIndex]: mark }));
    setLiveMessage(mark === 'got-it' ? 'Marked: got it.' : 'Marked: review again.');

    if (willBeFullyMarked) return;

    if (viewTotal > 0) {
      const next = viewIndex + 1;
      if (next < viewTotal) {
        setCurrentIndex(next);
        setIsFlipped(false);
      }
    }
  }

  function restart() {
    setCurrentIndex(0);
    setIsFlipped(false);
    setMarks({});
    setReviewMode('all');
    setLiveMessage('');
    setShowSummary(false);
  }

  function reviewMissed() {
    setReviewMode('missed');
    setCurrentIndex(0);
    setIsFlipped(false);
    setLiveMessage('Reviewing missed cards.');
    setShowSummary(false);
  }

  const liveId = `${deckId}-live`;
  const faceId = `${deckId}-face`;

  if (total === 0) {
    return (
      <section className="flash-shell" aria-label={`Flashcards: ${title}`}>
        <p className="flash-muted">No cards found.</p>
      </section>
    );
  }

  if (showSummary) {
    return (
      <section className="flash-shell" aria-label={`Flashcards: ${title}`}>
        <header className="flash-header">
          <div className="flash-kicker">FLASHCARDS</div>
          <h2 className="flash-title">{title}</h2>
        </header>

        <div className="flash-summary">
          <div className="flash-summary-row">
            <span className="flash-summary-label">Total</span>
            <span className="flash-summary-value">{total}</span>
          </div>
          <div className="flash-summary-row">
            <span className="flash-summary-label">Got it</span>
            <span className="flash-summary-value">{gotItCount}</span>
          </div>
          <div className="flash-summary-row">
            <span className="flash-summary-label">Review again</span>
            <span className="flash-summary-value">{reviewAgainCount}</span>
          </div>
        </div>

        <div className="flash-controls">
          <button type="button" className="flash-btn" onClick={restart}>
            Restart
          </button>
          {hasMissed && (
            <button
              type="button"
              className="flash-btn flash-btn-secondary"
              onClick={reviewMissed}
            >
              Review missed cards
            </button>
          )}
        </div>

        <p className="flash-live" aria-live="polite" id={liveId}>
          {liveMessage}
        </p>
      </section>
    );
  }

  const mark = marks[absoluteIndex] ?? 'unmarked';
  const statusLabel =
    mark === 'got-it' ? 'Got it.' : mark === 'review-again' ? 'Review again.' : 'Unmarked.';

  const isLastInView = viewIndex === viewTotal - 1;
  const inMissedMode = reviewMode === 'missed';
  const modeLabel = inMissedMode ? 'MISSED ONLY' : 'ALL CARDS';
  const isCompleteAll = reviewMode === 'all' && total > 0 && markedCount === total;

  return (
    <section className="flash-shell" aria-label={`Flashcards: ${title}`}>
      <header className="flash-header">
        <div className="flash-kicker">FLASHCARDS</div>
        <h2 className="flash-title">{title}</h2>
        <div className="flash-progress" aria-label="Progress">
          <span className="flash-progress-primary">
            Card {viewIndex + 1} / {viewTotal}
          </span>
          <span className="flash-progress-secondary">
            Marked {markedCount} / {total} · {modeLabel}
          </span>
        </div>
      </header>

      <div className="flash-rule" role="separator" aria-hidden="true" />

      <div className="flash-card">
        <div className="flash-face">
          <div className="flash-face-label">
            <span className="flash-pill">{isFlipped ? 'ANSWER' : 'FRONT'}</span>
            <span className="flash-status" aria-label={`Status: ${statusLabel}`}>
              {mark === 'got-it' ? '✓ GOT IT' : mark === 'review-again' ? '• REVIEW' : 'UNMARKED'}
            </span>
          </div>

          <p
            id={faceId}
            className="flash-text"
            aria-live="polite"
            aria-label={isFlipped ? `Back: ${card.back}` : `Front: ${card.front}`}
          >
            {isFlipped ? card.back : card.front}
          </p>
        </div>

        <div className="flash-controls">
          <button
            type="button"
            className="flash-btn flash-btn-secondary"
            onClick={() => go(-1)}
            disabled={viewIndex === 0}
          >
            Previous
          </button>

          {!isFlipped ? (
            <button
              type="button"
              className="flash-btn"
              aria-describedby={liveId}
              aria-controls={faceId}
              onClick={() => {
                setIsFlipped(true);
                setLiveMessage('Answer revealed.');
              }}
            >
              See answer
            </button>
          ) : (
            <div className="flash-mark-controls" role="group" aria-label="Mark this card">
              <button
                type="button"
                className="flash-btn"
                onClick={() => setMark('got-it')}
                aria-describedby={liveId}
              >
                Got it
              </button>
              <button
                type="button"
                className="flash-btn flash-btn-secondary"
                onClick={() => setMark('review-again')}
                aria-describedby={liveId}
              >
                Review again
              </button>
            </div>
          )}

          {isCompleteAll && !inMissedMode && (
            <button
              type="button"
              className="flash-btn"
              onClick={() => {
                setShowSummary(true);
                setLiveMessage('');
              }}
            >
              Finish deck
            </button>
          )}

          <button
            type="button"
            className="flash-btn flash-btn-secondary"
            onClick={() => {
              if (isLastInView && inMissedMode) {
                setReviewMode('all');
                setCurrentIndex(0);
                setIsFlipped(false);
                setLiveMessage('Missed review complete.');
              } else {
                go(1);
              }
            }}
            disabled={viewTotal <= 0}
          >
            {isLastInView && inMissedMode ? 'Finish missed review' : 'Next'}
          </button>
        </div>

        <p className="flash-live" aria-live="polite" id={liveId}>
          {liveMessage}
        </p>
      </div>
    </section>
  );
}

