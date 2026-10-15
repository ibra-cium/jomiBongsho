/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInstallPrompt } from './pwa';

describe('useInstallPrompt', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('initializes with canInstall=false when no prompt event has fired', () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it('updates canInstall when beforeinstallprompt event is dispatched', () => {
    const { result } = renderHook(() => useInstallPrompt());

    const fakeEvent = new Event('beforeinstallprompt');
    Object.assign(fakeEvent, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    });

    act(() => {
      window.dispatchEvent(fakeEvent);
    });

    expect(result.current.canInstall).toBe(true);
  });

  it('triggers prompt and updates state when promptInstall is called', async () => {
    const { result } = renderHook(() => useInstallPrompt());

    const fakeEvent = new Event('beforeinstallprompt');
    const promptMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(fakeEvent, {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    });

    act(() => {
      window.dispatchEvent(fakeEvent);
    });

    let accepted = false;
    await act(async () => {
      accepted = await result.current.promptInstall();
    });

    expect(accepted).toBe(true);
    expect(promptMock).toHaveBeenCalledTimes(1);
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });
});
