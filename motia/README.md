# Manim Video Generator - Motia Edition

A **Manim animation generator** rebuilt with [Motia](https://motia.dev) - the event-driven backend framework. This version demonstrates how to structure a video generation pipeline using Motia's Step primitives.

## Architecture

This application uses Motia's event-driven architecture to process animation requests asynchronously:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   GenerateApi   │────►│  AnalyzeConcept  │────►│   GenerateCode  │
│  (API Step)     │     │  (Event Step)    │     │  (Event Step)   │
│ POST /api/gen   │     │  LaTeX/template  │     │  AI or template │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                        ┌──────────────────┐              │
                        │   StoreResult    │◄─────────────┤
                        │  (Event Step)    │              │
                        │  Stores results  │              ▼
                        └──────────────────┘     ┌─────────────────┐
                                ▲                │   RenderVideo   │
                                │                │  (Event Step)   │
                                └────────────────│  Runs Manim CLI │
                                                 └─────────────────┘

┌─────────────────┐
│  JobStatusApi   │
│  (API Step)     │
│ GET /api/jobs/* │
└─────────────────┘
```

## Event Flow

1. **animation.requested** - Client submits concept via `POST /api/generate`
2. **concept.analyzed** - Concept analyzed (LaTeX? Template match? Need AI?)
3. **code.generated** - Manim Python code generated
4. **video.rendered** / **video.failed** - Video rendered or error occurs
5. Client polls `GET /api/jobs/:jobId` until complete

## Project Structure

```
motia/
├── src/
│   ├── api/
│   │   ├── generate.step.ts      # POST /api/generate
│   │   └── job-status.step.ts    # GET /api/jobs/:jobId
│   ├── events/
│   │   ├── analyze-concept.step.ts
│   │   ├── generate-code.step.ts
│   │   ├── render-video.step.ts
│   │   └── store-result.step.ts
│   └── services/
│       ├── job-store.ts          # In-memory result storage
│       ├── manim-templates.ts    # Pre-built templates
│       └── openai-client.ts      # AI code generation
├── public/
│   ├── index.html                # Frontend UI
│   └── videos/                   # Generated videos
├── motia.config.ts               # Motia configuration
├── package.json
└── tsconfig.json
```

## Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- Manim Community Edition
- FFmpeg
- LaTeX distribution (texlive)

### Installation

```bash
# Navigate to motia directory
cd motia

# Install dependencies (will run motia install via postinstall)
npm install

# Add OpenAI and UUID dependencies
npm install openai uuid zod

# Configure environment
cp .env.example .env
# Edit .env with your OpenAI API key

# Generate types
npm run generate-types

# Start development server
npm run dev
```

### Environment Variables

```bash
# Required
OPENAI_API_KEY=your-openai-api-key

# Optional
OPENAI_MODEL=gpt-4o-mini    # Default model for code generation
```

## Usage

1. Start the server: `npm run dev`
2. Open http://localhost:3000
3. Enter a mathematical concept or LaTeX expression
4. Click "Generate Animation"
5. Wait for the video to render (poll status automatically)

## API Endpoints

### POST /api/generate

Start animation generation.

```json
{
  "concept": "Demonstrate the Pythagorean theorem",
  "quality": "low"
}
```

Response:
```json
{
  "success": true,
  "jobId": "uuid",
  "status": "processing"
}
```

### GET /api/jobs/:jobId

Check job status.

Response (completed):
```json
{
  "jobId": "uuid",
  "status": "completed",
  "video_url": "/videos/uuid.mp4",
  "code": "from manim import *...",
  "used_ai": false,
  "render_quality": "low"
}
```

## Supported Topics

- Pythagorean theorem
- Quadratic functions
- Trigonometry (unit circle)
- 3D surface plots
- Sphere/Cube geometry
- Derivatives & Integration
- Matrix operations & Eigenvalues
- Complex numbers
- Differential equations

## Why Motia?

The original Flask app handled everything synchronously. With Motia:

1. **Async Processing** - Long-running renders don't block the API
2. **Event-Driven** - Each step is decoupled and independently scalable
3. **Type Safety** - Zod schemas validate inputs/outputs
4. **Observability** - Built-in tracing via Motia Workbench
5. **Multi-Language** - Python steps can be added alongside TypeScript

## Development

View the workflow in Motia Workbench:
```bash
npm run dev
# Open http://localhost:3000/workbench
```

## License

MIT
