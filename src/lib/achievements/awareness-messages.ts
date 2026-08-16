type TranslationFn = (key: string, params?: Record<string, string | number>) => string;

export function generateAwarenessMessage(
  cigarettesTotal: number,
  t?: TranslationFn,
): string {
  const packs = (cigarettesTotal / 20).toFixed(1);

  let packLabel: string;
  let cigaretteLabel: string;

  if (t) {
    packLabel =
      packs === "1.0"
        ? t("awareness.packs.one")
        : t("awareness.packs.other", { n: packs });
    cigaretteLabel =
      cigarettesTotal === 1
        ? t("awareness.cigarettes.one")
        : t("awareness.cigarettes.other", { n: cigarettesTotal });
  } else {
    // Fallback to Spanish for backward compatibility (e.g. tests without mock)
    packLabel =
      packs === "1.0" ? "1.0 cajetilla" : `${packs} cajetillas`;
    cigaretteLabel =
      cigarettesTotal === 1 ? "1 cigarro" : `${cigarettesTotal} cigarros`;
  }

  let encouragement: string;

  if (t) {
    if (cigarettesTotal <= 5) {
      encouragement = t("awareness.messages.5");
    } else if (cigarettesTotal <= 20) {
      encouragement = t("awareness.messages.20");
    } else if (cigarettesTotal <= 50) {
      encouragement = t("awareness.messages.50");
    } else if (cigarettesTotal <= 100) {
      encouragement = t("awareness.messages.100");
    } else if (cigarettesTotal <= 200) {
      encouragement = t("awareness.messages.200");
    } else {
      encouragement = t("awareness.messages.default");
    }
  } else {
    // Fallback to Spanish
    if (cigarettesTotal <= 5) {
      encouragement =
        "Es un buen momento para reflexionar. Cada paso cuenta.";
    } else if (cigarettesTotal <= 20) {
      encouragement =
        "Tu cuerpo merece una oportunidad. Tú puedes con esto.";
    } else if (cigarettesTotal <= 50) {
      encouragement =
        "Vas por buen camino al reconocerlo. Cada día es una nueva posibilidad.";
    } else if (cigarettesTotal <= 100) {
      encouragement =
        "El cambio empieza con la consciencia. No estás solo en esto.";
    } else if (cigarettesTotal <= 200) {
      encouragement =
        "Reconocer el problema es el primer paso. Estás más fuerte de lo que crees.";
    } else {
      encouragement =
        "Cada cigarro que dejas es una victoria. Empieza hoy, un día a la vez.";
    }
  }

  if (t) {
    return t("awareness.summary", {
      cigarettes: cigaretteLabel,
      packs: packLabel,
      encouragement,
    });
  }

  return `Has fumado ${cigaretteLabel} (${packLabel}). ${encouragement}`;
}
