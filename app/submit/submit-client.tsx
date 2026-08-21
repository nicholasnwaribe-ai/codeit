"use client"

import { PostForm } from "@/components/post-form"

export function SubmitClient() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-mono text-2xl font-bold">Create Post</h1>
      <PostForm />
    </div>
  )
}