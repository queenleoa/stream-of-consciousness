import { useState, useRef, useEffect } from "react";

export default function AudioPlayer() {
  const [isMuted, setIsMuted] = useState(true); // Start muted change later
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef(null);
  
  useEffect(() => {
    // Set initial volume
    if (audioRef.current) {
      audioRef.current.volume = 0.6; // 60% volume when unmuted
    }
  }, []);
  
  const handleToggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        // Unmute and play
        audioRef.current.muted = false;
        audioRef.current.play().catch(err => {
          console.log("Audio play failed:", err);
        });
      } else {
        // Mute
        audioRef.current.muted = true;
      }
      setIsMuted(!isMuted);
    }
  };
  
  const handleAudioLoaded = () => {
    setIsLoaded(true);
  };
  
  // SVG icons for speaker states
  const SpeakerOn = () => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  );
  
  const SpeakerOff = () => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="1" x2="1" y2="23"></line>
    </svg>
  );
  
  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        loop
        muted={isMuted}
        onLoadedData={handleAudioLoaded}
      >
        <source src="/nocturne.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      {/* Mute/Unmute button */}
      <button
        className="audio-control"
        onClick={handleToggleMute}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={!isLoaded}
        aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        title={isMuted ? "Click to play ambient sound" : "Click to mute"}
        style={{
          opacity: isHovered ? 1 : 0.7,
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {isMuted ? <SpeakerOff /> : <SpeakerOn />}
      </button>
      
      {/* Optional loading indicator */}
      {!isLoaded && (
        <div className="audio-loading">
          Loading audio...
        </div>
      )}
    </>
  );
}