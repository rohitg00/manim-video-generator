# Web Export Patterns

Guidelines for exporting Manim animations for web deployment, including React/Next.js integration.

## Export Formats for Web

| Format | Use Case | File Size | Browser Support |
|--------|----------|-----------|-----------------|
| MP4 (H.264) | General video | Medium | Universal |
| WebM (VP9) | Modern browsers | Small | Chrome, Firefox |
| GIF | Short loops | Large | Universal |
| PNG Sequence | Programmatic control | Very Large | Universal |
| SVG | Vector graphics | Tiny | Universal |
| Lottie/JSON | Interactive | Small | With library |

## Transparent Background Export

### Manim CLI
```bash
# Export with transparent background
manim -pql -t script.py SceneName

# Transparent + high quality
manim -pqh -t script.py SceneName --format webm
```

### In Code
```python
class TransparentScene(Scene):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.camera.background_color = None  # Transparent
    
    def construct(self):
        circle = Circle(color=BLUE, fill_opacity=0.8)
        self.play(Create(circle))
```

## Optimized Video Export

### Web-Optimized MP4
```bash
# Two-pass encoding for best quality/size ratio
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 22 \
  -c:a aac -b:a 128k \
  -movflags +faststart \  # Enable streaming
  -vf scale=1920:1080 \
  output_web.mp4
```

### WebM for Modern Browsers
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 \
  -c:a libopus -b:a 128k \
  output.webm
```

### Responsive Sizes
```python
EXPORT_SIZES = {
    "mobile": {"width": 640, "height": 360, "suffix": "_mobile"},
    "tablet": {"width": 1280, "height": 720, "suffix": "_tablet"},
    "desktop": {"width": 1920, "height": 1080, "suffix": "_desktop"},
    "4k": {"width": 3840, "height": 2160, "suffix": "_4k"},
}

def export_all_sizes(input_file, output_base):
    """Export video in multiple sizes for responsive loading."""
    for name, config in EXPORT_SIZES.items():
        output = f"{output_base}{config['suffix']}.mp4"
        cmd = [
            "ffmpeg", "-i", input_file,
            "-vf", f"scale={config['width']}:{config['height']}",
            "-c:v", "libx264", "-preset", "slow", "-crf", "22",
            output
        ]
        subprocess.run(cmd)
```

## GIF Export

### High-Quality GIF Pipeline
```bash
# Step 1: Generate palette
ffmpeg -i input.mp4 -vf "fps=15,scale=480:-1:flags=lanczos,palettegen" palette.png

# Step 2: Use palette for GIF
ffmpeg -i input.mp4 -i palette.png \
  -filter_complex "fps=15,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse" \
  output.gif
```

### Python Wrapper
```python
def create_optimized_gif(input_video, output_gif, fps=15, width=480):
    """Create optimized GIF from video."""
    palette = "palette_temp.png"
    
    # Generate palette
    subprocess.run([
        "ffmpeg", "-y", "-i", input_video,
        "-vf", f"fps={fps},scale={width}:-1:flags=lanczos,palettegen",
        palette
    ])
    
    # Create GIF
    subprocess.run([
        "ffmpeg", "-y", "-i", input_video, "-i", palette,
        "-filter_complex", 
        f"fps={fps},scale={width}:-1:flags=lanczos[x];[x][1:v]paletteuse",
        output_gif
    ])
    
    # Cleanup
    os.remove(palette)
```

## React Integration

### Basic Video Component
```jsx
// components/ManimAnimation.jsx
import React, { useRef, useEffect } from 'react';

export function ManimAnimation({ src, autoplay = true, loop = false }) {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (autoplay && videoRef.current) {
      videoRef.current.play();
    }
  }, [autoplay]);
  
  return (
    <video
      ref={videoRef}
      src={src}
      loop={loop}
      muted
      playsInline
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}
```

### Responsive Video with Sources
```jsx
// components/ResponsiveAnimation.jsx
export function ResponsiveAnimation({ basePath, alt }) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      style={{ maxWidth: '100%' }}
    >
      <source 
        src={`${basePath}_desktop.webm`} 
        type="video/webm"
        media="(min-width: 1024px)"
      />
      <source 
        src={`${basePath}_tablet.mp4`} 
        type="video/mp4"
        media="(min-width: 768px)"
      />
      <source 
        src={`${basePath}_mobile.mp4`} 
        type="video/mp4"
      />
      {alt}
    </video>
  );
}
```

## Scroll-Driven Animations

### Scroll Progress Hook
```jsx
// hooks/useScrollProgress.js
import { useState, useEffect } from 'react';

export function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress (0 to 1)
      const start = windowHeight;  // Element enters viewport
      const end = -rect.height;    // Element leaves viewport
      const current = rect.top;
      
      const progress = Math.max(0, Math.min(1, 
        (start - current) / (start - end)
      ));
      
      setProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();  // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);
  
  return progress;
}
```

### Scroll-Synced Video
```jsx
// components/ScrollVideo.jsx
import { useRef, useEffect } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

export function ScrollVideo({ src }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const progress = useScrollProgress(containerRef);
  
  useEffect(() => {
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = progress * videoRef.current.duration;
    }
  }, [progress]);
  
  return (
    <div ref={containerRef} style={{ height: '300vh' }}>
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        style={{
          position: 'sticky',
          top: '50%',
          transform: 'translateY(-50%)',
          maxWidth: '100%'
        }}
      />
    </div>
  );
}
```

## Next.js Integration

### Static Asset Placement
```
public/
├── animations/
│   ├── intro.mp4
│   ├── intro.webm
│   ├── derivative.mp4
│   └── derivative.webm
```

### Dynamic Import for Heavy Components
```jsx
// pages/tutorial.jsx
import dynamic from 'next/dynamic';

const HeavyAnimation = dynamic(
  () => import('../components/HeavyAnimation'),
  { 
    loading: () => <div>Loading animation...</div>,
    ssr: false  // Disable server-side rendering
  }
);

export default function TutorialPage() {
  return (
    <main>
      <h1>Calculus Tutorial</h1>
      <HeavyAnimation src="/animations/derivative.mp4" />
    </main>
  );
}
```

### Pre-rendering at Build Time
```javascript
// next.config.js
module.exports = {
  // Pre-render animations during build
  async headers() {
    return [
      {
        source: '/animations/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

## SVG Export for Text

### Export Text as SVG
```python
class SVGTextScene(Scene):
    def construct(self):
        text = Text("Mathematical Beauty")
        self.add(text)
        
        # Export to SVG (instead of video)
        # Use: manim -pql --format svg script.py
```

### Animate SVG in Browser
```jsx
// components/AnimatedSVG.jsx
import { motion } from 'framer-motion';

export function AnimatedText({ svgPath }) {
  return (
    <motion.svg
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    >
      {/* SVG paths from Manim export */}
    </motion.svg>
  );
}
```

## Pre-rendering Workflow

### Build-Time Rendering
```javascript
// scripts/prerender-animations.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCENES = [
  { file: 'scenes/intro.py', scene: 'IntroScene' },
  { file: 'scenes/main.py', scene: 'MainContent' },
  { file: 'scenes/outro.py', scene: 'OutroScene' },
];

const OUTPUT_DIR = 'public/animations';

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Render each scene
for (const { file, scene } of SCENES) {
  console.log(`Rendering ${scene}...`);
  
  execSync(
    `manim -qh --format mp4 ${file} ${scene} -o ${OUTPUT_DIR}/${scene}.mp4`,
    { stdio: 'inherit' }
  );
  
  // Also create WebM version
  execSync(
    `ffmpeg -i ${OUTPUT_DIR}/${scene}.mp4 -c:v libvpx-vp9 -crf 30 ${OUTPUT_DIR}/${scene}.webm`,
    { stdio: 'inherit' }
  );
}

console.log('Pre-rendering complete!');
```

### Add to Build Pipeline
```json
// package.json
{
  "scripts": {
    "prerender": "node scripts/prerender-animations.js",
    "build": "npm run prerender && next build"
  }
}
```

## Performance Optimization

### Lazy Loading
```jsx
// Only load video when in viewport
import { useInView } from 'react-intersection-observer';

function LazyVideo({ src }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',  // Start loading before visible
  });
  
  return (
    <div ref={ref}>
      {inView && (
        <video src={src} autoPlay muted loop playsInline />
      )}
    </div>
  );
}
```

### Poster Images
```jsx
// Show poster while video loads
<video
  src="/animations/intro.mp4"
  poster="/animations/intro-poster.jpg"
  autoPlay
  muted
/>
```

### Generate Poster
```bash
# Extract first frame as poster
ffmpeg -i input.mp4 -vframes 1 -q:v 2 poster.jpg
```

## Best Practices

### Do
- Use WebM for modern browsers, MP4 as fallback
- Implement lazy loading for below-fold content
- Pre-render at build time when possible
- Use appropriate quality for device
- Add loading states

### Avoid
- Autoplay with sound (blocked by browsers)
- Very large files without compression
- Rendering client-side (slow)
- Missing fallbacks for older browsers
