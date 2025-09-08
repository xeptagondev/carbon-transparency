import { Col, Divider, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import sliderLogo from '../../Assets/Images/mrvlogo.svg';
import './layout.footer.scss';
import { CcCircle } from 'react-bootstrap-icons';
import footlogo from '../../Assets/Images/KoreanMinistryLogoWhite.png';
import footlogo2 from '../../Assets/Images/KiudaDoubleLogo2.png';

const LayoutFooter = () => {
  const { t } = useTranslation(['common', 'homepage']);

  return (
    <div className="homepage-footer-container">
      <Row>
        <Col md={24} lg={24}>
          <div className="logocontainer">
            <div className="logo">
              <img src={footlogo} alt="slider-logo" />
            </div>
            <div className="footerLogoRight">
              <div className="title">
                <span>Powered by</span>
              </div>
              <div className="logo2">
                <img src={footlogo2} alt="slider-logo" />
              </div>
            </div>

            {/* <div className="logo-text">
              <div style={{ display: "flex" }}>
                <div className="title">
                  {"IMPACT"} <span>REGISTRY</span>
                </div> */}
            {/* <div className="title-sub">{'REGISTRY'}</div> */}
            {/* </div>
              <div className="footer-country-name">{countryName}</div>
            </div> */}
          </div>
        </Col>
      </Row>
      <Divider className="divider" style={{ backgroundColor: '#FFFF' }} />
      <Row>
        <Col md={24} lg={12}>
          <div className="footertext">Transparent Climate Action for a Sustainable Future</div>
        </Col>
        <Col md={24} lg={12}>
          <div className="footertext2">System is based on UNDP ETF Framework.</div>
        </Col>
      </Row>
    </div>
  );
};

export default LayoutFooter;
