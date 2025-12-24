import React, { useRef } from 'react';
import { animate, withSpring, withTiming, useInView } from 'react-ui-animate';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  color: string;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 199,
    image: '🎧',
    color: '#3399ff',
  },
  { id: 2, name: 'Smart Watch', price: 299, image: '⌚', color: '#ff6b6b' },
  { id: 3, name: 'Laptop Stand', price: 79, image: '💻', color: '#51cf66' },
  { id: 4, name: 'Keyboard', price: 149, image: '⌨️', color: '#ffd43b' },
  { id: 5, name: 'Mouse', price: 59, image: '🖱️', color: '#845ef7' },
  { id: 6, name: 'Monitor', price: 399, image: '🖥️', color: '#20c997' },
];

const ProductCard: React.FC<{ product: Product; index: number }> = ({
  product,
  index,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.2 });

  return (
    <animate.div
      ref={ref}
      style={{
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        scale: 0.9,
        opacity: 0,
        translateY: 50,
      }}
      animate={{
        scale: inView ? withSpring(1, { stiffness: 200, damping: 20 }) : 0.9,
        opacity: inView ? withTiming(1, { duration: 400 }) : 0,
        translateY: inView
          ? withSpring(0, { stiffness: 200, damping: 20 })
          : 50,
      }}
      hover={{
        scale: withSpring(1.05, { stiffness: 300, damping: 20 }),
        translateY: withSpring(-8, { stiffness: 300, damping: 20 }),
      }}
      press={{
        scale: withSpring(0.98, { stiffness: 400, damping: 25 }),
      }}
    >
      <animate.div
        style={{
          width: '100%',
          height: 200,
          backgroundColor: `${product.color}15`,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 80,
          marginBottom: 20,
          scale: 1,
          rotate: 0,
        }}
        hover={{
          scale: withSpring(1.1, { stiffness: 300, damping: 20 }),
          rotate: withSpring(5, { stiffness: 200, damping: 15 }),
        }}
      >
        {product.image}
      </animate.div>

      <h3
        style={{
          margin: 0,
          marginBottom: 8,
          fontSize: 18,
          fontWeight: 600,
          color: '#1a1a1a',
        }}
      >
        {product.name}
      </h3>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <animate.span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: product.color,
          }}
        >
          ${product.price}
        </animate.span>

        <animate.button
          style={{
            padding: '10px 20px',
            backgroundColor: product.color,
            color: 'white',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            scale: 1,
          }}
          hover={{
            scale: withSpring(1.1, { stiffness: 300, damping: 20 }),
          }}
          press={{
            scale: withSpring(0.9, { stiffness: 400, damping: 25 }),
          }}
        >
          Add to Cart
        </animate.button>
      </div>
    </animate.div>
  );
};

const Example: React.FC = () => {
  return (
    <div
      style={{ padding: 40, backgroundColor: '#f5f5f5', minHeight: '100vh' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1
          style={{
            marginBottom: 8,
            fontSize: 32,
            fontWeight: 700,
            color: '#1a1a1a',
          }}
        >
          Product Showcase
        </h1>
        <p style={{ marginBottom: 40, fontSize: 16, color: '#666' }}>
          Scroll to see products animate into view
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Example;
