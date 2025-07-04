"use client"

import React from "react"

interface PatternBackgroundProps {
  className?: string
  pattern?: "dots" | "lines" | "grid" | "waves" | "diamonds"
  color?: string
  opacity?: number
}

export function PatternBackground({
  className = "",
  pattern = "dots",
  color = "#AD9660",
  opacity = 0.1,
}: PatternBackgroundProps) {
  const getPatternSVG = () => {
    switch (pattern) {
      case "dots":
        return `
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="2" cy="2" r="1" fill="${color}" />
          </svg>
        `
      case "lines":
        return `
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="10" x2="20" y2="10" stroke="${color}" stroke-width="1" />
          </svg>
        `
      case "grid":
        return `
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="10" x2="20" y2="10" stroke="${color}" stroke-width="0.5" />
            <line x1="10" y1="0" x2="10" y2="20" stroke="${color}" stroke-width="0.5" />
          </svg>
        `
      case "waves":
        return `
          <svg width="40" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,10 Q10,5 20,10 T40,10" stroke="${color}" fill="none" stroke-width="0.5" />
          </svg>
        `
      case "diamonds":
        return `
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="5" width="10" height="10" transform="rotate(45 10 10)" stroke="${color}" fill="none" stroke-width="0.5" />
          </svg>
        `
      default:
        return `
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="2" cy="2" r="1" fill="${color}" />
          </svg>
        `
    }
  }

  const svgBase64 = Buffer.from(getPatternSVG()).toString("base64")

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml;base64,${svgBase64}")`,
        opacity: opacity,
      }}
    />
  )
}

export default PatternBackground 