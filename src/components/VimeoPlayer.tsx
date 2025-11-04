import { useEffect, useRef } from 'react';

interface VimeoPlayerProps {
  videoUrl?: string;
  videoId?: string;
  showControls?: boolean;
  fullscreen?: boolean;
}

export default function VimeoPlayer({ 
  videoUrl,
  videoId,
  showControls = true,
  fullscreen = false
}: VimeoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      const video = videoRef.current;

      // Use Intersection Observer to detect when video is in viewport
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Video is visible - unmute after a small delay
              setTimeout(() => {
                video.muted = false;
                video.volume = 0.8;
              }, 500);
            } else {
              // Video is not visible - mute
              video.muted = true;
            }
          });
        },
        {
          threshold: 0.5, // Trigger when at least 50% of video is visible
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }
  }, [videoUrl]);

  // If videoId is provided, render Vimeo iframe
  if (videoId) {
    return (
      <div className={fullscreen ? "fixed inset-0 w-full h-full z-50" : "absolute inset-0 w-full h-full"}>
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
          title="Vimeo Video"
        ></iframe>
      </div>
    );
  }

  // Otherwise render HTML5 video player
  return (
    <div 
      ref={containerRef} 
      className={fullscreen ? "fixed inset-0 w-full h-full z-50" : "absolute inset-0 w-full h-full"}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        playsInline
        muted
        controls={showControls}
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src={videoUrl || "https://cdn.filestackcontent.com/x7lDx3mPQri9yog3e83j"} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
