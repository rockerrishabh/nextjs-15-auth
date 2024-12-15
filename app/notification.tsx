"use client";

import { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser, sendNotification } from "./actions";

type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

function Modal({ children, isOpen, onClose, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative">
        <h2 className="text-lg font-semibold mb-4 text-primary">{title}</h2>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export function PushNotificationManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  }

  async function subscribeToPush() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Push notification permission denied");
      }

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      });

      setSubscription(sub);
      await subscribeUser(sub);
    } catch (error) {
      if ((error as Error).name === "NotAllowedError") {
        console.error("User denied permission for push notifications");
        alert(
          "You have denied notifications. Please enable them in your browser settings."
        );
      } else {
        console.error("Push subscription failed:", error);
      }
    }
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage("");
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600">
        Notifications
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Push Notifications">
        {isSupported ? (
          subscription ? (
            <div className="space-y-4">
              <p className="text-green-500 font-medium">
                You are subscribed to push notifications.
              </p>
              <button
                onClick={unsubscribeFromPush}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                Unsubscribe
              </button>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter notification message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full"
                />
                <button
                  onClick={sendTestNotification}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">
                  Send Test
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-secondary font-medium">
                You are not subscribed to push notifications.
              </p>
              <button
                onClick={subscribeToPush}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">
                Subscribe
              </button>
            </div>
          )
        ) : (
          <p className="text-red-500 font-medium">
            Push notifications are not supported in this browser.
          </p>
        )}
      </Modal>
    </>
  );
}

export function InstallPrompt() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check for iOS and standalone display mode
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        console.log("User dismissed the A2HS prompt");
      }
      setDeferredPrompt(null);
    }
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-16 right-4 bg-gray-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-600">
        Install App
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Install App">
        <div className="space-y-4">
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">
            Add to Home Screen
          </button>
          {isIOS && (
            <p className="text-secondary">
              To install this app on your iOS device, tap the share button{" "}
              <span role="img" aria-label="share icon">
                ⎋
              </span>{" "}
              and then &quot;Add to Home Screen&quot;{" "}
              <span role="img" aria-label="plus icon">
                ➕
              </span>{" "}
              .
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}

export function PWAButton() {
  const [open, setOpen] = useState(true);
  return (
    <>
      {open && (
        <>
          <button
            onClick={() => setOpen(false)}
            className="fixed bottom-28 right-6 text-white">
            ✕
          </button>
          <PushNotificationManager />
          <InstallPrompt />
        </>
      )}
    </>
  );
}
