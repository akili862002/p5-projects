import { useState } from "react";
import { useLocalStorage } from "react-use";

export const Guide = () => {
  // const [shouldShow, setShouldShow] = useLocalStorage<boolean>(
  //   "show-asteroids-guide",
  //   true
  // );
  const [shouldShow, setShouldShow] = useState<boolean>(true);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 p-4 md:p-8 rounded-2xl text-neutral-300 max-w-md w-full max-h-[80vh] overflow-y-auto">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">Asteroids</h1>

        <section>
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">
            Game Rules
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Destroy asteroids to score points</li>
            <li>Large asteroids will split into medium asteroids when hit</li>
            <li>Medium asteroids will split into small asteroids when hit</li>
            <li>Small asteroids will be destroyed when hit</li>
            <li>Avoid collisions with asteroids</li>
            <li>You have 3 lives at the start</li>
            <li>Game over when you lose all lives</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">
            How to Play
          </h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-green-300">Movement</h3>
              <p>Arrow keys or WAD to control the ship</p>
              <ul className="list-disc pl-5">
                <li>
                  <Kbd>↑</Kbd> or <Kbd>W</Kbd>: Thrust forward
                </li>
                <li>
                  <Kbd>←</Kbd> or <Kbd>A</Kbd>: Rotate left
                </li>
                <li>
                  <Kbd>→</Kbd> or <Kbd>D</Kbd>: Rotate right
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-300">Actions</h3>
              <ul className="list-disc pl-5">
                <li>
                  <Kbd>Space</Kbd>: Shoot
                </li>
              </ul>
            </div>
          </div>
        </section>

        <button
          onClick={() => setShouldShow(false)}
          className="text-base font-sans w-full mt-6 bg-white hover:scale-105 transition-all duration-300 active:scale-95 p-3 rounded-xl text-black font-bold"
        >
          Got it, let's play!
        </button>
      </div>
    </div>
  );
};

const Kbd = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="px-1 py-0.5 bg-gray-800 rounded-md text-sm text-white">
      {children}
    </span>
  );
};
