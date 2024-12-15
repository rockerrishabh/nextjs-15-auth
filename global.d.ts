export {};

declare global {
  interface Window {
    myCustomProperty: string;
    MSStream?: boolean;
  }
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => void;
    userChoice: Promise<{
      outcome: "accepted" | "dismissed";
      platform: string;
    }>;
  }
}
