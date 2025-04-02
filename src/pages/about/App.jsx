import React from 'react';
import { Layout, Form, Input, Select, Button, DatePicker, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Navigation } from '../../components/navigation/Navigation';
import { Footer } from '../../components/footer/Footer';
import './index.less';

const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

export const App = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values:', values);
    message.success('报名信息提交成功！');
    form.resetFields();
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Layout className="layout">
      <Navigation />
      <Content>
        <div className="page-header">
          <div className="page-title-container">
            <h1 className="page-title">专项报名</h1>
            <div className="page-subtitle">百名海外博士江苏行 - 2024招募计划</div>
          </div>
        </div>
        
        <div className="site-content">
          <div className="program-info">
            <h2 className="section-title">项目介绍</h2>
            <div className="program-content">
              <p>"百名海外博士江苏行"由江苏省人力资源和社会保障厅主办，自2006年以来已连续举办18届，活动旨在为海外高层次人才创造与江苏用人单位面对面交流的平台，搭建海外高层次人才来苏创新创业的桥梁。</p>
              <p>本次活动将邀请100名海外博士来江苏参观考察，与企业进行面对面交流，了解江苏的发展环境和人才政策，促进人才与企业的精准对接。</p>
            </div>
          </div>
          
          <div className="application-form">
            <h2 className="section-title">报名表单</h2>
            <Form
              form={form}
              name="programApplication"
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ residence: ['中国'] }}
              scrollToFirstError
            >
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
              
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select placeholder="请选择性别">
                  <Option value="male">男</Option>
                  <Option value="female">女</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="birth"
                label="出生日期"
                rules={[{ required: true, message: '请选择出生日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择出生日期" />
              </Form.Item>
              
              <Form.Item
                name="education"
                label="学历"
                rules={[{ required: true, message: '请选择学历' }]}
              >
                <Select placeholder="请选择学历">
                  <Option value="doctor">博士</Option>
                  <Option value="master">硕士</Option>
                  <Option value="bachelor">学士</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="major"
                label="专业"
                rules={[{ required: true, message: '请输入专业' }]}
              >
                <Input placeholder="请输入专业" />
              </Form.Item>
              
              <Form.Item
                name="university"
                label="毕业院校"
                rules={[{ required: true, message: '请输入毕业院校' }]}
              >
                <Input placeholder="请输入毕业院校" />
              </Form.Item>
              
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="电子邮箱"
                rules={[
                  { required: true, message: '请输入电子邮箱' },
                  { type: 'email', message: '请输入有效的电子邮箱' }
                ]}
              >
                <Input placeholder="请输入电子邮箱" />
              </Form.Item>
              
              <Form.Item
                name="residence"
                label="现居地"
                rules={[{ required: true, message: '请选择现居地' }]}
              >
                <Select placeholder="请选择现居地">
                  <Option value="中国">中国</Option>
                  <Option value="美国">美国</Option>
                  <Option value="英国">英国</Option>
                  <Option value="日本">日本</Option>
                  <Option value="德国">德国</Option>
                  <Option value="法国">法国</Option>
                  <Option value="加拿大">加拿大</Option>
                  <Option value="澳大利亚">澳大利亚</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="research"
                label="研究方向"
                rules={[{ required: true, message: '请输入研究方向' }]}
              >
                <TextArea rows={4} placeholder="请简要描述您的研究方向" />
              </Form.Item>
              
              <Form.Item
                name="resume"
                label="个人简历"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: true, message: '请上传个人简历' }]}
              >
                <Upload name="resume" action="/upload.do" listType="text">
                  <Button icon={<UploadOutlined />}>上传简历（PDF格式）</Button>
                </Upload>
              </Form.Item>
              
              <Form.Item
                name="intention"
                label="求职意向"
                rules={[{ required: true, message: '请输入求职意向' }]}
              >
                <TextArea rows={4} placeholder="请简要描述您的求职意向，包括期望职位、行业、地区等" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" className="submit-button">
                  提交申请
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default App;
