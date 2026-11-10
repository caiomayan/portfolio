"use client";

import { useEffect, useState } from "react";
import type { Content } from "@/content";
import { project, worldMap } from "@/lib/world-map";

// João Pessoa (7,12° S, 34,88° O) e o fuso da hora local (UTC−3, sem horário de verão).
const CITY = { lon: -34.88, lat: -7.12 };
const TIME_ZONE = "America/Fortaleza";

const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/**
 * Hora local de João Pessoa, sem API: Intl com o fuso fixo, atualizada a cada minuto cheio.
 * Não vai no HTML do servidor (o cache serviria uma hora velha): nasce vazia e o espaço já está reservado em CSS
 * (largura mínima, números tabulares), então o texto entra sem mover o layout.
 */
function LocalTime({ offset }: { offset: string }) {
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
  return <span className="contact-map-time">{time && `${time} (${offset})`}</span>;
}

export function ContactMap({ map }: { map: Content["contact"]["map"] }) {
  const { x, y } = project(CITY.lon, CITY.lat);
  return (
    <div className="contact-map" data-reveal-part>
      {/* Decorativo: a cidade e a hora estão em texto ao lado. O pulso (transform e opacity) para com movimento reduzido. */}
      <div className="contact-map-art" aria-hidden="true">
        <svg viewBox={`0 0 ${worldMap.width} ${worldMap.height}`} focusable="false">
          <path d={worldMap.dots} />
        </svg>
        <span className="contact-map-pin" style={{ left: `${(x * 100).toFixed(2)}%`, top: `${(y * 100).toFixed(2)}%` }}>
          <span className="contact-map-pulse" />
          <span className="contact-map-dot" />
        </span>
      </div>
      <p className="contact-map-caption">
        <span className="contact-map-place">{map.place}</span>
        <LocalTime offset={map.offset} />
      </p>
    </div>
  );
}
