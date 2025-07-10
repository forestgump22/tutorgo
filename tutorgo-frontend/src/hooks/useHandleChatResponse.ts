// hooks/useHandleChatResponse.ts
"use client"
import { useRouter } from "next/navigation"
import { extractQuery } from "@/lib/parseQuery"
import type { Message } from "@/types/chat"

export function useHandleChatResponse() {
  const router = useRouter()

  const handleResponse = (text: string): { skip: boolean } => {
    const route = extractQuery(text)
    if (route) {
      router.push(route)
      return { skip: true }
    }
    return { skip: false }
  }

  return { handleResponse }
}
