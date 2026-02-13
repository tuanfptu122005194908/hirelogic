import { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  swayAmplitude: number;
  swaySpeed: number;
  swayOffset: number;
}

export const SakuraPetals = ({ count = 30 }: { count?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize petals
    petalsRef.current = Array.from({ length: count }, () => createPetal(canvas.width, canvas.height, true));

    function createPetal(w: number, h: number, randomY = false): Petal {
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -20,
        size: 8 + Math.random() * 14,
        speedY: 0.4 + Math.random() * 1.2,
        speedX: -0.3 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        opacity: 0.3 + Math.random() * 0.5,
        swayAmplitude: 30 + Math.random() * 60,
        swaySpeed: 0.005 + Math.random() * 0.01,
        swayOffset: Math.random() * Math.PI * 2,
      };
    }

    function drawPetal(ctx: CanvasRenderingContext2D, p: Petal, time: number) {
      ctx.save();
      const swayX = Math.sin(time * p.swaySpeed + p.swayOffset) * p.swayAmplitude * 0.02;
      ctx.translate(p.x + swayX, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      // Draw petal shape
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 0.3, -s * 0.4, s * 0.7, -s * 0.4, s, 0);
      ctx.bezierCurveTo(s * 0.7, s * 0.2, s * 0.3, s * 0.2, 0, 0);
      ctx.closePath();

      // Gradient fill
      const grad = ctx.createLinearGradient(0, -s * 0.3, s, s * 0.2);
      grad.addColorStop(0, 'rgba(255, 192, 203, 1)');
      grad.addColorStop(0.5, 'rgba(255, 182, 193, 0.9)');
      grad.addColorStop(1, 'rgba(255, 218, 225, 0.7)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Subtle outline
      ctx.strokeStyle = 'rgba(255, 150, 170, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    }

    let time = 0;
    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time++;

      petalsRef.current.forEach((p, i) => {
        // Update position
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(time * p.swaySpeed + p.swayOffset) * 0.5;
        p.rotation += p.rotationSpeed;

        // Reset if off screen
        if (p.y > canvas.height + 20 || p.x < -50 || p.x > canvas.width + 50) {
          petalsRef.current[i] = createPetal(canvas.width, canvas.height, false);
        }

        drawPetal(ctx, p, time);
      });

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};
