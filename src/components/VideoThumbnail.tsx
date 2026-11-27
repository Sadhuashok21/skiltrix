import { useEffect, useState } from "react"
import { getStImageUrl, isPlaceholderStAsset } from "../utils/cdn"
import { TechIcon } from "./TechIcons"

interface VideoThumbnailProps {
  src?: string
  alt: string
  tag?: string
  className?: string
  iconClassName?: string
}

/**
 * Renders a video thumbnail image with an automatic fallback card when
 * no custom thumbnail was uploaded or the CDN asset fails to load.
 */
export default function VideoThumbnail({
  src,
  alt,
  tag,
  className = "w-full h-full object-cover",
  iconClassName = "w-7 h-7 text-indigo-400",
}: VideoThumbnailProps) {
  const cleanSrc = src && !isPlaceholderStAsset(src) ? getStImageUrl(src, "") : ""
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [cleanSrc])

  if (!cleanSrc || failed) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 flex items-center justify-center">
        <TechIcon name={tag || "code"} className={iconClassName} />
      </div>
    )
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
