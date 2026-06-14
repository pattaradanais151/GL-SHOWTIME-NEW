import React from 'react';
import './MemorialPage.css';

const MemorialPage = ({ onEnterSite }) => {
  return (
    <div className="memorial-container">
      {/* Background Glow Effect */}
      <div className="memorial-glow"></div>

      {/* Glassmorphism Container */}
      <div className="memorial-content">
        
        {/* Black Ribbon Icon */}
        <div className="memorial-icon-wrapper">
          <svg 
            className="memorial-ribbon" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12,2C10.3,2,8.9,3.4,8.9,5.1c0,1.1,0.6,2.1,1.5,2.8L5.3,19.5c-0.4,0.8,0.1,1.7,1,1.7h0.9c0.5,0,1-0.3,1.2-0.8 L12,11.2l3.6,9.2c0.2,0.5,0.7,0.8,1.2,0.8h0.9c0.9,0,1.4-0.9,1-1.7l-5.1-11.6c0.9-0.7,1.5-1.7,1.5-2.8C15.1,3.4,13.7,2,12,2z M12,9.2 c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2c1.1,0,2,0.9,2,2C14,8.3,13.1,9.2,12,9.2z"/>
          </svg>
        </div>

        {/* Text Content */}
        <h1 className="memorial-text">
          น้อมสำนึกในพระมหากรุณาธิคุณอันหาที่สุดมิได้<br />
          และร่วมไว้อาลัยแด่<br />
          <span className="memorial-name">
            สมเด็จพระเจ้าลูกเธอ เจ้าฟ้าพัชรกิติยาภา นเรนทิราเทพยวดี<br />
            กรมหลวงราชสาริณีสิริพัชร มหาวัชรราชธิดา
          </span>
        </h1>

        <p className="memorial-footer-text">
          ข้าพระพุทธเจ้า คณะผู้บริหาร และทีมงาน FaemkunG Group TH
        </p>

        {/* Enter Website Button */}
        <button onClick={onEnterSite} className="memorial-btn">
          เข้าสู่เว็บไซต์
        </button>
      </div>
    </div>
  );
};

export default MemorialPage;