import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { LandingMotion } from "@/components/landing/LandingMotion";

type ObserverEntry = { target: Element; isIntersecting: boolean };

class IntersectionObserverStub {
  static instances: IntersectionObserverStub[] = [];
  readonly callback: (entries: ObserverEntry[]) => void;
  readonly options: IntersectionObserverInit | undefined;
  readonly observed: Element[] = [];
  readonly unobserved: Element[] = [];
  readonly disconnect = vi.fn();

  constructor(
    callback: (entries: ObserverEntry[]) => void,
    options?: IntersectionObserverInit,
  ) {
    this.callback = callback;
    this.options = options;
    IntersectionObserverStub.instances.push(this);
  }

  observe = vi.fn((target: Element) => {
    this.observed.push(target);
  });

  unobserve = vi.fn((target: Element) => {
    this.unobserved.push(target);
  });
}

afterEach(() => {
  cleanup();
  IntersectionObserverStub.instances = [];
  vi.unstubAllGlobals();
});

describe("LandingMotion", () => {
  it("sets up an observer for every reveal target with the configured options", () => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

    const { container } = render(
      <LandingMotion rootMargin="0px" threshold={0.25}>
        <section data-motion-reveal="first" />
        <section data-motion-reveal="second" />
      </LandingMotion>,
    );

    const observer = IntersectionObserverStub.instances[0];
    expect(observer.options).toEqual({ rootMargin: "0px", threshold: 0.25 });
    expect(observer.observed).toEqual(
      Array.from(container.querySelectorAll("[data-motion-reveal]")),
    );
  });

  it("reveals an intersecting target once and stops observing it", () => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

    const { container } = render(
      <LandingMotion>
        <section data-motion-reveal />
      </LandingMotion>,
    );

    const target = container.querySelector("[data-motion-reveal]")!;
    const observer = IntersectionObserverStub.instances[0];

    observer.callback([{ target, isIntersecting: true }]);
    observer.callback([{ target, isIntersecting: true }]);

    expect(target).toHaveAttribute("data-revealed", "true");
    expect(observer.unobserved).toEqual([target]);
    expect(observer.unobserve).toHaveBeenCalledOnce();
  });

  it("disconnects the observer when unmounted", () => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

    const { unmount } = render(
      <LandingMotion>
        <section data-motion-reveal />
      </LandingMotion>,
    );
    const observer = IntersectionObserverStub.instances[0];

    unmount();

    expect(observer.disconnect).toHaveBeenCalledOnce();
  });

  it("keeps reveal content available when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);

    const { container } = render(
      <LandingMotion>
        <section data-motion-reveal>Static content</section>
      </LandingMotion>,
    );

    expect(container).toHaveTextContent("Static content");
    expect(container.querySelector("[data-motion-reveal]")).not.toHaveAttribute(
      "data-revealed",
      );
  });

  it("does not enable observer-driven motion when reduced motion is preferred", () => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));

    const { container } = render(
      <LandingMotion>
        <section data-motion-reveal>Reduced motion content</section>
      </LandingMotion>,
    );

    expect(IntersectionObserverStub.instances).toHaveLength(0);
    expect(container.firstElementChild).not.toHaveAttribute("data-motion-enabled");
    expect(container).toHaveTextContent("Reduced motion content");
  });

  it("uses the normal observer path when matchMedia is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
    vi.stubGlobal("matchMedia", undefined);

    const { container } = render(
      <LandingMotion>
        <section data-motion-reveal>Fallback content</section>
      </LandingMotion>,
    );

    expect(IntersectionObserverStub.instances).toHaveLength(1);
    expect(container.firstElementChild).toHaveAttribute("data-motion-enabled");
    expect(container).toHaveTextContent("Fallback content");
  });
});
