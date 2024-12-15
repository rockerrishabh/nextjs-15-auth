export {};

declare global {
  interface Window {
    myCustomProperty: string;
    MSStream?: boolean;
  }
}
