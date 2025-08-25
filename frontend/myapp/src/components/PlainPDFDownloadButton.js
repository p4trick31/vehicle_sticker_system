// components/PlainPDFDownloadButton.js
import React from 'react';
import jsPDF from 'jspdf';

const buttonStyle = {
  backgroundColor: '#ffffff',
  color: '#065f46',
  border: '1px solid #065f46',
  borderRadius: '5px',
  padding: '10px 20px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.3s',
};

const PlainPDFDownloadButton = ({ applicationData }) => {
  const generatePlainPDF = () => {
    if (!applicationData) return;

    const pdf = new jsPDF();
    pdf.setFontSize(12);
    pdf.text('DEBESMSCAT', 10, 10);
    pdf.text('PRODUCTION AND COMMERCIALIZATION', 10, 18);
    pdf.text('Cabitan, Mandaon, Masbate', 10, 26);
    pdf.text('www.debesmscat.edu.ph', 10, 34);
    pdf.text('(DEBESMSCAT Vehicle Pass)', 10, 42);

    pdf.setFontSize(14);
    pdf.setTextColor(220, 38, 38);
    pdf.text('Temporary Gate Pass', 10, 55);

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text('This temporary gate pass is issued after completing the online vehicle sticker application.', 10, 65);
    pdf.text('It is valid only until the official sticker is claimed.', 10, 72);

    pdf.setFontSize(12);
    pdf.text(`Application No: ${applicationData.applicationNo}`, 10, 90);
    pdf.text(`Name: ${applicationData.name}`, 10, 100);
    pdf.text(`O.R. No./Date: ${applicationData.orNoDate}`, 10, 110);

    pdf.line(10, 130, 100, 130);
    pdf.text('Authorized Signature', 10, 135);

    pdf.line(120, 130, 200, 130);
    pdf.text('Date Issued', 120, 135);

    pdf.setFontSize(10);
    pdf.text('Form Code: FM-SS-03', 10, 155);
    pdf.text('Version: 0.1', 80, 155);
    pdf.text('Effective: 4/24/2017', 140, 155);

    pdf.save('application-form-plain.pdf');
  };

  return (
    <button onClick={generatePlainPDF} style={buttonStyle}>
      Download Form (Plain)
    </button>
  );
};

export default PlainPDFDownloadButton;
