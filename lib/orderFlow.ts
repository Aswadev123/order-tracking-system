export const STATUSES = [
  "CREATED",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  CREATED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function isValidStatus(s: any): s is string {
  return typeof s === "string" && STATUSES.includes(s);
}

export function canTransition(from: string, to: string) {
  if (!isValidStatus(from) || !isValidStatus(to)) return false;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export default { STATUSES, ALLOWED_TRANSITIONS, isValidStatus, canTransition };

