import { Layout } from 'antd';
import { Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Loading } from '../Loading/loading';
import LayoutFooter from '../Footer/layout.footer';
import sliderLogo from '../../Assets/Images/mrvlogo.svg';
import './infoLayout.scss';

const { Content } = Layout;

const InfoLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="info-layout-container">
      <div className="header-container">
        <div className="logo" onClick={() => navigate('/')}>
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
      <Content>
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </Content>
      <div>
        <LayoutFooter />
      </div>
    </div>
  );
};

export default InfoLayout;
