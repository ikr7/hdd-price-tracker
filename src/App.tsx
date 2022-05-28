import React, { useEffect, useState } from 'react';

import { AppBar, Toolbar, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

import {
  DataGrid,
  GridColDef,
  GridRenderCellParams
} from '@mui/x-data-grid';

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

type ShopName = 'amazonjp' | 'tsukumo' | 'sofmap' | 'pckoubou' | 'dospara';

function App() {

  const [rows, setRows] = useState<HDDEntry[]>([]);

  useEffect(() => {
    (async () => {
      const data = await (await fetch('data/2022-05-28.json')).json() as HDDEntry[];
      setRows(data);
    })();
  }, []);

  function renderLink(shop: ShopName) {
    return function (params: GridRenderCellParams) {
      return (
        <a
          href={(params.row as HDDEntry).links[shop]}
          target="_blank"
          rel='noreferrer'
        >
          {(params.row as HDDEntry).prices[shop]}
        </a>
      );
    }
  }

  const columns: GridColDef[] = [
    { field: 'manufacturer', width: 150, sortable: false },
    { field: 'brand', sortable: false },
    { field: 'capacity', type: 'number', sortable: false },
    { field: 'rpm', type: 'number', sortable: false },
    { field: 'record', sortable: false },
    { field: 'cache', type: 'number', sortable: false },
    { field: 'model', width: 150, sortable: false },
    { field: 'amazonPrice', renderCell: renderLink('amazonjp'), type: 'number', sortable: false },
    { field: 'tsukumoPrice', renderCell: renderLink('tsukumo'), type: 'number', sortable: false },
    { field: 'sofmapPrice', renderCell: renderLink('sofmap'), type: 'number', sortable: false },
    { field: 'pckoubouPrice', renderCell: renderLink('pckoubou'), type: 'number', sortable: false },
    { field: 'dosparaPrice', renderCell: renderLink('dospara'), type: 'number', sortable: false },
  ];

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const foo = JSON.parse(JSON.stringify(rows)) as HDDEntry[];
    [foo[0], foo[1]] = [foo[1], foo[0]];
    setRows(foo);
  }

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HDD Price Tracker
          </Typography>
          <a href="https://github.com/ikr7/hdd-price-tracker">
            <GitHubIcon />
          </a>
        </Toolbar>
      </AppBar>
      <div style={{ height: '95vh' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          density='compact'
          disableColumnMenu={true}
          disableSelectionOnClick={true}
          autoPageSize={true}
        />
      </div>
    </>
  );
}

export default App;
