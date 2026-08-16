import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTheme } from "@/hooks/useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("defaults to system theme", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      // Allow useEffect to run
    });

    expect(result.current.theme).toBe("system");
  });

  it("reads stored theme from localStorage", () => {
    localStorage.setItem("theme", "dark");

    const { result } = renderHook(() => useTheme());

    act(() => {
      // Allow useEffect to run
    });

    expect(result.current.theme).toBe("dark");
  });

  it("applies dark class when theme is dark", () => {
    localStorage.setItem("theme", "dark");

    renderHook(() => useTheme());

    act(() => {
      // Allow useEffect to run
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class when theme is light", () => {
    localStorage.setItem("theme", "light");

    renderHook(() => useTheme());

    act(() => {
      // Allow useEffect to run
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggles theme", () => {
    localStorage.setItem("theme", "light");

    const { result } = renderHook(() => useTheme());

    act(() => {
      // Allow useEffect to run
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("persists theme to localStorage", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      // Allow useEffect to run
    });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  // --- New tests for shared state ---

  it("initialTheme syncs global state on mount", () => {
    localStorage.setItem("theme", "light");

    const { result } = renderHook(() => useTheme("dark"));

    act(() => {
      // Allow useEffect to run
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("two hook instances share state via subscribers", () => {
    const { result: instance1 } = renderHook(() => useTheme());
    const { result: instance2 } = renderHook(() => useTheme());

    act(() => {
      // Allow useEffect to run
    });

    // Set theme on first instance
    act(() => {
      instance1.current.setTheme("dark");
    });

    // Both instances should reflect the change
    expect(instance1.current.theme).toBe("dark");
    expect(instance2.current.theme).toBe("dark");
    expect(instance1.current.resolvedTheme).toBe("dark");
    expect(instance2.current.resolvedTheme).toBe("dark");
  });

  it("subscriber notification on setTheme", () => {
    const { result: instance1 } = renderHook(() => useTheme());
    const { result: instance2 } = renderHook(() => useTheme());

    act(() => {
      // Allow useEffect to run
    });

    // Initially both are system
    expect(instance1.current.theme).toBe("system");
    expect(instance2.current.theme).toBe("system");

    // Change via first instance
    act(() => {
      instance1.current.setTheme("light");
    });

    // Second instance picks up the change
    expect(instance2.current.theme).toBe("light");
    expect(instance2.current.resolvedTheme).toBe("light");
  });
});
