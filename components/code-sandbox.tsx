"use client"

import { useEffect, useRef, useState } from "react"
import { Maximize2, Minimize2, Code as CodeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CodeSandboxProps {
  code: string
  language: string
  className?: string
}

export function CodeSandbox({ code, language, className }: CodeSandboxProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!iframeRef.current || language !== "html") return

    const iframe = iframeRef.current
    const doc = iframe.contentDocument || iframe.contentWindow?.document

    if (!doc) return

    try {
      doc.open()
      doc.write(code)
      doc.close()
      setHasError(false)
    } catch {
      setHasError(true)
    }
  }, [code, language])

  if (language !== "html") {
    return (
      <div className={cn("rounded-lg border border-border bg-muted p-4", className)}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CodeIcon className="size-4" />
            <span>Code Preview</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted-foreground/20">
              {language}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Preview only available for HTML/CSS/JS
          </p>
        </div>
        <pre className="overflow-x-auto rounded bg-muted/50 p-3 text-sm">
          <code>{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CodeIcon className="size-4" />
          <span>Live Preview</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
            HTML/CSS/JS
          </span>
        </div>
        <div className="flex items-center gap-1">
          {hasError && (
            <span className="text-xs text-destructive">Error rendering preview</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </div>
      </div>
      <div
        className={cn(
          "transition-all duration-300",
          isExpanded ? "min-h-[500px]" : "min-h-[300px] max-h-[400px]"
        )}
      >
        <iframe
          ref={iframeRef}
          title="Code preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
          className="w-full h-full border-0 bg-white"
          style={{ backgroundColor: "white" }}
        />
      </div>
    </div>
  )
}