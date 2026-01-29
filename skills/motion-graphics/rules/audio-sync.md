# Audio Synchronization

Guidelines for integrating audio (voiceovers, music, sound effects) with Manim animations.

## Overview

Audio adds a powerful dimension to animations. Proper synchronization ensures the visual and audio elements work together seamlessly.

## Audio Types

| Type | Use Case | Sync Precision |
|------|----------|----------------|
| Voiceover | Narration, explanations | High (word-level) |
| Background Music | Mood, pacing | Low (beat-level) |
| Sound Effects | Emphasis, feedback | High (frame-level) |

## TTS (Text-to-Speech) Integration

### TTS Options

| Service | Quality | Cost | Speed |
|---------|---------|------|-------|
| Edge TTS | Good | Free | Fast |
| gTTS | Basic | Free | Fast |
| ElevenLabs | Excellent | Paid | Medium |
| OpenAI TTS | Excellent | Paid | Fast |
| Azure TTS | Excellent | Paid | Fast |

### Edge TTS Example

```python
import edge_tts
import asyncio

async def generate_voiceover(text, output_file, voice="en-US-AriaNeural"):
    """Generate voiceover using Edge TTS."""
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)

# Usage
asyncio.run(generate_voiceover(
    "Welcome to this animation about calculus.",
    "voiceover_intro.mp3"
))
```

### Available Voices (Edge TTS)
```python
# English voices
VOICES = {
    "en-US-AriaNeural": "Female, conversational",
    "en-US-GuyNeural": "Male, narration",
    "en-US-JennyNeural": "Female, friendly",
    "en-GB-SoniaNeural": "Female, British",
    "en-AU-NatashaNeural": "Female, Australian",
}
```

## Audio Timing Workflow

### 1. Generate Audio First
```python
# Generate all voiceover segments
segments = [
    ("intro", "Welcome to our tutorial on derivatives."),
    ("definition", "A derivative measures the rate of change."),
    ("example", "Let's look at a simple example."),
]

for name, text in segments:
    asyncio.run(generate_voiceover(text, f"audio/{name}.mp3"))
```

### 2. Get Audio Durations
```python
from pydub import AudioSegment

def get_audio_duration(file_path):
    """Get duration of audio file in seconds."""
    audio = AudioSegment.from_mp3(file_path)
    return len(audio) / 1000.0  # Convert ms to seconds

# Example
intro_duration = get_audio_duration("audio/intro.mp3")
print(f"Intro duration: {intro_duration:.2f}s")
```

### 3. Sync Animation to Audio
```python
class SyncedScene(Scene):
    def construct(self):
        # Pre-calculated durations from audio
        AUDIO_DURATIONS = {
            "intro": 3.2,
            "definition": 4.5,
            "example": 2.8,
        }
        
        # Intro segment
        title = Text("Derivatives")
        self.play(Write(title), run_time=min(1.5, AUDIO_DURATIONS["intro"]))
        self.wait(AUDIO_DURATIONS["intro"] - 1.5)  # Fill remaining time
        
        # Definition segment
        definition = MathTex(r"f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}")
        self.play(
            FadeOut(title),
            Write(definition),
            run_time=min(2.0, AUDIO_DURATIONS["definition"])
        )
        self.wait(AUDIO_DURATIONS["definition"] - 2.0)
```

## Voiceover Markers

### Marker Format in Scene Spec
```markdown
## Scene 1: Introduction
**Duration:** 5.2s (from audio)

### Voiceover
"Welcome to this tutorial. [PAUSE 0.5] Today we'll learn about derivatives."

### Timing Markers
| Marker | Time | Action |
|--------|------|--------|
| 0.0s | Start | Show title |
| 1.2s | "tutorial" | Title fully written |
| 1.7s | Pause start | Wait |
| 2.2s | "Today" | Start equation fade-in |
| 5.2s | End | Transition |
```

### Implementing Markers
```python
class MarkedScene(Scene):
    MARKERS = [
        (0.0, "start"),
        (1.2, "title_complete"),
        (1.7, "pause_start"),
        (2.2, "equation_start"),
        (5.2, "end"),
    ]
    
    def construct(self):
        title = Text("Derivatives")
        equation = MathTex("f'(x)")
        
        # Start to title_complete (1.2s)
        self.play(Write(title), run_time=1.2)
        
        # Pause (0.5s)
        self.wait(0.5)
        
        # Equation start to end
        self.play(
            FadeOut(title),
            Write(equation),
            run_time=3.0  # 5.2 - 2.2
        )
```

## Audio/Video Muxing

### Using FFmpeg
```bash
# Combine video with single audio track
ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac -shortest output.mp4

# Combine video with multiple audio segments
ffmpeg -i video.mp4 \
  -i audio/intro.mp3 \
  -i audio/main.mp3 \
  -i audio/outro.mp3 \
  -filter_complex "[1:a][2:a][3:a]concat=n=3:v=0:a=1[out]" \
  -map 0:v -map "[out]" \
  -c:v copy -c:a aac \
  output.mp4
```

### Python Wrapper
```python
import subprocess

def mux_audio_video(video_path, audio_path, output_path):
    """Combine video and audio into single file."""
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", audio_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        output_path
    ]
    subprocess.run(cmd, check=True)

def concatenate_audio(audio_files, output_path):
    """Concatenate multiple audio files."""
    # Create file list
    with open("audio_list.txt", "w") as f:
        for audio_file in audio_files:
            f.write(f"file '{audio_file}'\n")
    
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", "audio_list.txt",
        "-c", "copy",
        output_path
    ]
    subprocess.run(cmd, check=True)
```

## Background Music

### Volume Balancing
```bash
# Lower music volume when voiceover plays (ducking)
ffmpeg -i video.mp4 -i voiceover.mp3 -i music.mp3 \
  -filter_complex "[2:a]volume=0.2[music];[1:a][music]amix=inputs=2:duration=longest[out]" \
  -map 0:v -map "[out]" \
  -c:v copy -c:a aac \
  output.mp4
```

### Music Timing
```python
# Music should align with scene changes
MUSIC_MARKERS = {
    "intro": {"start": 0, "end": 10, "fade_in": 2},
    "main": {"start": 10, "end": 120, "volume": 0.3},
    "outro": {"start": 120, "end": 140, "fade_out": 5},
}
```

## Sound Effects

### Common Effects
| Effect | Use Case | Duration |
|--------|----------|----------|
| Whoosh | Transitions | 0.3-0.5s |
| Pop | Element appears | 0.1-0.2s |
| Click | Button/selection | 0.05-0.1s |
| Ding | Completion | 0.3-0.5s |
| Swoosh | Movement | 0.2-0.4s |

### Triggering Effects
```python
class SFXScene(Scene):
    # Map animations to sound effects
    SFX_MAP = {
        "appear": "sfx/pop.mp3",
        "transform": "sfx/whoosh.mp3",
        "complete": "sfx/ding.mp3",
    }
    
    def construct(self):
        circle = Circle()
        
        # Log timing for post-processing
        self.sfx_cues = []
        
        # Pop sound at 0s
        self.sfx_cues.append((0, "appear"))
        self.play(GrowFromCenter(circle))
        
        # Whoosh at current time
        self.sfx_cues.append((self.renderer.time, "transform"))
        self.play(circle.animate.shift(RIGHT * 2))
```

## Complete Pipeline

### Workflow
```
1. Write script text
      ↓
2. Generate TTS audio
      ↓
3. Get audio durations
      ↓
4. Create scene spec with timings
      ↓
5. Implement Manim animation
      ↓
6. Render video (no audio)
      ↓
7. Mux audio + video
      ↓
8. Add music/SFX (optional)
      ↓
9. Final export
```

### Pipeline Script
```python
import asyncio
import subprocess
from pathlib import Path

class AudioPipeline:
    def __init__(self, project_dir):
        self.project_dir = Path(project_dir)
        self.audio_dir = self.project_dir / "audio"
        self.audio_dir.mkdir(exist_ok=True)
    
    async def generate_all_audio(self, script_segments):
        """Generate TTS for all segments."""
        for name, text in script_segments.items():
            output = self.audio_dir / f"{name}.mp3"
            await generate_voiceover(text, str(output))
    
    def get_all_durations(self):
        """Get durations for all audio files."""
        durations = {}
        for audio_file in self.audio_dir.glob("*.mp3"):
            durations[audio_file.stem] = get_audio_duration(str(audio_file))
        return durations
    
    def mux_final(self, video_path, output_path):
        """Combine all audio with video."""
        audio_files = sorted(self.audio_dir.glob("*.mp3"))
        
        # Concatenate audio
        combined_audio = self.audio_dir / "combined.mp3"
        concatenate_audio(
            [str(f) for f in audio_files],
            str(combined_audio)
        )
        
        # Mux with video
        mux_audio_video(video_path, str(combined_audio), output_path)
```

## Best Practices

### Do
- Generate audio before animating
- Use timing markers in specs
- Leave buffer time between segments
- Test audio sync at multiple points
- Use consistent voice throughout

### Avoid
- Animating faster than narration
- Abrupt audio cuts
- Inconsistent volume levels
- Missing audio for long sequences
- Over-compressed audio
