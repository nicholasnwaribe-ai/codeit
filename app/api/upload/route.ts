import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"

const MAX_BYTES = 25 * 1024 * 1024 // 25MB cap for a short clip

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "File must be a video" }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Video is too large (max 25MB)" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "mp4"
    const blob = await put(`demos/${user.id}-${Date.now()}.${ext}`, file, {
      access: "private",
      addRandomSuffix: true,
    })

    return NextResponse.json({ pathname: blob.pathname })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
