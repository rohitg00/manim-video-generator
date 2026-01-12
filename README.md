# Manim Video Generator - Motia Edition 🎬

A **Manim animation generator** rebuilt with [Motia](https://motia.dev) - the event-driven backend framework. This version demonstrates how to structure a video generation pipeline using Motia's Step primitives.

[![manim video generator](https://img.youtube.com/vi/rIltjjzxsGQ/0.jpg)](https://www.youtube.com/watch?v=rIltjjzxsGQ)

**[Detailed Step-by-Step Guide available here](https://sevalla.com/blog/guide-to-building-an-ai-powered-mathematical-animation-generator)**

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

## 🎥 Showcase

Here are some examples of complex mathematical animations generated using our tool:

### Complex Analysis Visualization
<img src="static/gifs/complex_analysis.gif" width="800" alt="Complex Number Transformations">

*This animation demonstrates complex number transformations, showing how functions map points in the complex plane. Watch as the visualization reveals the geometric interpretation of complex operations.*

### 3D Calculus Concepts
<img src="static/gifs/3d_calculus.gif" width="800" alt="3D Surface Integration">

*A sophisticated 3D visualization showing multivariable calculus concepts. The animation illustrates surface integrals and vector fields in three-dimensional space, making abstract concepts tangible.*

### Differential Equations
<img src="static/gifs/differential_equations.gif" width="800" alt="Differential Equations">

*This animation brings differential equations to life by visualizing solution curves and phase spaces. Watch how the system evolves over time, revealing the underlying mathematical patterns.*

### Linear Algebra Transformations
<img src="static/gifs/ComplexNumbersAnimation_ManimCE_v0.17.3.gif" width="800" alt="Linear Transformations">

*Experience linear transformations in action! This visualization demonstrates how matrices transform space, showing concepts like eigenvectors, rotations, and scaling in an intuitive way.*

These examples showcase the power of our tool in creating complex mathematical visualizations. Each animation is generated from a simple text description, demonstrating the capability to:
- Render sophisticated 3D scenes with proper lighting and perspective
- Create smooth transitions between mathematical concepts
- Visualize abstract mathematical relationships
- Handle multiple mathematical objects with precise timing
- Generate publication-quality animations for educational purposes

## Why Motia?

The original Flask app handled everything synchronously. With Motia:

1. **Async Processing** - Long-running renders don't block the API
2. **Event-Driven** - Each step is decoupled and independently scalable
3. **Type Safety** - Zod schemas validate inputs/outputs
4. **Observability** - Built-in tracing via Motia Workbench
5. **Multi-Language** - Python steps can be added alongside TypeScript

## Deployment

### Docker (Local/Self-Hosted)

```bash
# Build and run with docker-compose
docker-compose up -d

# Or build manually
docker build -t manim-generator-motia .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your-key \
  -v $(pwd)/public/videos:/app/public/videos \
  manim-generator-motia
```

### Sevalla Deployment

1. **Connect Repository**: Link your GitHub repo to Sevalla
2. **Configure Build**:
   - Build Command: `npm run build`
   - Start Command: `motia start`
   - Dockerfile Path: `motia/Dockerfile`
3. **Set Environment Variables**:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `OPENAI_MODEL` - (optional) gpt-4o-mini
   - `NODE_ENV` - production
4. **Deploy**: Sevalla will build and deploy automatically

### Frontend-Backend Connection

The frontend (`public/index.html`) is served by Motia from the same origin as the API:

- **Frontend**: Served at `/` (root)
- **API Endpoints**: `/api/generate`, `/api/jobs/:jobId`
- **Generated Videos**: `/videos/*.mp4`

```
┌─────────────────────────────────────────────────────┐
│                    Motia Server                     │
│                  (port 3000)                        │
│                                                     │
│  ┌─────────────┐    ┌─────────────────────────────┐ │
│  │   Express   │    │     Motia Steps             │ │
│  │  Middleware │    │                             │ │
│  │             │    │  /api/generate → GenerateApi│ │
│  │  GET /      │    │  /api/jobs/*  → JobStatusApi│ │
│  │  (index.html)    │                             │ │
│  │             │    │  Events:                    │ │
│  │  /videos/*  │    │  → AnalyzeConcept           │ │
│  │  (static)   │    │  → GenerateCode             │ │
│  │             │    │  → RenderVideo              │ │
│  └─────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Multi-Instance Scaling

For horizontal scaling, configure Redis adapter in `motia.config.ts`:

```typescript
import { config } from 'motia'

export default config({
  adapters: {
    state: {
      type: 'redis',
      options: { host: 'redis', port: 6379 }
    },
    events: {
      type: 'redis',
      options: { host: 'redis', port: 6379 }
    }
  }
})
```

## Development

View the workflow in Motia Workbench:
```bash
npm run dev
# Open http://localhost:3000/workbench
```

### Health Check

The app exposes a health endpoint for container orchestration:

```bash
curl http://localhost:3000/health
# {"status":"healthy","timestamp":"2024-..."}
```

## 🤝 Credits

- Created by [Rohit Ghumare](https://github.com/rohitg00)
- Powered by [Manim Community](https://www.manim.community/)
- Special thanks to:
  - [3Blue1Brown](https://www.3blue1brown.com/) for creating Manim
  - [Sevalla](https://sevalla.com/) for deployment and support
  - [Manim Community](https://www.manim.community/) for their excellent documentation and support
  - [Motia](https://motia.dev) for the event-driven framework

## 🔗 Links

- [Manim Documentation](https://docs.manim.community/)
- [3Blue1Brown's Manim](https://3b1b.github.io/manim/)
- [Motia Documentation](https://motia.dev)
- [OpenAI API](https://openai.com/api/)

## License

MIT License - See [LICENSE](LICENSE) for details.
