import { useEffect, useState } from 'react';

import { Table, PageHeader } from 'antd';
import type { ColumnsType } from 'antd/lib/table';

import 'antd/dist/antd.css';
import { GithubOutlined } from '@ant-design/icons';

type HDDEntry = {
  id: number;
  manufacturer: string;
  brand: string;
  capacity: number;
  rpm: number;
  record: string;
  cache: number;
  model: string;
  links: {
    amazonjp?: string;
    tsukumo?: string;
    sofmap?: string;
    pckoubou?: string;
    dospara?: string;
  };
  prices: {
    amazonjp?: number;
    tsukumo?: number;
    sofmap?: number;
    pckoubou?: number;
    dospara?: number;
  };
};

function App() {

  const [rows, setRows] = useState<HDDEntry[]>([]);

  useEffect(() => {
    (async () => {
      const history = await(await fetch('./history.json')).json() as string[];
      const data = await (await fetch(`data/${history[history.length - 1]}`)).json() as HDDEntry[];
      setRows(data);
    })();
  }, []);

  const columns: ColumnsType<HDDEntry> = [
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer'
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand'
    },
    {
      title: 'capacity',
      dataIndex: 'capacity',
      key: 'capacity'
    },
    {
      title: 'rpm',
      dataIndex: 'rpm',
      key: 'rpm'
    },
    {
      title: 'record',
      dataIndex: 'record',
      key: 'record'
    },
    {
      title: 'cache',
      dataIndex: 'cache',
      key: 'cache'
    },
    {
      title: 'model',
      dataIndex: 'model',
      key: 'model'
    },
    {
      dataIndex: ['prices', 'tsukumo'],
      title: 'tsukumoPrice',
      key: 'tsukumoPrice',
      render: (price, row) => {
        return (
          <a
            href={row.links.tsukumo}
            target='_blank'
            rel='noreferrer'
          >
              {price}
          </a>
        )
      }
    },
    {
      dataIndex: ['prices', 'sofmap'],
      title: 'sofmapPrice',
      key: 'sofmapPrice',
      render: (price, row) => {
        return (
          <a
            href={row.links.sofmap}
            target='_blank'
            rel='noreferrer'
          >
              {price}
          </a>
        )
      }
    },
    {
      dataIndex: ['prices', 'pckoubou'],
      title: 'pckoubouPrice',
      key: 'pckoubouPrice',
      render: (price, row) => {
        return (
          <a
            href={row.links.pckoubou}
            target='_blank'
            rel='noreferrer'
          >
              {price}
          </a>
        )
      }
    },
    {
      dataIndex: ['prices', 'dospara'],
      title: 'dosparaPrice',
      key: 'dosparaPrice',
      render: (price, row) => {
        return (
          <a
            href={row.links.dospara}
            target='_blank'
            rel='noreferrer'
          >
              {price}
          </a>
        )
      }
    },
  ];

  return (
    <>
    <PageHeader
      title="HDD Price Tracker"
      backIcon={false}
      extra={[
        <a href="https://github.com/ikr7/hdd-price-tracker">
          <GithubOutlined />
        </a>
      ]}
    />
    <Table
      columns={columns}
      dataSource={rows}
      size="small"
      pagination={{
        pageSize: 1000,
        position: []
      }}
    />
  </>
  );
}

export default App;
