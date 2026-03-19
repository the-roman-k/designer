/**
 * Vapour Text Effect
 * Adapted from Jatin Yadav (@jatin-yadav05) 21st.dev component for Vanilla JS
 */

class VapourTextCycle {
  constructor(options) {
    this.container = options.container;
    this.texts = options.texts || ["Next.js", "React"];
    this.font = options.font || {
      fontFamily: "sans-serif",
      fontSize: "50px",
      fontWeight: 400,
    };
    this.color = options.color || "rgb(255, 255, 255)";
    this.spread = options.spread !== undefined ? options.spread : 5;
    this.density = options.density !== undefined ? options.density : 5;
    this.animation = options.animation || {
      vaporizeDuration: 2,
      fadeInDuration: 1,
      waitDuration: 0.5,
    };
    this.direction = options.direction || "left-to-right";
    this.alignment = options.alignment || "center";

    this.canvas = document.createElement('canvas');
    this.canvas.style.minWidth = "30px";
    this.canvas.style.minHeight = "20px";
    this.canvas.style.pointerEvents = "none";
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    this.particles = [];
    this.animationFrameId = null;
    this.currentTextIndex = 0;
    this.animationState = "static"; // static | vaporizing | fadingIn | waiting
    this.vaporizeProgress = 0;
    this.fadeOpacity = 0;
    this.wrapperSize = { width: 0, height: 0 };
    
    this.transformedDensity = this.transformValue(this.density, [0, 10], [0.3, 1], true);
    this.globalDpr = window.devicePixelRatio * 1.5 || 1;

    this.animationDurations = {
      VAPORIZE_DURATION: (this.animation.vaporizeDuration) * 1000,
      FADE_IN_DURATION: (this.animation.fadeInDuration) * 1000,
      WAIT_DURATION: (this.animation.waitDuration) * 1000,
    };

    const fontSize = parseInt(this.font.fontSize.replace("px", "") || "50");
    const VAPORIZE_SPREAD = this.calculateVaporizeSpread(fontSize);
    this.MULTIPLIED_VAPORIZE_SPREAD = VAPORIZE_SPREAD * this.spread;
    this.fontString = `${this.font.fontWeight} ${fontSize * this.globalDpr}px ${this.font.fontFamily}`;
    
    this.textBoundaries = null;
    this.lastTime = 0;
    this.isInView = false;
    
    this.init();
  }

  init() {
    this.updateSize();
    
    // Resize observer
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.updateSize(entry.contentRect.width, entry.contentRect.height);
      }
    });
    this.resizeObserver.observe(this.container);

    // Initial render
    this.renderCanvas();

    // Intersection observer
    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.isInView = entries[0].isIntersecting;
      if (this.isInView) {
        setTimeout(() => {
          if (this.animationState === "static") {
            this.animationState = "vaporizing";
            this.lastTime = performance.now();
            this.startAnimation();
          }
        }, 2000);
      } else {
        this.animationState = "static";
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
      }
    }, { threshold: 0, rootMargin: '50px' });
    
    this.intersectionObserver.observe(this.container);
  }

  updateSize(width = this.container.clientWidth, height = this.container.clientHeight) {
    this.wrapperSize = { width, height };
    this.renderCanvas();
  }

  transformValue(input, inputRange, outputRange, clamp = false) {
    const [inputMin, inputMax] = inputRange;
    const [outputMin, outputMax] = outputRange;
    
    const progress = (input - inputMin) / (inputMax - inputMin);
    let result = outputMin + progress * (outputMax - outputMin);
    
    if (clamp) {
      if (outputMax > outputMin) {
        result = Math.min(Math.max(result, outputMin), outputMax);
      } else {
        result = Math.min(Math.max(result, outputMax), outputMin);
      }
    }
    
    return result;
  }

  calculateVaporizeSpread(fontSize) {
    const size = typeof fontSize === "string" ? parseInt(fontSize) : fontSize;
    const points = [
      { size: 20, spread: 0.2 },
      { size: 50, spread: 0.5 },
      { size: 100, spread: 1.5 }
    ];
    
    if (size <= points[0].size) return points[0].spread;
    if (size >= points[points.length - 1].size) return points[points.length - 1].spread;
    
    let i = 0;
    while (i < points.length - 1 && points[i + 1].size < size) i++;
    
    const p1 = points[i];
    const p2 = points[i + 1];
    
    return p1.spread + (size - p1.size) * (p2.spread - p1.spread) / (p2.size - p1.size);
  }

  parseColor(color) {
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    
    if (rgbaMatch) {
      const [_, r, g, b, a] = rgbaMatch;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } else if (rgbMatch) {
      const [_, r, g, b] = rgbMatch;
      return `rgba(${r}, ${g}, ${b}, 1)`;
    }
    
    return "rgba(0, 0, 0, 1)";
  }

  createParticles(text, textX, textY, font, color, alignment) {
    const particles = [];
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.textAlign = alignment;
    this.ctx.textBaseline = "middle";
    this.ctx.imageSmoothingQuality = "high";
    this.ctx.imageSmoothingEnabled = true;

    if ('fontKerning' in this.ctx) this.ctx.fontKerning = "normal";
    if ('textRendering' in this.ctx) this.ctx.textRendering = "geometricPrecision";

    const metrics = this.ctx.measureText(text);
    let textLeft;
    const textWidth = metrics.width;
    
    if (alignment === "center") {
      textLeft = textX - textWidth / 2;
    } else if (alignment === "left") {
      textLeft = textX;
    } else {
      textLeft = textX - textWidth;
    }
    
    const textBoundaries = {
      left: textLeft,
      right: textLeft + textWidth,
      width: textWidth,
    };

    this.ctx.fillText(text, textX, textY);

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    const baseDPR = 3; 
    const currentDPR = this.canvas.width / parseInt(this.canvas.style.width || this.wrapperSize.width);
    const baseSampleRate = Math.max(1, Math.round(currentDPR / baseDPR));
    const sampleRate = Math.max(1, Math.round(baseSampleRate));

    for (let y = 0; y < this.canvas.height; y += sampleRate) {
      for (let x = 0; x < this.canvas.width; x += sampleRate) {
        const index = (y * this.canvas.width + x) * 4;
        const alpha = data[index + 3];
        
        if (alpha > 0) {
          const originalAlpha = alpha / 255 * (sampleRate / currentDPR);
          particles.push({
            x,
            y,
            originalX: x,
            originalY: y,
            color: `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, ${originalAlpha})`,
            opacity: originalAlpha,
            originalAlpha,
            velocityX: 0,
            velocityY: 0,
            angle: 0,
            speed: 0,
          });
        }
      }
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    return { particles, textBoundaries };
  }

  renderCanvas() {
    if (!this.wrapperSize.width || !this.wrapperSize.height) return;

    const { width, height } = this.wrapperSize;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = Math.floor(width * this.globalDpr);
    this.canvas.height = Math.floor(height * this.globalDpr);

    const color = this.parseColor(this.color);

    let textX;
    const textY = this.canvas.height / 2;
    const currentText = this.texts[this.currentTextIndex] || "";

    if (this.alignment === "center") textX = this.canvas.width / 2;
    else if (this.alignment === "left") textX = 0;
    else textX = this.canvas.width;

    const { particles, textBoundaries } = this.createParticles(currentText, textX, textY, this.fontString, color, this.alignment);

    this.particles = particles;
    this.textBoundaries = textBoundaries;
  }

  updateParticlesLogic(vaporizeX, deltaTime) {
    let allParticlesVaporized = true;
    
    this.particles.forEach(particle => {
      const shouldVaporize = this.direction === "left-to-right" 
        ? particle.originalX <= vaporizeX 
        : particle.originalX >= vaporizeX;
      
      if (shouldVaporize) {
        if (particle.speed === 0) {
          particle.angle = Math.random() * Math.PI * 2;
          particle.speed = (Math.random() * 1 + 0.5) * this.MULTIPLIED_VAPORIZE_SPREAD;
          particle.velocityX = Math.cos(particle.angle) * particle.speed;
          particle.velocityY = Math.sin(particle.angle) * particle.speed;
          
          particle.shouldFadeQuickly = Math.random() > this.transformedDensity;
        }
        
        if (particle.shouldFadeQuickly) {
          particle.opacity = Math.max(0, particle.opacity - deltaTime);
        } else {
          const dx = particle.originalX - particle.x;
          const dy = particle.originalY - particle.y;
          const distanceFromOrigin = Math.sqrt(dx * dx + dy * dy);
          
          const dampingFactor = Math.max(0.95, 1 - distanceFromOrigin / (100 * this.MULTIPLIED_VAPORIZE_SPREAD));
          
          const randomSpread = this.MULTIPLIED_VAPORIZE_SPREAD * 3;
          const spreadX = (Math.random() - 0.5) * randomSpread;
          const spreadY = (Math.random() - 0.5) * randomSpread;
          
          particle.velocityX = (particle.velocityX + spreadX + dx * 0.002) * dampingFactor;
          particle.velocityY = (particle.velocityY + spreadY + dy * 0.002) * dampingFactor;
          
          const maxVelocity = this.MULTIPLIED_VAPORIZE_SPREAD * 2;
          const currentVelocity = Math.sqrt(particle.velocityX * particle.velocityX + particle.velocityY * particle.velocityY);
          
          if (currentVelocity > maxVelocity) {
            const scale = maxVelocity / currentVelocity;
            particle.velocityX *= scale;
            particle.velocityY *= scale;
          }
          
          particle.x += particle.velocityX * deltaTime * 20;
          particle.y += particle.velocityY * deltaTime * 10;
          
          const baseFadeRate = 0.25;
          const durationBasedFadeRate = baseFadeRate * (2000 / this.animationDurations.VAPORIZE_DURATION);
          
          particle.opacity = Math.max(0, particle.opacity - deltaTime * durationBasedFadeRate);
        }
        
        if (particle.opacity > 0.01) {
          allParticlesVaporized = false;
        }
      } else {
        allParticlesVaporized = false;
      }
    });
    
    return allParticlesVaporized;
  }

  drawParticles() {
    this.ctx.save();
    this.ctx.scale(this.globalDpr, this.globalDpr);
    
    this.particles.forEach(particle => {
      if (particle.opacity > 0) {
        const color = particle.color.replace(/[\d.]+\)$/, `${particle.opacity})`);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(particle.x / this.globalDpr, particle.y / this.globalDpr, 1, 1);
      }
    });
    
    this.ctx.restore();
  }

  resetParticles() {
    this.particles.forEach(particle => {
      particle.x = particle.originalX;
      particle.y = particle.originalY;
      particle.opacity = particle.originalAlpha;
      particle.speed = 0;
      particle.velocityX = 0;
      particle.velocityY = 0;
    });
  }

  animate = (currentTime) => {
    if (!this.isInView) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (!this.particles.length) {
      this.animationFrameId = requestAnimationFrame(this.animate);
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    switch (this.animationState) {
      case "static": {
        this.drawParticles();
        break;
      }
      case "vaporizing": {
        this.vaporizeProgress += deltaTime * 100 / (this.animationDurations.VAPORIZE_DURATION / 1000);

        if (!this.textBoundaries) break;

        const progress = Math.min(100, this.vaporizeProgress);
        const vaporizeX = this.direction === "left-to-right"
          ? this.textBoundaries.left + this.textBoundaries.width * progress / 100
          : this.textBoundaries.right - this.textBoundaries.width * progress / 100;

        const allVaporized = this.updateParticlesLogic(vaporizeX, deltaTime);
        this.drawParticles();

        if (this.vaporizeProgress >= 100 && allVaporized) {
          this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
          this.renderCanvas(); // create particles for the new word
          this.animationState = "fadingIn";
          this.fadeOpacity = 0;
        }
        break;
      }
      case "fadingIn": {
        this.fadeOpacity += deltaTime * 1000 / this.animationDurations.FADE_IN_DURATION;

        this.ctx.save();
        this.ctx.scale(this.globalDpr, this.globalDpr);
        this.particles.forEach(particle => {
          particle.x = particle.originalX;
          particle.y = particle.originalY;
          const opacity = Math.min(this.fadeOpacity, 1) * particle.originalAlpha;
          const color = particle.color.replace(/[\d.]+\)$/, `${opacity})`);
          this.ctx.fillStyle = color;
          this.ctx.fillRect(particle.x / this.globalDpr, particle.y / this.globalDpr, 1, 1);
        });
        this.ctx.restore();

        if (this.fadeOpacity >= 1) {
          this.animationState = "waiting";
          setTimeout(() => {
            this.animationState = "vaporizing";
            this.vaporizeProgress = 0;
            this.resetParticles();
          }, this.animationDurations.WAIT_DURATION);
        }
        break;
      }
      case "waiting": {
        this.drawParticles();
        break;
      }
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  startAnimation() {
    if (!this.animationFrameId) {
      this.lastTime = performance.now();
      this.animate(this.lastTime);
    }
  }

  destroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Make accessible globally
window.VapourTextCycle = VapourTextCycle;
