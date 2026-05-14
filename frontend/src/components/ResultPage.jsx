import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const classMap = {
  "akiec": "Actinic keratosis",
  "bcc": "Basal cell carcinoma",
  "bkl": "Benign keratosis",
  "df": "Dermatofibroma",
  "mel": "Melanoma",
  "nv": "Melanocytic nevus",
  "vasc": "Vascular lesion",
  "scc": "Squamous cell carcinoma",
  "unk": "Unknown"
};

const classColors = {
  "Actinic keratosis": "#145c43",
  "Basal cell carcinoma": "#197c58",
  "Benign keratosis": "#1e9d6d",
  "Dermatofibroma": "#24c082",
  "Melanoma": "#2be39a",
  "Melanocytic nevus": "#55e9ad",
  "Squamous cell carcinoma": "#80f0c1",
  "Unknown": "#abf6d5",
  "Vascular lesion": "#d5fbea"
};

const apiClasses = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc", "scc", "unk"];

const CustomXAxisTick = ({ x, y, payload }) => {
  const name = payload.value;
  let lines = [name];
  if (name === "Basal cell carcinoma" || name === "Squamous cell carcinoma") {
    lines = [name.replace(" carcinoma", ""), "carcinoma"];
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#888888" fontSize="11">
        {lines.map((line, index) => (
          <tspan x="0" dy={index === 0 ? 0 : 14} key={index}>{line}</tspan>
        ))}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#202022', border: '1px solid #333333', padding: '5px 10px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#ffffff' }}>
          <span style={{ color: payload[0].payload.fill }}>{label}</span>: <span style={{ fontWeight: 600 }}>{`${(payload[0].value * 100).toFixed(0)} %`}</span>
        </p>
      </div>
    );
  }
  return null;
};

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const { patient, prediction } = location.state || {};

  if (!patient || !prediction) {
    return (
      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h2>No data available.</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>
          Go Back
        </button>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    const downloadSection = element.querySelector('.download-section');
    const infoPanel = element.querySelector('.info-panel');

    // Temporarily adjust layout for PDF capture
    if (downloadSection) downloadSection.style.display = 'none';
    if (infoPanel) infoPanel.style.gridTemplateColumns = '1fr';

    const opt = {
      margin:       0.5,
      filename:     `Report_${patient.patientId || 'patient'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf().set(opt).from(element).save();

    // Restore original layout after PDF is generated
    if (downloadSection) downloadSection.style.display = 'flex';
    if (infoPanel) infoPanel.style.gridTemplateColumns = '1fr 1fr';
  };

  const chartData = apiClasses.map((code, index) => {
    return {
      name: classMap[code],
      probability: prediction.all_probabilities[0][index],
      fill: classColors[classMap[code]]
    }
  });

  chartData.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="dashboard-container" ref={reportRef}>
      <div className="info-panel">
        <div className="info-section">
          <h2>Patient Detail</h2>
          <table className="detail-table">
            <tbody>
              <tr>
                <td className="label">Patient ID:</td>
                <td className="value">{patient.patientId || 'ISIC 2029'}</td>
              </tr>
              <tr>
                <td className="label">Name:</td>
                <td className="value">{patient.name || 'John Doe'}</td>
              </tr>
              <tr>
                <td className="label">Age:</td>
                <td className="value">{patient.age || '45'}</td>
              </tr>
              <tr>
                <td className="label">Gender:</td>
                <td className="value">{patient.gender || 'Male'}</td>
              </tr>
              <tr>
                <td className="label">Anatomical Site:</td>
                <td className="value">{patient.anatomicalSite || 'Upper Extremity'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="info-section download-section">
          <h2>Download Result</h2>
          <button className="btn-generate" onClick={handleDownloadPDF} data-html2canvas-ignore>
            GENERATE PDF
          </button>
        </div>
      </div>

      {prediction.evaluation && prediction.evaluation.generated_advice && prediction.evaluation.generated_advice.length > 0 && (
        <div style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#202022', borderLeft: '4px solid #ffffff', borderRadius: '0px', pageBreakInside: 'avoid', borderTop: '1px solid #333', borderRight: '1px solid #333', borderBottom: '1px solid #333' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '0.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Clinical Recommendation</h3>
          <ul style={{ color: '#888888', marginLeft: '1.5rem', lineHeight: '1.5', marginTop: '1rem' }}>
            {prediction.evaluation.generated_advice.map((advice, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{advice}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="chart-section" style={{ pageBreakInside: 'avoid' }}>
        <h2>Model Prediction</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={<CustomXAxisTick />} 
                tickMargin={10} 
                interval={0} 
              />
              <YAxis 
                label={{ value: 'Probability', angle: -90, position: 'insideLeft', style: { fill: '#888888', fontSize: 16 } }} 
                domain={[0, 0.6]} 
                ticks={[0, 0.2, 0.4, 0.6]} 
                tick={{ fontSize: 12, fill: '#888888' }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="probability" maxBarSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
