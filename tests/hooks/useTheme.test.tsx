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
});
