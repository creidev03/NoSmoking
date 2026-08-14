import { describe, it, expect } from "vitest";
import { evaluateBadges } from "@/lib/badges";

describe("badges", () => {
  describe("evaluateBadges", () => {
    it("returns PrimeraSemana when streak reaches 7 with no existing badges", () => {
      const result = evaluateBadges(7, []);
      expect(result).toEqual(["primera_semana"]);
    });

    it("returns UnMesLimpio when streak reaches 30 (with prior badge)", () => {
      const result = evaluateBadges(30, ["primera_semana"]);
      expect(result).toEqual(["un_mes"]);
    });

    it("returns Centenario when streak reaches 100 (with prior badges)", () => {
      const result = evaluateBadges(100, ["primera_semana", "un_mes"]);
      expect(result).toEqual(["centenario"]);
    });

    it("returns UnAno when streak reaches 365 (with prior badges)", () => {
      const result = evaluateBadges(365, [
        "primera_semana",
        "un_mes",
        "centenario",
      ]);
      expect(result).toEqual(["un_ano"]);
    });

    it("does not duplicate already earned badges", () => {
      const result = evaluateBadges(7, ["primera_semana"]);
      expect(result).toEqual([]);
    });

    it("returns multiple badges at once when crossing multiple thresholds", () => {
      const result = evaluateBadges(365, []);
      expect(result).toContain("primera_semana");
      expect(result).toContain("un_mes");
      expect(result).toContain("centenario");
      expect(result).toContain("un_ano");
    });

    it("returns empty array for streak below all thresholds", () => {
      const result = evaluateBadges(3, []);
      expect(result).toEqual([]);
    });

    it("returns empty array when all badges already earned", () => {
      const result = evaluateBadges(365, [
        "primera_semana",
        "un_mes",
        "centenario",
        "un_ano",
      ]);
      expect(result).toEqual([]);
    });

    it("returns only new badges when some already earned", () => {
      const result = evaluateBadges(100, ["primera_semana", "un_mes"]);
      expect(result).toEqual(["centenario"]);
    });

    it("returns empty array for streak of 6 (just below threshold)", () => {
      const result = evaluateBadges(6, []);
      expect(result).toEqual([]);
    });

    it("returns only primera_semana for streak of 29 (just below UnMes)", () => {
      const result = evaluateBadges(29, []);
      expect(result).toEqual(["primera_semana"]);
    });

    it("returns primera_semana and un_mes for streak of 99 (just below Centenario)", () => {
      const result = evaluateBadges(99, []);
      expect(result).toEqual(["primera_semana", "un_mes"]);
    });
  });
});
