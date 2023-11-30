import { Button, Col, Divider, Form, Input, message, Row, Select, Statistic } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import sliderLogo from '../../Assets/Images/mrvlogo.svg';
import LayoutFooter from '../../Components/Footer/layout.footer';
import './help.scss';
import { CcCircle } from 'react-bootstrap-icons';
const CarbonHelp = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('i18nextLng')!.length > 2) {
      i18next.changeLanguage('en');
    }
  }, []);
  return (
    <div className="code-container">
      <Row>
        <Col md={24} lg={24}>
          <div onClick={() => navigate('/')} className="code-header-container">
            <div className="logo">
              <img src={sliderLogo} alt="slider-logo" />
            </div>
            <div>
              <div style={{ display: 'flex' }}>
                <div className="title">{'TRANSPARENCY'}</div>
                <div className="title-sub">{'SYSTEM'}</div>
              </div>
              <div className="country-name">{process.env.REACT_APP_COUNTRY_NAME || 'CountryX'}</div>
            </div>
          </div>
        </Col>
      </Row>
      <h1>Help Page</h1>
      <div className="footer-container">
        <LayoutFooter />
      </div>
    </div>
  );
};
export default CarbonHelp;
