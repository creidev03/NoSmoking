import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

import { db } from "@/lib/db";
import { getProgress, updateProgress, incrementProgress } from "@/lib/achievements/progress";

const mockDb = vi.mocked(db);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("progress", () => {
  describe("getProgress", () => {
    it("returns progress value when record exists", async () => {
      mockDb.limit.mockResolvedValue([{ currentValue: 5 }]);

      const result = await getProgress("user-1", "T001");
      expect(result).toBe(5);
    });

    it("returns 0 when no record exists", async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await getProgress("user-1", "T001");
      expect(result).toBe(0);
    });
  });

  describe("updateProgress", () => {
    it("inserts new record when none exists", async () => {
      mockDb.limit.mockResolvedValue([]);

      await updateProgress("user-1", "T001", 5);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          achievementId: "T001",
          currentValue: 5,
        })
      );
    });

    it("updates existing record when one exists", async () => {
      mockDb.limit.mockResolvedValue([{ currentValue: 3 }]);

      await updateProgress("user-1", "T001", 5);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          currentValue: 5,
        })
      );
    });
  });

  describe("incrementProgress", () => {
    it("increments existing progress by 1", async () => {
      mockDb.limit.mockResolvedValue([{ currentValue: 4 }]);

      await incrementProgress("user-1", "T001");
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          currentValue: 5,
        })
      );
    });

    it("creates new record with value 1 when none exists", async () => {
      mockDb.limit.mockResolvedValue([]);

      await incrementProgress("user-1", "T001");
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          currentValue: 1,
        })
      );
    });
  });
});
