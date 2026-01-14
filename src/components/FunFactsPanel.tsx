import React, { useState, useEffect, useMemo } from 'react';
import { ModelOutput } from '../model';
import './FunFactsPanel.css';

interface FunFactsPanelProps {
  modelOutput: ModelOutput;
  bodyLength: number;
}

interface Fact {
  icon: string;
  category: string;
  title: string;
  detail: string;
  relevantWhen?: (output: ModelOutput, length: number) => boolean;
}

const ALL_FACTS: Fact[] = [
  // Respiration facts
  {
    icon: '🫁',
    category: 'Respiration',
    title: 'Book Lungs',
    detail: 'Spiders breathe through "book lungs" - stacked plates like pages in a book. Oxygen passively diffuses across these thin membranes.',
  },
  {
    icon: '🔬',
    category: 'Respiration',
    title: 'Diffusion Limit',
    detail: 'Oxygen can only diffuse effectively through ~1mm of tissue. Larger animals need circulatory systems to transport oxygen internally.',
    relevantWhen: (_, length) => length > 0.03,
  },
  {
    icon: '📉',
    category: 'Respiration',
    title: 'Square-Cube Law',
    detail: 'As size doubles, surface area (for breathing) increases 4×, but volume (needing oxygen) increases 8×. This is why giant insects can\'t exist!',
    relevantWhen: (output) => output.health.respiration < 80,
  },
  {
    icon: '🦠',
    category: 'Respiration',
    title: 'Tracheal System',
    detail: 'Some spiders also have tracheae - tiny tubes bringing air directly to tissues. This is more efficient than book lungs alone.',
  },

  // Hydraulics facts
  {
    icon: '💧',
    category: 'Hydraulics',
    title: 'No Extensor Muscles',
    detail: 'Spider legs have NO muscles to extend them! They use hydraulic pressure (60-100 mmHg) from hemolymph fluid to push legs outward.',
  },
  {
    icon: '🕸️',
    category: 'Hydraulics',
    title: 'Jumping Power',
    detail: 'Jumping spiders can leap 50× their body length by rapidly increasing hemolymph pressure in their legs. That\'s like you jumping a football field!',
  },
  {
    icon: '💀',
    category: 'Hydraulics',
    title: 'Death Curl',
    detail: 'When spiders die, their legs curl inward - this is because the hydraulic pressure is lost and flexor muscles pull the legs in.',
    relevantWhen: (output) => output.health.hydraulics < 50,
  },
  {
    icon: '⬆️',
    category: 'Hydraulics',
    title: 'Pressure Scaling',
    detail: 'Pressure needed to extend legs scales with leg length. Giant spiders would need dangerously high blood pressure!',
    relevantWhen: (_, length) => length > 0.05,
  },

  // Exoskeleton facts
  {
    icon: '🛡️',
    category: 'Exoskeleton',
    title: 'Chitin Armor',
    detail: 'Spider exoskeletons are made of chitin and proteins, with tensile strength around 100 MPa - similar to aluminum!',
  },
  {
    icon: '📐',
    category: 'Exoskeleton',
    title: 'Buckling Risk',
    detail: 'Long, thin exoskeleton segments can buckle under their own weight, just like a soda can under your foot.',
    relevantWhen: (output) => output.health.exoskeleton < 70,
  },
  {
    icon: '🔄',
    category: 'Exoskeleton',
    title: 'Molting',
    detail: 'Spiders must molt to grow, shedding their entire exoskeleton. During this time they\'re extremely vulnerable.',
  },
  {
    icon: '⚖️',
    category: 'Exoskeleton',
    title: 'Weight Problem',
    detail: 'At larger sizes, the exoskeleton would need to be proportionally thicker, eventually making up most of the spider\'s weight.',
    relevantWhen: (_, length) => length > 0.1,
  },

  // Locomotion facts
  {
    icon: '🏃',
    category: 'Locomotion',
    title: 'Energy Efficiency',
    detail: 'Small animals use less energy per step than large ones - but they need more steps to cover the same distance!',
  },
  {
    icon: '📊',
    category: 'Locomotion',
    title: 'Kleiber\'s Law',
    detail: 'Metabolic rate scales with body mass^0.75. A 10× heavier animal only needs ~5.6× more energy, not 10×.',
  },
  {
    icon: '🦵',
    category: 'Locomotion',
    title: 'Eight Legs',
    detail: 'Having 8 legs gives spiders excellent stability and redundancy - they can lose several legs and still walk!',
  },
  {
    icon: '⚡',
    category: 'Locomotion',
    title: 'Speed vs Size',
    detail: 'Larger animals generally move faster in absolute terms, but smaller animals are faster relative to their body size.',
    relevantWhen: (output) => output.health.locomotion < 80,
  },

  // General biology
  {
    icon: '❄️',
    category: 'Biology',
    title: 'Cold-Blooded',
    detail: 'Spiders are ectothermic - they rely on environmental heat. This limits their activity in cold conditions.',
  },
  {
    icon: '👁️',
    category: 'Biology',
    title: 'Eight Eyes',
    detail: 'Most spiders have 8 simple eyes arranged in patterns unique to each family. Some have excellent vision!',
  },
  {
    icon: '🩸',
    category: 'Biology',
    title: 'Blue Blood',
    detail: 'Spider blood (hemolymph) uses copper-based hemocyanin instead of iron-based hemoglobin, making it blue when oxygenated.',
  },
  {
    icon: '🧠',
    category: 'Biology',
    title: 'Brain Overflow',
    detail: 'Small spiders\' brains can be so large relative to their bodies that they overflow into their legs!',
    relevantWhen: (_, length) => length < 0.005,
  },
];

export const FunFactsPanel: React.FC<FunFactsPanelProps> = ({ modelOutput, bodyLength }) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Filter to relevant facts based on current state
  const relevantFacts = useMemo(() => {
    return ALL_FACTS.filter(fact => 
      !fact.relevantWhen || fact.relevantWhen(modelOutput, bodyLength)
    );
  }, [modelOutput, bodyLength]);

  // Auto-rotate facts every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentFactIndex(prev => (prev + 1) % relevantFacts.length);
        setIsTransitioning(false);
      }, 300);
    }, 10000);

    return () => clearInterval(interval);
  }, [relevantFacts.length]);

  // Reset index if it's out of bounds
  useEffect(() => {
    if (currentFactIndex >= relevantFacts.length) {
      setCurrentFactIndex(0);
    }
  }, [currentFactIndex, relevantFacts.length]);

  const currentFact = relevantFacts[currentFactIndex] || ALL_FACTS[0];

  const nextFact = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentFactIndex(prev => (prev + 1) % relevantFacts.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevFact = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentFactIndex(prev => (prev - 1 + relevantFacts.length) % relevantFacts.length);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="fun-facts-panel">
      <div className="facts-header">
        <span className="facts-icon">🔬</span>
        <h3>Did You Know?</h3>
        <span className="fact-counter">{currentFactIndex + 1}/{relevantFacts.length}</span>
      </div>
      
      <div className={`fact-content ${isTransitioning ? 'transitioning' : ''}`}>
        <div className="fact-category">
          <span className="category-icon">{currentFact.icon}</span>
          <span className="category-name">{currentFact.category}</span>
        </div>
        <h4 className="fact-title">{currentFact.title}</h4>
        <p className="fact-detail">{currentFact.detail}</p>
      </div>
      
      <div className="fact-navigation">
        <button className="nav-button" onClick={prevFact} aria-label="Previous fact">
          ←
        </button>
        <div className="fact-dots">
          {relevantFacts.slice(0, 5).map((_, idx) => (
            <span 
              key={idx} 
              className={`dot ${idx === currentFactIndex % 5 ? 'active' : ''}`}
            />
          ))}
          {relevantFacts.length > 5 && <span className="dot-more">+{relevantFacts.length - 5}</span>}
        </div>
        <button className="nav-button" onClick={nextFact} aria-label="Next fact">
          →
        </button>
      </div>
    </div>
  );
};
