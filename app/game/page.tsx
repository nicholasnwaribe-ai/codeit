import type { Metadata } from "next"
import { ForestGame } from "@/components/game/forest-game"

export const metadata: Metadata = {
  title: "Elderwood — Open World Demo",
  description:
    "A browser-playable 3D open-world forest with a small town. Third-person exploration demo built with Three.js.",
}

export default function GamePage() {
  return <ForestGame />
}
