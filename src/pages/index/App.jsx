import React from 'react';
import { Layout } from 'antd';
import { Navigation } from '../../components/navigation/Navigation';
import { Banner } from '../../components/banner/Banner';
import { Footer } from '../../components/footer/Footer';
import './index.less';

const { Content } = Layout;

export const App = () => {
  return (
    <Layout className="layout">
      <Navigation />
      <Content>
        <Banner />
        <div className="site-content">
          <div className="jiangsu-overview">
            <h2 className="section-title">江苏概况</h2>
            <div className="overview-content">
              <div className="overview-text">
                <p>江苏作为"一带一路"、长江经济带、长三角一体化等多个国家重大战略的交汇点，具有良好的区位优势和先进的产业基础。江苏占全国1%的土地，6%的人口，创造了10%的经济总量，全省13个设区市全部进入全国百强市，25个县市进入全国百强县，其中5个进入前10，创造了多项"第一"。2023年，制造业增加值达4.66万亿元，约占全国的14.1%，全省规上工业产值增长12.5%；制造业产业链总体上接近上中下游全链条，49.9%、41.3%、10个先进制造业集群列入国家3个梯队的产业集群入选"国家队"，7个产业总体规模位居全国前3，制造业高质量发展指数位居全国第一，两化融合发展水平全国第一，拥有高新技术企业1.5万家，其中独角兽企业数量达116人，高校院所人才资源丰富，高层次人才聚集，国家实验室等科研平台入选人数全省"高精尖缺"人才入选1710人。</p>
              </div>
              <div className="overview-image">
                {/* 这里可以放置江苏概况的图片 */}
              </div>
            </div>
          </div>
          
          <div className="activities-intro">
            <h2 className="section-title">活动介绍</h2>
            <div className="activities-content">
              <p>"百名海外博士江苏行"由江苏省人力资源和社会保障厅主办，自2006年以来已连续举办18届，活动旨在为海外高层次人才创造与江苏用人单位面对面交流的平台，搭建海外高层次人才来苏创新创业的桥梁。海外英才荟萃，海内外英才汇聚的盛会。</p>
            </div>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default App;
