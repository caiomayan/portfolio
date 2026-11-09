import { ogAlt, ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const alt = ogAlt("en");
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage("en");
}
