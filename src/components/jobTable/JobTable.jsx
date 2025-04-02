import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import './JobTable.less';

const { Option } = Select;

export const JobTable = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [jobType, setJobType] = useState('all');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        
        setTimeout(() => {
          const mockData = [
            {
              id: 1,
              title: '高级前端工程师',
              company: '江苏科技有限公司',
              location: '南京',
              salary: '25k-35k',
              experience: '3-5年',
              education: '本科及以上',
              type: '全职',
              tags: ['React', 'Vue', 'JavaScript'],
              postDate: '2024-03-15',
            },
            {
              id: 2,
              title: '人工智能研究员',
              company: '江苏智能科技研究院',
              location: '苏州',
              salary: '30k-50k',
              experience: '5-10年',
              education: '硕士及以上',
              type: '全职',
              tags: ['机器学习', 'Python', '深度学习'],
              postDate: '2024-03-18',
            },
            {
              id: 3,
              title: '数据分析师',
              company: '江苏大数据有限公司',
              location: '无锡',
              salary: '18k-25k',
              experience: '1-3年',
              education: '本科及以上',
              type: '全职',
              tags: ['SQL', 'Python', '数据可视化'],
              postDate: '2024-03-20',
            },
            {
              id: 4,
              title: '产品经理（实习）',
              company: '江苏互联网科技有限公司',
              location: '南京',
              salary: '6k-8k',
              experience: '应届毕业生',
              education: '本科及以上',
              type: '实习',
              tags: ['产品设计', '用户研究'],
              postDate: '2024-03-22',
            },
            {
              id: 5,
              title: '后端开发工程师',
              company: '江苏云计算有限公司',
              location: '常州',
              salary: '20k-30k',
              experience: '3-5年',
              education: '本科及以上',
              type: '全职',
              tags: ['Java', 'Spring Boot', '微服务'],
              postDate: '2024-03-25',
            },
          ];
          setJobs(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('获取职位数据失败:', error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSearch = value => {
    setSearchText(value);
  };

  const handleTypeChange = value => {
    setJobType(value);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchText.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = jobType === 'all' || job.type === jobType;
    return matchesSearch && matchesType;
  });

  const columns = [
    {
      title: '职位名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a className="job-title">{text}</a>
      ),
    },
    {
      title: '公司',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '薪资',
      dataIndex: 'salary',
      key: 'salary',
    },
    {
      title: '经验',
      dataIndex: 'experience',
      key: 'experience',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: type => (
        <Tag color={type === '全职' ? 'blue' : 'green'}>{type}</Tag>
      ),
    },
    {
      title: '发布日期',
      dataIndex: 'postDate',
      key: 'postDate',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small">申请</Button>
      ),
    },
  ];

  return (
    <div className="job-table-container">
      <div className="job-search">
        <Input 
          placeholder="搜索职位或公司" 
          prefix={<SearchOutlined />} 
          onChange={e => handleSearch(e.target.value)}
          style={{ width: 250, marginRight: 16 }}
        />
        <Select 
          defaultValue="all" 
          style={{ width: 120 }} 
          onChange={handleTypeChange}
        >
          <Option value="all">全部类型</Option>
          <Option value="全职">全职</Option>
          <Option value="实习">实习</Option>
        </Select>
      </div>
      <Table 
        columns={columns} 
        dataSource={filteredJobs} 
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        className="job-table"
      />
    </div>
  );
};
