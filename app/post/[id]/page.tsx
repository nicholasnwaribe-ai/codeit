import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPost } from "@/app/actions/posts"
import { getCommentData } from "@/components/comment-thread"
import { SiteHeader } from "@/components/site-header"
import { PostDetailClient } from "./post-detail-client"
import { CommunitySidebar } from "@/components/community-sidebar"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(Number(id))
  if (!post) return { title: "Post not found" }
  return {
    title: `${post.title} — Codeit`,
    description: post.description || `Code snippet by ${post.authorName} in c/${post.communitySlug}`,
  }
}

export default async function PostPage({ params }: Props) {
  const { id } = await params
  const postId = Number(id)
  const [post, comments] = await Promise.all([
    getPost(postId),
    getCommentData(postId),
  ])

  if (!post) notFound()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <div className="min-w-0 flex-1">
          <PostDetailClient initialPost={post} initialComments={comments} />
        </div>
        <CommunitySidebar />
      </main>
    </>
  )
}