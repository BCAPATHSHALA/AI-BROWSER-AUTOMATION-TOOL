"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

interface AutomationLog {
  id: string
  timestamp: string
  type: "info" | "success" | "error" | "screenshot" | "connected" | "heartbeat"
  message: string
  screenshot?: string
  data?: any
}

interface UseAutomationOptions {
  onUpdate?: (log: AutomationLog) => void
  onConnect?: () => void
  onDisconnect?: () => void
  autoReconnect?: boolean
}

export function useAutomation(options: UseAutomationOptions = {}) {
  const [isRunning, setIsRunning] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [logs, setLogs] = useState<AutomationLog[]>([])
  const [currentUrl, setCurrentUrl] = useState("")

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { onUpdate, onConnect, onDisconnect, autoReconnect = true } = options

  const addLog = useCallback(
    (log: Omit<AutomationLog, "id">) => {
      const newLog: AutomationLog = {
        ...log,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
      setLogs((prev) => [...prev, newLog])
      onUpdate?.(newLog)
      return newLog
    },
    [onUpdate],
  )

  const connectToStream = useCallback(
    (sessionId: string) => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const eventSource = apiClient.createEventSource(sessionId)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
        onConnect?.()
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "heartbeat") {
            return
          }

          const log = addLog({
            timestamp: new Date(data.timestamp).toLocaleTimeString(),
            type: data.type,
            message: data.message,
            screenshot: data.data?.screenshot,
            data: data.data,
          })

          if (data.data?.url) {
            setCurrentUrl(data.data.url)
          }
        } catch (error) {
          console.error("Error parsing stream data:", error)
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
        onDisconnect?.()

        if (autoReconnect && sessionId && isRunning) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectToStream(sessionId)
          }, 3000)
        }
      }

      eventSource.onclose = () => {
        setIsConnected(false)
        onDisconnect?.()
      }
    },
    [addLog, onConnect, onDisconnect, autoReconnect, isRunning],
  )

  const startAutomation = useCallback(
    async (prompt: string, existingSessionId?: string) => {
      if (!prompt.trim()) {
        throw new Error("Prompt is required")
      }

      setIsRunning(true)
      setLogs([])
      setCurrentUrl("")

      try {
        const response = await apiClient.startAutomation(prompt, existingSessionId)

        if (response.success) {
          const newSessionId = response.data.sessionId
          setSessionId(newSessionId)
          connectToStream(newSessionId)

          addLog({
            timestamp: new Date().toLocaleTimeString(),
            type: "info",
            message: response.data.message,
          })

          return newSessionId
        } else {
          throw new Error(response.error || "Failed to start automation")
        }
      } catch (error) {
        addLog({
          timestamp: new Date().toLocaleTimeString(),
          type: "error",
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
        setIsRunning(false)
        throw error
      }
    },
    [addLog, connectToStream],
  )

  const stopAutomation = useCallback(async () => {
    if (!sessionId) return

    try {
      await apiClient.stopAutomation(sessionId)

      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      setIsRunning(false)
      setIsConnected(false)

      addLog({
        timestamp: new Date().toLocaleTimeString(),
        type: "info",
        message: "Automation stopped by user",
      })
    } catch (error) {
      addLog({
        timestamp: new Date().toLocaleTimeString(),
        type: "error",
        message: `Error stopping automation: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
      throw error
    }
  }, [sessionId, addLog])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    isRunning,
    isConnected,
    sessionId,
    logs,
    currentUrl,
    startAutomation,
    stopAutomation,
    clearLogs,
    addLog,
  }
}
