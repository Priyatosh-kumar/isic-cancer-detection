import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import heroImage from '../assets/hero-image.png';
import priyatoshImg from '../assets/priyatosh.jpeg';
import amanImg from '../assets/aman.jpeg';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <h1>Early Skin Cancer<br/>Detection</h1>
          <p>Facilitating early diagnosis through advanced CNN modeling and clinical safety protocols.</p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/tool')}>
            OPEN TOOL
          </button>
        </div>
        <div className="hero-visual">
          <img src={heroImage} alt="Dermatologist examining patient" className="hero-img" />
        </div>
      </section>

      {/* Info Section */}
      <section id="info" className="info-block alternate">
        <div className="info-content translucent-box" style={{ textAlign: 'left', maxWidth: '1000px' }}>
          <h2 style={{ marginBottom: '3rem' }}>Introduction and Background</h2>
          <p>
            Among all the skin cancer type, melanoma is the least common skin cancer, but it is responsible for 75% of death SIIM-ISIC Melanoma Classification, 2020. Being a less common skin cancer type but is spread very quickly to other body parts if not diagnosed early. The International Skin Imaging Collaboration (ISIC) is facilitating skin images to reduce melanoma mortality. Melanoma can be cured if diagnosed and treated in the early stages. Digital skin lesion images can be used to make a teledermatology automated diagnosis system that can support clinical decision.
          </p>
          <p style={{ marginTop: '1.5rem' }}>
            Currently, deep learning has revolutionised the future as it can solve complex problems. The motivation is to develop a solution that can help dermatologists better support their diagnostic accuracy by ensembling contextual images and patient-level information, reducing the variance of predictions from the model.
          </p>

          <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '4rem', marginBottom: '2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>The problem we tried to solve</h3>
          <p>
            The first step to identify whether the skin lesion is malignant or benign for a dermatologist is to do a skin biopsy. In the skin biopsy, the dermatologist takes some part of the skin lesion and examines it under the microscope. The current process takes almost a week or more, starting from getting a dermatologist appointment to getting a biopsy report. This project aims to shorten the current gap to just a couple of days by providing the predictive model using Computer-Aided Diagnosis (CAD). The approach uses Convolutional Neural Network (CNN) to classify nine types of skin cancer from outlier lesions images. This reduction of a gap has the opportunity to impact millions of people positively.
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section id="approach" className="info-block">
        <div className="info-content translucent-box" style={{ textAlign: 'left', maxWidth: '1000px' }}>
          <h2 className="section-title" style={{ marginBottom: '2rem' }}>Our Solution</h2>
          
          <p className="approach-text" style={{ marginBottom: '1.5rem' }}>
            Melanoma skin cancer is highly curable if it gets identified at the early stages. The first step of Melanoma skin cancer diagnosis is to conduct a visual examination of the skin's affected area. Dermatologists take the dermatoscopic images of the skin lesions by the high-speed camera, which have an accuracy of 65-80% in the melanoma diagnosis without any additional technical support. 
          </p>
          
          <p className="approach-text" style={{ marginBottom: '1.5rem' }}>
            With further visual examination by cancer treatment specialists and dermatoscopic images, the overall prediction rate of melanoma diagnosis raised to 75-84% accuracy. The project aims to build an automated classification system based on image processing techniques to classify melanoma skin cancer using skin lesions images. 
          </p>

          <p className="approach-text">
            The proposed system will be based on CNN (Convolutional Neural Network) to classify skin lesions as cancerous (melanoma) or non-cancerous (benign). It also considers patient-level contextual information to identify the cancer lesions' position in the affected area of the skin. The proposed solution may help dermatologists better support their diagnostic accuracy by ensembling contextual images and patient-level information, reducing the variance of predictions from the model.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section id="about" className="info-block alternate">
        <div className="info-content" style={{ maxWidth: '1000px', width: '100%' }}>
          <h2 className="section-title" style={{ marginBottom: '4rem', textAlign: 'center' }}>Meet Our Team</h2>
          
          <div className="team-grid">
            {/* Priyatosh */}
            <div className="team-card">
              <div className="team-member-ring">
                <img src={priyatoshImg} alt="Priyatosh Kumar" className="team-member-img" />
              </div>
              <h3 className="team-name">Priyatosh Kumar</h3>
              <p className="team-role">Data Engineering & Backend</p>
              <p className="team-desc" style={{ maxWidth: '300px', margin: '0 auto', lineHeight: '1.6' }}>
                Also worked on skin cancer detection using Convolutional Neural Network (CNN) architecture for skin lesion classification and detection.
              </p>
            </div>

            {/* Aman */}
            <div className="team-card">
              <div className="team-member-ring">
                <img src={amanImg} alt="Aman Kumar Gupta" className="team-member-img" />
              </div>
              <h3 className="team-name">Aman Kumar Gupta</h3>
              <p className="team-role">Data Curation & Frontend</p>
              <p className="team-desc" style={{ maxWidth: '300px', margin: '0 auto', lineHeight: '1.6' }}>
                Also worked on skin cancer detection using Vision Transformer (ViT), developed for advanced medical image analysis.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="footer">
        <p>Thanks for visiting!</p>
      </footer>
    </div>
  );
};

export default HomePage;
