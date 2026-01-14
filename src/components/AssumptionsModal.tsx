import React from 'react';
import './AssumptionsModal.css';

interface AssumptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssumptionsModal: React.FC<AssumptionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>📖 Model Assumptions & Equations</h2>
        
        <section className="modal-section">
          <h3>⚠️ Disclaimer</h3>
          <p>
            This is a <strong>toy model</strong> for educational entertainment purposes only.
            It is NOT a definitive biomechanics simulation. The scaling laws are simplified
            heuristics that capture general trends but ignore many real-world complexities.
          </p>
        </section>

        <section className="modal-section">
          <h3>🔬 Core Concept</h3>
          <p>
            Spiders face fundamental physical constraints that prevent them from growing
            to large sizes. This simulator models how these constraints become increasingly
            severe as body size increases, using simplified scaling laws.
          </p>
        </section>

        <section className="modal-section">
          <h3>📐 Primary Variables</h3>
          <ul>
            <li><strong>L</strong> = Body length (meters)</li>
            <li><strong>L₀</strong> = Baseline length for selected species</li>
            <li><strong>s = L / L₀</strong> = Scale factor</li>
            <li><strong>gMult</strong> = Gravity multiplier</li>
            <li><strong>O₂frac</strong> = Atmospheric oxygen fraction</li>
          </ul>
        </section>

        <section className="modal-section">
          <h3>📊 Derived Quantities</h3>
          <ul>
            <li><strong>Mass</strong> ∝ s³</li>
            <li><strong>Surface Area</strong> ∝ s²</li>
            <li><strong>Weight Factor (W)</strong> = s³ × gMult</li>
          </ul>
        </section>

        <section className="modal-section">
          <h3>🫁 Respiration Proxy</h3>
          <p>
            Spiders use book lungs for respiration. Oxygen diffuses passively, which
            becomes limiting at larger sizes because diffusion distance increases
            while relative surface area decreases.
          </p>
          <div className="equation">
            <strong>Simple:</strong> R<sub>cap</sub> = (O₂frac / 0.21) × (1 / s)
          </div>
          <div className="equation">
            <strong>Extended:</strong> R<sub>cap</sub> × [1 / (1 + k(s-1))]
          </div>
          <p className="note">where k ≈ 0.15 represents diffusion distance penalty</p>
        </section>

        <section className="modal-section">
          <h3>🦵 Hydraulic Actuation Proxy</h3>
          <p>
            Spiders extend their legs using hydraulic pressure rather than muscles.
            Larger spiders need more pressure to overcome increased weight, but
            pressure generation doesn't scale favorably.
          </p>
          <div className="equation">
            H<sub>cap</sub> = s<sup>β</sup> / W<sup>α</sup>
          </div>
          <p className="note">α ≈ 0.65, β = 0 (simple) or 0.3 (extended)</p>
        </section>

        <section className="modal-section">
          <h3>🦴 Exoskeleton Structural Proxy</h3>
          <p>
            Exoskeletons must support body weight. Stress on supporting structures
            increases with size because weight scales as volume (s³) while
            cross-sectional area scales as s².
          </p>
          <div className="equation">
            E<sub>cap</sub> = 1 / (s<sup>p</sup> × gMult)
          </div>
          <p className="note">p = 1 (simple) or 1.3 (extended)</p>
        </section>

        <section className="modal-section">
          <h3>🚶 Locomotion Proxy</h3>
          <p>
            Energy cost of movement increases unfavorably with size due to
            increased weight and reduced relative muscle cross-section.
          </p>
          <div className="equation">
            L<sub>cap</sub> = 1 / (s<sup>γ</sup> × gMult)
          </div>
          <p className="note">γ ≈ 0.85 (simple) or 1.1 (extended)</p>
        </section>

        <section className="modal-section">
          <h3>💯 Health Score Mapping</h3>
          <p><strong>Simple mode:</strong> Piecewise linear</p>
          <div className="equation">
            Health = 100 × clamp((proxy - 0.3) / 0.7, 0, 1)
          </div>
          
          <p><strong>Extended mode:</strong> Sigmoid</p>
          <div className="equation">
            Health = 100 × σ(8 × (proxy - 0.6))
          </div>
        </section>

        <section className="modal-section">
          <h3>📈 Viability Index</h3>
          <p>Weighted geometric mean of health scores:</p>
          <div className="equation">
            Viability = 100 × exp(Σ w<sub>i</sub> × ln(health<sub>i</sub>/100 + ε))
          </div>
          <p className="note">
            Weights: Respiration (35%), Exoskeleton (30%), Hydraulics (20%), Locomotion (15%)
          </p>
        </section>

        <section className="modal-section">
          <h3>🚨 Failure Thresholds</h3>
          <p>A failure mode triggers when proxy value drops below 0.35</p>
        </section>

        <section className="modal-section">
          <h3>📚 References & Inspiration</h3>
          <ul>
            <li>Haldane, J.B.S. "On Being the Right Size" (1926)</li>
            <li>Vogel, S. "Life in Moving Fluids" (1994)</li>
            <li>Foelix, R.F. "Biology of Spiders" (2011)</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
