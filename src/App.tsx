import { useEffect, useState } from 'react';

import { Table, PageHeader, Tooltip } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/lib/table';

import 'antd/dist/antd.min.css';
import { GithubOutlined, StarFilled } from '@ant-design/icons';

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

  function unitCapacity(capacity: number) {
    return capacity >= 1 ? `${capacity} TB` : `${capacity * 1000} GB`
  }

  function formatPrice(x?: number) {
    return x ? '\xa5' + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null;
  }

  type ShopName = 'amazonjp' | 'tsukumo' | 'sofmap' | 'pckoubou' | 'dospara';

  function priceColumn(title: string, shopName: ShopName): ColumnType<HDDEntry> {
    return {
      dataIndex: ['prices', shopName],
      title: title,
      render: (price, record) => {
        const isLowest = price === Math.min(...Object.values(record.prices).filter(price => price));
        return (
          <Tooltip title={isLowest ? 'lowest price' : ''}>
            <a
              href={record.links[shopName]}
              target='_blank'
              rel='noreferrer'
            >
              {formatPrice(price)} {isLowest ? <StarFilled /> : null}
            </a>
          </Tooltip>
        )
      }
    }
  }

  const columns: ColumnsType<HDDEntry> = [
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      filters: Array.from(new Set(rows.map(row => row.manufacturer))).map(value => {
        return {
          text: value,
          value: value
        };
      }),
      onFilter: (value, record) => record.manufacturer === value
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      filters: Array.from(new Set(rows.map(row => row.brand))).map(value => {
        return {
          text: value,
          value: value
        };
      }),
      onFilter: (value, record) => record.brand === value
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      filters: Array.from(new Set(rows.map(row => row.capacity))).sort().map(value => {
        return {
          text: unitCapacity(value),
          value: value
        };
      }),
      onFilter: (value, record) => record.capacity === value,
      render: (text, record) => unitCapacity(record.capacity)
    },
    {
      title: 'RPM',
      dataIndex: 'rpm',
      filters: Array.from(new Set(rows.map(row => row.rpm))).sort().map(value => {
        return {
          text: value,
          value: value
        };
      }),
      onFilter: (value, record) => record.rpm === value
    },
    {
      title: 'Record',
      dataIndex: 'record',
      filters: Array.from(new Set(rows.map(row => row.record))).map(value => {
        return {
          text: value,
          value: value
        };
      }),
      onFilter: (value, record) => record.record === value
    },
    {
      title: 'Cache',
      dataIndex: 'cache',
      render: (text, record) => `${record.cache} MB`,
      sorter: (a, b) => a.cache - b.cache
    },
    {
      title: 'Model',
      dataIndex: 'model',
    },
    {
      title: 'Prices',
      key: 'prices',
      sorter: (a, b) => {
        const aPrices = Object.values(a.prices).filter(price => price);
        const bPrices = Object.values(b.prices).filter(price => price);
        return Math.max(...aPrices) - Math.max(...bPrices);
      },
      filters: [
        {
          text: 'hide if no price data available',
          value: 'hide_no_price'
        }
      ],
      defaultFilteredValue: ['hide_no_price'],
      onFilter: (value, record) => Object.values(record.prices).filter(price => price).length !== 0,
      children: [
        priceColumn('Tsukumo', 'tsukumo'),
        priceColumn('Sofmap', 'sofmap'),
        priceColumn('PC-Koubou', 'pckoubou'),
        priceColumn('Dospara', 'dospara'),
      ]
    }
  ];

  return (
    <>
    <PageHeader
      title="HDD Price Tracker"
      backIcon={false}
      extra={[
        <a
          href="https://github.com/ikr7/hdd-price-tracker"
          key='github'
        >
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
      rowKey="id"
    />
  </>
  );
}

export default App;
