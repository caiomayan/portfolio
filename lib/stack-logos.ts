import type { StaticImageData } from "next/image";
import amazonec2 from "@/assets/logos/amazonec2.svg";
import amazonwebservices from "@/assets/logos/amazonwebservices.svg";
import cloudflare from "@/assets/logos/cloudflare.svg";
import docker from "@/assets/logos/docker.svg";
import express from "@/assets/logos/express.svg";
import git from "@/assets/logos/git.svg";
import mongodb from "@/assets/logos/mongodb.svg";
import nestjs from "@/assets/logos/nestjs.svg";
import nextdotjs from "@/assets/logos/nextdotjs.svg";
import nodedotjs from "@/assets/logos/nodedotjs.svg";
import oracle from "@/assets/logos/oracle.svg";
import php from "@/assets/logos/php.svg";
import postgresql from "@/assets/logos/postgresql.svg";
import python from "@/assets/logos/python.svg";
import react from "@/assets/logos/react.svg";
import redis from "@/assets/logos/redis.svg";
import springboot from "@/assets/logos/springboot.svg";
import typescript from "@/assets/logos/typescript.svg";
import valkey from "@/assets/logos/valkey.svg";
import vercel from "@/assets/logos/vercel.svg";

type StackLogo = { src: StaticImageData; colored: boolean };

/**
 * Único lugar que conhece os logos de tecnologia (stack do Carmine e seção Tecnologias). Para adicionar um:
 * pôr o SVG em `assets/logos/` e uma linha aqui; o tipo `StackLogoId` (usado por `content/`) acompanha sozinho.
 * `colored: true` = logo colorida, que não inverte no tema escuro. Os do Simple Icons são de uma cor só (preto): invertem.
 */
export const stackLogos = {
  nestjs: { src: nestjs, colored: false },
  nextdotjs: { src: nextdotjs, colored: false },
  valkey: { src: valkey, colored: true },
  amazonec2: { src: amazonec2, colored: false },
  oracle: { src: oracle, colored: false },
  springboot: { src: springboot, colored: false },
  nodedotjs: { src: nodedotjs, colored: false },
  typescript: { src: typescript, colored: false },
  express: { src: express, colored: false },
  php: { src: php, colored: false },
  python: { src: python, colored: false },
  react: { src: react, colored: false },
  postgresql: { src: postgresql, colored: false },
  redis: { src: redis, colored: false },
  mongodb: { src: mongodb, colored: false },
  docker: { src: docker, colored: false },
  amazonwebservices: { src: amazonwebservices, colored: false },
  vercel: { src: vercel, colored: false },
  cloudflare: { src: cloudflare, colored: false },
  git: { src: git, colored: false },
} satisfies Record<string, StackLogo>;

export type StackLogoId = keyof typeof stackLogos;
