import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileImage } from 'lucide-react';

const FormPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    age: '',
    gender: '',
    anatomicalSite: ''
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setError('Please upload an image file.');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setFormData({ patientId: '', name: '', age: '', gender: '', anatomicalSite: '' });
    setImage(null);
    setImagePreview('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!image) {
      setError('Please upload an image first.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', image);
      uploadData.append('age', formData.age ? parseInt(formData.age, 10) : 0);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        body: uploadData,
      });

      if (!response.ok) throw new Error('Prediction failed. Is the API running?');
      
      const result = await response.json();
      
      navigate('/result', {
        state: {
          patient: formData,
          imagePreview,
          prediction: result
        }
      });
    } catch (err) {
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="split-layout">
      <div className="form-section">
        <h2>Fill Patient Detail</h2>
        
        <div className="form-group">
          <label>Patient ID</label>
          <input type="text" name="patientId" value={formData.patientId} onChange={handleInputChange} />
        </div>
        
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
        </div>
        
        <div className="form-group">
          <label>Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleInputChange} />
        </div>
        
        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleInputChange}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Anatomical Site</label>
          <select name="anatomicalSite" value={formData.anatomicalSite} onChange={handleInputChange}>
            <option value="">Select diagnosis location</option>
            <option value="head/neck">Head/Neck</option>
            <option value="upper extremity">Upper Extremity</option>
            <option value="lower extremity">Lower Extremity</option>
            <option value="torso">Torso</option>
            <option value="palms/soles">Palms/Soles</option>
            <option value="oral/genital">Oral/Genital</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>

      <div className="upload-section">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />
        
        <div 
          className={`upload-card ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className={`image-preview ${isLoading ? 'processing-image' : ''}`} />
          ) : (
            <>
              <UploadCloud className="upload-icon" />
              <h3>Upload skin lesion image</h3>
              <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Drag & drop or click to browse</p>
            </>
          )}
        </div>
        
        {error && (
          <p style={{color: 'var(--primary)', textAlign: 'center', marginTop: '1rem'}}>{error}</p>
        )}

        <div className="action-buttons" style={{ justifyContent: 'center', marginTop: '2rem', gap: '1rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'UPLOAD!'}
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            onClick={handleReset}
            disabled={isLoading}
          >
            RESET
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
