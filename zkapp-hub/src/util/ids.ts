import crypto from "node:crypto";

export function getUniqueId(): string {
  const uuid = crypto.randomUUID();
  const time = new Date().getTime();
  return `${uuid}-${time}`;
}