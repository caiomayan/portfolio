"use client";

import { useEffect, useState } from "react";

// Fuso da hora local de João Pessoa (UTC−3, sem horário de verão). O deslocamento não aparece mais na tela (#38), mas o fuso segue no cálculo.
const TIME_ZONE = "America/Fortaleza";

const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/**
 * Hora local de João Pessoa, sem API: Intl com o fuso fixo, atualizada a cada minuto cheio.
 * Não vai no HTML do servidor (o cache serviria uma hora velha): nasce vazia e o espaço já está reservado em CSS
 * (altura de uma linha, números tabulares), então o texto entra sem mover o layout.
 */
export function LocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setTime(formatter.format(new Date()));
      timer = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);
  return <span className="place-time">{time}</span>;
}
