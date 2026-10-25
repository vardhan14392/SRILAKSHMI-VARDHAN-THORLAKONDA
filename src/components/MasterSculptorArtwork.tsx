import React from 'react';

interface MasterSculptorArtworkProps {
  className?: string;
  customImageUrl?: string | null;
}

export const MasterSculptorArtwork: React.FC<MasterSculptorArtworkProps> = ({
  className = 'w-full h-[480px]',
  customImageUrl,
}) => {
  // If user provided or uploaded a custom photo, display it cleanly
  if (customImageUrl && customImageUrl.trim().length > 0) {
    return (
      <img
        src={customImageUrl}
        alt="Master Temple Artist THORLAKONDA GURAVAIAH"
        referrerPolicy="no-referrer"
        className={`${className} object-cover transition-transform duration-700 ease-out group-hover:scale-105`}
        onError={(e) => {
          // If image URL fails to load, gracefully fall back
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  // Authentic handcrafted devotional Master Sculptor vector composition
  return (
    <div className={`relative ${className} bg-gradient-to-b from-[#1C0606] via-[#2F0E0E] to-[#120303] flex items-center justify-center overflow-hidden select-none`}>
      {/* Background Sacred Geometric Mandala */}
      <svg
        viewBox="0 0 500 600"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="sacredHalo" cx="50%" cy="38%" r="45%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#C85A17" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1C0606" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="goldShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE27A" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#996515" />
          </linearGradient>
          <linearGradient id="stoneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5A524C" />
            <stop offset="100%" stopColor="#25211E" />
          </linearGradient>
          <linearGradient id="chiselSpark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFF2A3" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient Warm Golden Glow */}
        <circle cx="250" cy="230" r="180" fill="url(#sacredHalo)" />

        {/* Architectural Dravidian Temple Mandapa Pillars in Background */}
        <g stroke="#D4AF37" strokeOpacity="0.18" strokeWidth="1.5" fill="none">
          {/* Left Pillar */}
          <line x1="60" y1="50" x2="60" y2="520" />
          <line x1="85" y1="50" x2="85" y2="520" />
          <rect x="50" y="80" width="45" height="15" rx="3" />
          <rect x="52" y="440" width="41" height="20" rx="2" />
          {/* Right Pillar */}
          <line x1="415" y1="50" x2="415" y2="520" />
          <line x1="440" y1="50" x2="440" y2="520" />
          <rect x="405" y="80" width="45" height="15" rx="3" />
          <rect x="407" y="440" width="41" height="20" rx="2" />
          {/* Temple Torana Arch */}
          <path d="M 60,80 Q 250,-20 440,80" strokeWidth="2" />
          <path d="M 85,95 Q 250,15 415,95" strokeDasharray="4 4" />
        </g>

        {/* Sacred Prana Mandala in Center */}
        <g transform="translate(250, 210)" stroke="#D4AF37" strokeOpacity="0.25" fill="none">
          <circle r="120" strokeWidth="1" strokeDasharray="3 3" />
          <circle r="100" strokeWidth="1.5" />
          <circle r="75" strokeWidth="1" strokeDasharray="6 3" />
          {/* 12 Petals of the Anahata Lotus */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <ellipse
              key={deg}
              rx="18"
              ry="50"
              transform={`rotate(${deg})`}
              strokeWidth="0.8"
              strokeOpacity="0.3"
            />
          ))}
        </g>

        {/* The Sanctum Deity being Sculpted (Sacred Ganesha Silhouette in Black Stone) */}
        <g id="deitySculpture" transform="translate(130, 160)">
          {/* Krishna Shila Stone Pedestal (Peetham) */}
          <path
            d="M 10,230 L 130,230 L 120,270 L 20,270 Z"
            fill="url(#stoneGradient)"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          {/* Consecrated Idol Silhouette */}
          <path
            d="M 70,60 
               C 85,60 95,75 95,95 
               C 95,110 85,120 70,125 
               C 55,120 45,110 45,95 
               C 45,75 55,60 70,60 Z
               M 70,95 Q 85,130 95,155 Q 98,175 75,178 Q 62,175 66,155 Z
               M 50,105 C 30,110 25,125 35,145 C 42,158 55,150 50,135 Z
               M 90,105 C 110,110 115,125 105,145 C 98,158 85,150 90,135 Z"
            fill="#1E1A18"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.8"
          />
          {/* Crown / Kireetam with Gold Trim */}
          <path
            d="M 58,62 L 70,25 L 82,62 Z"
            fill="url(#goldShimmer)"
            stroke="#FFE27A"
            strokeWidth="1"
          />
          {/* Auspicious Tilak on Deity */}
          <line x1="70" y1="72" x2="70" y2="82" stroke="#C85A17" strokeWidth="2.5" />
          <circle cx="70" cy="85" r="1.5" fill="#FFE27A" />

          {/* Chiseling Sparks & Gold Dust */}
          <circle cx="98" cy="150" r="3.5" fill="#FFE27A" className="animate-ping" />
          <line x1="98" y1="150" x2="135" y2="140" stroke="url(#chiselSpark)" strokeWidth="2" />
        </g>

        {/* Master Sculptor Thorlakonda Guravaiah at Work (Devotional Stylized Silhouette) */}
        <g id="masterSculptor" transform="translate(230, 140)">
          {/* Sculptor Aura & Focus */}
          {/* Traditional Turban / Headcloth & Sacred Tilak */}
          <path
            d="M 120,70 
               C 115,45 145,40 160,52 
               C 172,60 170,82 155,90 
               C 140,96 125,90 120,70 Z"
            fill="#3B1414"
            stroke="#D4AF37"
            strokeWidth="1.5"
          />
          {/* Sacred Vibhuti / Chandan Tilak on Forehead */}
          <line x1="126" y1="62" x2="138" y2="60" stroke="#FAF4DE" strokeWidth="1.5" />
          <line x1="127" y1="65" x2="139" y2="63" stroke="#FAF4DE" strokeWidth="1.5" />
          <circle cx="132" cy="67" r="1.5" fill="#C85A17" />

          {/* Sculptor Face Profile with Serene Devotional Focus */}
          <path
            d="M 130,75 
               L 122,85 
               L 128,88 
               L 123,98 
               C 126,105 138,110 148,106 
               L 155,95 Z"
            fill="#5C2424"
          />
          {/* Master Sculptor Body & Angavastram (Sacred Stole with Gold Zari Border) */}
          <path
            d="M 145,108 
               C 120,118 100,140 95,180 
               L 75,220 
               L 95,230 
               L 120,195 
               L 140,240 
               C 170,250 200,240 210,210 
               C 215,170 195,120 155,108 Z"
            fill="#270C0C"
            stroke="#D4AF37"
            strokeWidth="1.2"
          />
          {/* Golden Zari Border on Angavastram */}
          <path
            d="M 145,108 Q 120,150 95,220"
            stroke="url(#goldShimmer)"
            strokeWidth="3"
            fill="none"
          />

          {/* Sculptor Hands holding Chisel (Uli) and Wooden Mallet */}
          {/* Left Arm holding Chisel precisely against the stone */}
          <path
            d="M 95,180 L 15,168 L 5,175 L 85,195 Z"
            fill="#4A1B1B"
          />
          {/* Sculpting Steel Chisel */}
          <line x1="2" y1="172" x2="-15" y2="168" stroke="#E5E7EB" strokeWidth="3" strokeLinecap="round" />
          <polygon points="-15,166 -22,168 -15,170" fill="#D4AF37" />

          {/* Right Arm raised with Sculptor Mallet */}
          <path
            d="M 175,150 L 140,140 L 115,125 L 125,115 L 155,130 Z"
            fill="#4A1B1B"
          />
          {/* Wooden / Brass Mallet */}
          <rect x="105" y="105" width="22" height="14" rx="2" fill="url(#goldShimmer)" transform="rotate(-25 110 110)" />
          <line x1="118" y1="112" x2="135" y2="135" stroke="#996515" strokeWidth="4" />
        </g>

        {/* Sacred ॐ Seal in Center Top */}
        <g transform="translate(250, 75)">
          <circle cx="0" cy="0" r="28" fill="#2A0808" stroke="url(#goldShimmer)" strokeWidth="2" />
          <path
            d="M -5,6 C -9,6 -12,3 -12,0 C -12,-3 -9,-6 -5,-7 C -8,-8 -10,-11 -10,-14 C -10,-18 -6,-21 -2,-21 C 2,-21 6,-18 7,-14 L 3.5,-13 C 2.5,-16 0,-18 -2,-18 C -4.5,-18 -6.5,-16 -6.5,-14 C -6.5,-12 -4.5,-10 -1,-10 L 1.5,-10 L 1.5,-7 L -1,-7 C -5.5,-7 -8.5,-5 -8.5,0 C -8.5,3 -5.5,4.5 -2,4.5 C 2,4.5 5.5,2 7,-1.5 L 9.5,-0.5 C 7.5,4 3.5,6 -2,6 Z M 2,-3 C 5,-3 8,-6 10,-9 C 12,-13 13,-17 14,-21 L 17,-20 C 15.5,-15 14,-11 11.5,-7 C 9,-4 6,-1 2,-1 Z M 7,-23.5 C 5,-22.5 2,-22.5 0,-23.5 C 0,-25 3,-26 7,-26 C 11,-26 14,-25 14,-23.5 C 12,-22.5 9,-22.5 7,-23.5 Z M 7,-28 A 1.8 1.8 0 1 0 7.01,-28 Z"
            fill="url(#goldShimmer)"
            transform="scale(0.9) translate(-2, 8)"
          />
        </g>

        {/* Golden Embellishment Sparks / Floating Blessings */}
        <g fill="#FFE27A" opacity="0.75">
          <circle cx="210" cy="280" r="1.5" />
          <circle cx="230" cy="310" r="2" />
          <circle cx="180" cy="340" r="1.5" />
          <circle cx="270" cy="290" r="1" />
          <circle cx="295" cy="330" r="2.5" />
          <circle cx="150" cy="260" r="1.5" />
          <circle cx="340" cy="240" r="1.5" />
        </g>
      </svg>
    </div>
  );
};
