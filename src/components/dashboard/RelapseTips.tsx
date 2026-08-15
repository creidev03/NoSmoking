"use client";

import { Button } from "@/components/ui/button";

interface RelapseTipsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RelapseTips({ isOpen, onClose }: RelapseTipsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg dark:border-border dark:bg-surface">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text dark:text-text">
            💡 Tips de Recuperación
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            data-testid="close-tips-button"
            aria-label="Cerrar tips"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-6">
          {/* Section 1 */}
          <section>
            <h3 className="mb-2 text-lg font-semibold text-text dark:text-text">
              ¿Por qué es normal una recaída?
            </h3>
            <p className="text-sm leading-relaxed text-text-muted dark:text-text-muted">
              La recuperación de la adicción al tabaco no es un proceso lineal.
              Según estudios, el 75% de las personas logran dejar de fumar
              después de varios intentos. Cada intento te acerca más a tu meta.
              Una recaída no borra tu progreso — es parte del camino.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="mb-2 text-lg font-semibold text-text dark:text-text">
              ¿Qué hacer después de fumar?
            </h3>
            <ul className="space-y-2 text-sm text-text-muted dark:text-text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-success">✓</span>
                <span>No fumes otro cigarro — detente aquí</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-success">✓</span>
                <span>Toma un vaso de agua</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-success">✓</span>
                <span>Realiza una acción positiva (respiración, meditación)</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h3 className="mb-2 text-lg font-semibold text-text dark:text-text">
              Herramientas comprobadas
            </h3>
            <ul className="space-y-2 text-sm text-text-muted dark:text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-accent-purple">🫁</span>
                <span>Ejercicios de respiración profunda</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-purple">🧘</span>
                <span>Meditación de 10-15 minutos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-purple">🏃</span>
                <span>Actividad física ligera (caminar, estirar)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-purple">📞</span>
                <span>Llama a un amigo o familiar de confianza</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
            data-testid="close-tips-footer-button"
          >
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}
