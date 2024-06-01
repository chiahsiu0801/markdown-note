import { useEffect, useRef, useState } from 'react';

const FadeInSection = ({ children }: { children: React.ReactElement }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // observer.unobserve(entry.target);
        } else {
          setIsVisible(false);
        }
      });
    });

    if(domRef.current) {
      observer.observe(domRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`${isVisible ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-[20vh] invisible'}`}
      style={{
        transition: 'opacity 0.6s ease-out, transform 1.2s ease-out',
      }}
      ref={domRef}
    >
      {children}
    </div>
  );
};

export default FadeInSection;
