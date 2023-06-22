import React from 'react';
import { registerComponent } from '@qorebase/app-cli';
import DataTable from 'react-data-table-component';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Button,
  Portal,
} from '@chakra-ui/react';

const columns = [
  {
    name: 'action',
    cell: (row: any) => (
      <Menu>
        <MenuButton color="gray.500" as={Button}>
          ...
        </MenuButton>
        <Portal>
          <MenuList style={{ zIndex: 1000 }}>
            <MenuItem>Download</MenuItem>
            <MenuItem>Create a Copy</MenuItem>
            <MenuItem>Delete</MenuItem>
            <MenuItem>Delete</MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    ),
    allowOverflow: true,
    button: true,
  },

  {
    name: 'TitleX',
    selector: (row: MyShipment) => row.title,
    sortable: true,
  },
  {
    name: 'Year',
    selector: (row: MyShipment) => row.year,
    sortable: true,
  },
  {
    name: 'lookup_email_users',
    selector: (row: MyShipment) => row.lookup_email_users,
    sortable: true,
  },
];

type MyShipment = {
  id: string;
  title: string;
  year: string;
  lookup_email_users: string;
};

const data: MyShipment[] = [];

const CustomDataTable = registerComponent('custom data table', {
  name: 'Urshipper Shipping Table',
  type: 'list',
  icon: 'TableAlt',
  group: 'data',
  display: 'block',
  defaultProps: {},
  propDefinition: {},
  Component: (props: any) => {
    const source = props.source.target;
    const title = props.properties.title;
    const userId = props.properties.user_id;
    const platformType = props.properties.platform_type;
    const tableRowData = props.data.component?.rows;

    const [tableData, setTableData] = React.useState<MyShipment[]>(
      []
    );
    // return JSON.stringify(tableRowData);
    // insert tableRowData to data

    React.useEffect(() => {
      if (!tableRowData?.length || !source) return;
      setTableData(
        tableRowData.map((row: any) => ({
          id: row.id,
          title: row.sender_phone,
          year: row.lookup_email_users,
          lookup_email_users: row.lookup_email_users,
        }))
      );
    }, [tableRowData, source]);

    return (
      <div style={{ overflow: 'unset !important' }}>
        <DataTable
          columns={columns}
          data={tableData}
          pagination
          selectableRows
          onSelectedRowsChange={(state) =>
            console.log(state.selectedRows)
          }
          onRowClicked={(row) => console.log(row)}
          onColumnOrderChange={(cols) => console.log(cols)}
        />
      </div>
    );
  },
});

export default CustomDataTable;
