"use client";

import { useState } from "react";
import { registerCigaretteMulti } from "@/app/dashboard/actions";
import type { GameState } from "@/lib/game-state";

interface RegisterCigaretteModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: (gameState: GameState, penalty: boolean) => void;
}

const QUANTITIES = [1, 2, 3, 4, 5] as const;

export function RegisterCigaretteModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: RegisterCigaretteModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await registerCigaretteMulti(userId, quantity, note || undefined);
      onSuccess(result.gameState, result.penalties);
      setQuantity(1);
      setNote("");
      onClose();
    } catch (err) {
      console.error("Failed to register cigarette", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl dark:border-[#374151] dark:bg-[#1F2937]">
        <h2 className="mb-1 text-lg font-bold text-[#1F2937] dark:text-[#F3F4F6]">
          Registrar cigarro
        </h2>
        <p className="mb-5 text-sm text-[#6B7280]">
          ¿Cuántos cigarros fumaste?
        </p>

        {/* Quantity selector */}
        <div className="mb-4 grid grid-cols-5 gap-2">
          {QUANTITIES.map((q) => (
            <button
              key={q}
              onClick={() => setQuantity(q)}
              className={`flex h-11 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all active:scale-95 ${
                quantity === q
                  ? "border-[#EF4444] bg-[#EF4444] text-white"
                  : "border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] hover:border-[#D1D5DB] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F3F4F6] dark:hover:border-[#4B5563]"
              }`}
            >
              {q === 5 ? "5+" : q}
            </button>
          ))}
        </div>

        {/* Penalty warning */}
        {quantity >= 5 && (
          <div className="mb-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#991B1B] dark:border-[#991B1B] dark:bg-[#7F1D1D]/30 dark:text-[#FCA5A5]">
            ⚠️ 5 o más cigarros = perderás 1 vida
          </div>
        )}

        {/* Note field */}
        <div className="mb-5">
          <label
            htmlFor="cigarette-note"
            className="mb-1 block text-xs font-medium text-[#6B7280]"
          >
            Motivo (opcional)
          </label>
          <textarea
            id="cigarette-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="¿Por qué fumaste?"
            rows={2}
            className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#EF4444] focus:outline-none focus:ring-1 focus:ring-[#EF4444] dark:border-[#374151] dark:bg-[#111827] dark:text-[#F3F4F6] dark:placeholder:text-[#6B7280]"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#F3F4F6] active:scale-95 disabled:opacity-50 dark:border-[#374151] dark:bg-[#111827] dark:text-[#9CA3AF]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-lg bg-[#EF4444] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#DC2626] active:scale-95 disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
