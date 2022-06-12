import React, { useEffect, useState } from 'react';

import { Table, PageHeader, Tooltip, Button, Modal } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/lib/table';

import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Legend, Tooltip as RechartTooltip } from 'recharts';

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
  pricePerTB: number;
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

type ShopNames = 'amazonjp' | 'tsukumo' | 'sofmap' | 'pckoubou' | 'dospara';

function App() {

  const [rows, setRows] = useState<HDDEntry[]>([]);
  const [filenames, setFilenames] = useState<string[]>([]);
  const [history, setHistory] = useState<HDDEntry[][]>([]);
  const [activePriceData, setActivePriceData] = useState<{ [shopName in ShopNames]?: number }[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    (async () => {

      const fetchedFilenames = await(await fetch('./history.json')).json() as string[];

      setFilenames(fetchedFilenames);

      const responses = await Promise.all(fetchedFilenames.map(filename => {
        return fetch(`data/${filename}`);
      }));

      const fetchedHistory = await Promise.all(responses.map(response => response.json())) as HDDEntry[][];

      setHistory(fetchedHistory);
      setRows(fetchedHistory[fetchedHistory.length - 1].map(hddEntry => Object.assign(hddEntry, { pricePerTB: computePricePerTB(hddEntry) })));

    })();
  }, []);

  function unitCapacity(capacity: number) {
    return capacity >= 1 ? `${capacity} TB` : `${capacity * 1000} GB`
  }

  function formatPrice(x?: number) {
    return x ? '\xa5' + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : null;
  }

  function priceColumn(title: string, shopName: ShopNames): ColumnType<HDDEntry> {
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

  function computePricePerTB(record: HDDEntry) {
    const prices = Object.values(record.prices).filter(price => price);
    const sum = prices.reduce((e, c) => e + c, 0);
   return Math.round((sum / prices.length) / record.capacity);
  }

  function showModal(e: React.MouseEvent<HTMLElement>) {
    
    const selectedEntryId = parseInt(e.currentTarget.dataset.id as string);
    const selectedPriceData = history.map(entries => entries.filter(entry => entry.id === selectedEntryId)[0].prices);

    setActivePriceData(selectedPriceData);
    setIsModalVisible(true);
  
  }

  function hideModal() {
    setIsModalVisible(false);
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
          text: value.split(' ').join('\u00A0'),
          value: value
        };
      }),
      onFilter: (value, record) => record.brand === value
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      filters: Array.from(new Set(rows.map(row => row.capacity))).sort((a, b) => a - b).map(value => {
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
    },
    {
      title: 'price / TB (Average)',
      key: 'pricePerTB',
      render: (value, record) => {
        return formatPrice(record.pricePerTB)
      },
      sorter: (a, b) => a.pricePerTB - b.pricePerTB
    },
    {
      title: 'price history',
      key: 'priceHistory',
      render: (value, record) => {
        return <Button onClick={showModal} data-id={record.id}>show</Button>;
      }
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
    <Modal
      title="basic modal"
      visible={isModalVisible}
      onCancel={hideModal}
      width="95%"
      footer={null}
    >
      <ResponsiveContainer width="100%" height={700}>
        <LineChart
          data={activePriceData}
        >
          <Legend />
          <RechartTooltip />
          <XAxis />
          <YAxis
            domain={[
              Math.min(...activePriceData.map(p => Math.min(...[p.tsukumo, p.sofmap, p.pckoubou, p.dospara].filter(v => v).map(v => v!)))) - 100,
              Math.max(...activePriceData.map(p => Math.max(...[p.tsukumo, p.sofmap, p.pckoubou, p.dospara].filter(v => v).map(v => v!)))) + 100
            ]}
          />
          <Line
            type="monotone"
            dataKey="tsukumo"
            strokeWidth={3}
            stroke="#1f77b4"
          />
          <Line
            type="monotone"
            dataKey="sofmap"
            strokeWidth={3}
            stroke="#ff7f0e"
          />
          <Line
            type="monotone"
            dataKey="pckoubou"
            strokeWidth={3}
            stroke="#2ca02c"
          />
          <Line
            type="monotone"
            dataKey="dospara"
            strokeWidth={3}
            stroke="#d62728"
          />
        </LineChart>
      </ResponsiveContainer>
    </Modal>
  </>
  );
}

export default App;
