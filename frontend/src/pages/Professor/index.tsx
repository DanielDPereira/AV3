import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import professorImg from '../../assets/ligarAURA.png';
import './Professor.css';

const Professor: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="professor-page">
      {/* Elementos de Aura Lendária */}
      <div className="aura-particles">
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>
      
      <div className={`content-wrapper ${isVisible ? 'fade-in' : ''}`}>
        <div className="energy-ring"></div>
        <div className="crown-icon">👑</div>
        <div className="header-section">
          <div className="badge-top">A LENDA VIVA • O MITO • O ÚNICO</div>
          <h1 className="title">Gerson Penha Neto</h1>
          <p className="subtitle">Doutor Honoris Causa em Arquitetura de Software & Soberano Absoluto do Norte</p>
          <div className="medal-row">🏅 🏅 🏅</div>
        </div>

        <div className="image-container premium">
          <div className="glow-effect gold"></div>
          <div className="lightning-effect"></div>
          <img 
            src={professorImg} 
            alt="O Grande Mestre Gerson" 
            className="professor-img"
          />
        </div>

        <div className="skills-grid">
          <div className="skill-card" style={{ '--delay': '0.2s' } as any}>
            <span className="skill-icon">⚡</span>
            <span className="skill-text">Compilação Instantânea</span>
          </div>
          <div className="skill-card" style={{ '--delay': '0.4s' } as any}>
            <span className="skill-icon">🧠</span>
            <span className="skill-text">Lógica Inabalável</span>
          </div>
          <div className="skill-card" style={{ '--delay': '0.6s' } as any}>
            <span className="skill-icon">⚽</span>
            <span className="skill-text">DNA Bicolor</span>
          </div>
        </div>

        <div className="quote-section">
          <p>"Mestre não é quem ensina, mas quem de repente aprende a ensinar."</p>
          <span className="quote-author">— Homenagem de seus eternos aprendizes</span>
        </div>

        <div className="footer-section">
          <button onClick={() => navigate('/login')} className="back-button">
            Retornar ao Mundo dos Mortais
          </button>
          <div className="paysandu-badge">
            MAIOR QUE O MUNDO, MENOR APENAS QUE O PAYSANDU
          </div>
        </div>
      </div>
    </div>
  );
};

export default Professor;
