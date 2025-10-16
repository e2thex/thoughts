// A simplified React app structure for "Robot Invasion" game
// Assumes usage of Tailwind CSS for styling
// State management is local, expand as needed for multiplayer persistence

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const initialState = {
  robotsRemaining: 25,
  players: {
    fieldAgent: { health: 5, alive: true },
    weaponsDistributor: { health: 5, alive: true },
    fighter1: { health: 5, alive: true },
    fighter2: { health: 5, alive: true },
    fighter3: { health: 5, alive: true },
  },
  damageLog: [],
  specialWeaponUsedThisRound: false,
};

export default function RobotInvasionGame() {
  const [game, setGame] = useState(initialState);
  const [currentFighter, setCurrentFighter] = useState("fighter1");

  const diceColors = ["🟦", "🟥", "🟧", "🟨", "🟩", "⬜"];
  const rollDie = () => diceColors[Math.floor(Math.random() * diceColors.length)];

  const weaponLogic = {
    Gun: (color) => {
      return ["🟦", "🟥", "🟧", "🟨"].includes(color)
        ? { robotsKilled: 1, damage: 0 }
        : { robotsKilled: 0, damage: 1 };
    },
    EMP: (color, used) => {
      const success = used ? ["🟦", "🟥", "🟧"].includes(color) : ["🟦", "🟥", "🟧", "🟨"].includes(color);
      return success
        ? { robotsKilled: 2, damage: 1, extraDamage: 0 }
        : { robotsKilled: 1, damage: 1, extraDamage: 1 };
    },
    Bomb: (color, used) => {
      const success = used ? ["🟦", "🟥", "🟧"].includes(color) : ["🟦", "🟥", "🟧", "🟨"].includes(color);
      return success
        ? { robotsKilled: 3, damage: 1, extraDamage: 1 }
        : { robotsKilled: 2, damage: 1, extraDamage: 2 };
    },
  };

  const attack = (weapon) => {
    const color = rollDie();
    let result;
    if (weapon === "Gun") {
      result = weaponLogic.Gun(color);
    } else {
      result = weaponLogic[weapon](color, game.specialWeaponUsedThisRound);
    }

    const newGame = { ...game };
    newGame.robotsRemaining -= result.robotsKilled;
    newGame.players[currentFighter].health -= result.damage;

    if (result.extraDamage) {
      const target = rollDie();
      const targetMap = {
        "🟦": "fieldAgent",
        "🟥": "weaponsDistributor",
        "🟧": "fighter1",
        "🟨": "fighter2",
        "🟩": "fighter3",
      };
      const hit = targetMap[target];
      if (hit && newGame.players[hit].alive) newGame.players[hit].health -= result.extraDamage;
    }

    if (weapon !== "Gun") newGame.specialWeaponUsedThisRound = true;

    for (const role in newGame.players) {
      if (newGame.players[role].health <= 0) newGame.players[role].alive = false;
    }

    setGame(newGame);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🤖 Robot Invasion</h1>
      <p>Robots Remaining: {game.robotsRemaining}</p>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {Object.entries(game.players).map(([role, stats]) => (
          <Card key={role} className={stats.alive ? "" : "opacity-50"}>
            <CardContent>
              <h2 className="font-bold text-xl">{role}</h2>
              <p>Health: {stats.health}</p>
              <p>Status: {stats.alive ? "Alive" : "Dead"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Choose Weapon for {currentFighter}</h2>
        <div className="flex gap-4">
          {["Gun", "EMP", "Bomb"].map((w) => (
            <Button key={w} onClick={() => attack(w)}>{w}</Button>
          ))}
        </div>
      </div>
    </div>
  );
}
