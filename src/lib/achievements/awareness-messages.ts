export function generateAwarenessMessage(cigarettesTotal: number): string {
  const packs = (cigarettesTotal / 20).toFixed(1);

  const packLabel =
    packs === "1.0" ? "1.0 cajetilla" : `${packs} cajetillas`;
  const cigaretteLabel =
    cigarettesTotal === 1 ? "1 cigarro" : `${cigarettesTotal} cigarros`;

  let encouragement: string;

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

  return `Has fumado ${cigaretteLabel} (${packLabel}). ${encouragement}`;
}
