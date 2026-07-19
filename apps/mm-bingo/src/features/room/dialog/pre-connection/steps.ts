export type PreConnectionGuestJoinStep = {
  kind: "guest-join";
  roomId: string;
  error?: string;
};

export type PreConnectionStep =
  | { kind: "idle" }
  | { kind: "host-name" }
  | PreConnectionGuestJoinStep;
