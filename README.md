# Manim Video Generator 🎬

A web-based tool for generating mathematical animations using Manim, Flask, and OpenAI. Create beautiful mathematical visualizations with simple text prompts.

[![manim video generator](https://img.youtube.com/vi/rIltjjzxsGQ/0.jpg)](https://www.youtube.com/watch?v=rIltjjzxsGQ)

## 🌟 Features

- Generate mathematical animations from text descriptions
- Modern, responsive web interface
- Real-time code preview with syntax highlighting
- Support for various mathematical concepts
- Easy-to-use example prompts
- Docker support for easy deployment

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/rohitg00/manim-video-generator.git
cd manim-video-generator
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your OpenAI API key
```

4. Run the application:
```bash
python app.py
```

5. Visit `http://localhost:5000` in your browser

## 🐳 Docker Setup

1. Build the Docker image:
```bash
docker build -t manim-generator .
```

2. Run the container:
```bash
docker run -p 5000:5000 -v $(pwd)/media:/app/media manim-generator
```

## 📝 Usage Notes

- Ensure your mathematical concepts are clearly described
- Complex animations may take longer to generate
- Supported topics include:
  - Basic geometry and algebra
  - Calculus concepts
  - 3D visualizations
  - Matrix operations
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

### Trigonometry
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

## 🔧 Requirements

- Python 3.10+
- FFmpeg
- Cairo
- LaTeX (for mathematical typesetting)
- OpenAI API key

## 🤝 Credits

- Created by [Rohit Ghumare](https://github.com/rohitg00)
- Powered by [Manim Community](https://www.manim.community/)
- Special thanks to:
  - [3Blue1Brown](https://www.3blue1brown.com/) for creating Manim
  - [Sevalla](https://sevalla.com/) for support and inspiration
  - The Manim Community for their excellent documentation and support

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- [Manim Documentation](https://docs.manim.community/)
- [3Blue1Brown's Manim](https://3b1b.github.io/manim/)
- [OpenAI API](https://openai.com/api/)
- [Flask Documentation](https://flask.palletsprojects.com/)

## 🤔 Common Issues & Solutions

1. **LaTeX Errors**
   - Ensure you have a complete LaTeX distribution installed
   - Check for syntax errors in mathematical expressions

2. **Rendering Issues**
   - Verify FFmpeg installation
   - Check Cairo dependencies
   - Ensure sufficient system resources

3. **API Rate Limits**
   - Monitor OpenAI API usage
   - Implement appropriate rate limiting
   - Consider using API key rotation for high traffic

## 🎯 Future Roadmap

- [ ] User authentication system
- [ ] Save and share animations
- [ ] Custom animation templates
- [ ] Batch processing
- [ ] Advanced customization options
- [ ] API endpoint for programmatic access

## 💡 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the [Common Issues](#-common-issues--solutions) section
2. Search existing GitHub issues
3. Create a new issue if needed

---

Made with ❤️ using Manim, Flask, and OpenAI
