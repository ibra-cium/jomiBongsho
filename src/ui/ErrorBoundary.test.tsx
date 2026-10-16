// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws on demand
function ProblemChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test crash in component');
  }
  return <div>সবকিছু ঠিক আছে</div>;
}

function TestParent() {
  const [shouldThrow, setShouldThrow] = useState(false);
  return (
    <ErrorBoundary onReset={() => setShouldThrow(false)}>
      <ProblemChild shouldThrow={shouldThrow} />
      <button onClick={() => setShouldThrow(true)}>ক্র্যাশ করুন</button>
    </ErrorBoundary>
  );
}

describe('ErrorBoundary (P1-T12)', () => {
  const originalError = console.error;

  beforeEach(() => {
    // Suppress React boundary console noise during test
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>শান্তিপূর্ণ অ্যাপ</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('শান্তিপূর্ণ অ্যাপ')).toBeDefined();
  });

  it('catches render errors and displays friendly fallback UI with reset action', () => {
    render(<TestParent />);

    // Initially child is visible
    expect(screen.getByText('সবকিছু ঠিক আছে')).toBeDefined();

    // Trigger error
    fireEvent.click(screen.getByText('ক্র্যাশ করুন'));

    // Friendly fallback appears
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('কিছু ভুল হয়েছে')).toBeDefined();

    // Reset button works
    const retryBtn = screen.getByText('আবার চেষ্টা করুন');
    fireEvent.click(retryBtn);

    // Recovers
    expect(screen.getByText('সবকিছু ঠিক আছে')).toBeDefined();
  });

  it('renders custom fallback function if provided', () => {
    const customFallback = vi.fn((err: Error, reset: () => void) => (
      <div>
        <span>কাস্টম ত্রুটি: {err.message}</span>
        <button onClick={reset}>কাস্টম রিসেট</button>
      </div>
    ));

    render(
      <ErrorBoundary fallback={customFallback}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('কাস্টম ত্রুটি: Test crash in component')).toBeDefined();
    expect(screen.getByText('কাস্টম রিসেট')).toBeDefined();
  });
});
