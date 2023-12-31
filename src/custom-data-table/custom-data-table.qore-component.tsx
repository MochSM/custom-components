import React from 'react';
import { registerComponent } from '@qorebase/app-cli';
import DataTable from 'react-data-table-component';
import {
  MenuButton,
  Button,
  InputGroup,
  Input,
  InputRightElement,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { ActionMenuComponent } from './components/action-menu-component';

type MyShipment = {
  id: string;
  title: string;
  year: string;
  lookup_email_users: string;
  status_form: string;
  edit_action: () => void;
  print_action: () => void;
  create_invoice_action: () => void;
  on_row_click_action: () => void;
};

const data: MyShipment[] = [];

const CustomDataTable = registerComponent('custom data table', {
  name: 'Urshipper Shipping Table',
  type: 'list',
  icon: 'TableAlt',
  group: 'data',
  display: 'block',
  defaultProps: {
    userId: '',
    platformType: 'admin',
    mode: 'normal',
    ignoreColumns: '',
    columnAlias: '',
    onInsertAction: [{ type: 'none' }],
    detailPage: '',
    editPage: '',
    // onRowClickAction: [{ type: 'none' }],
    // onEditAction: [{ type: 'none' }],
    printAction: [{ type: 'none' }],
    createInvoiceAction: [{ type: 'none' }],
  },
  propDefinition: {
    userId: { group: 'Text', type: 'expression', options: {} },
    platformType: {
      group: 'Text',
      type: 'string',
      options: {
        format: 'select',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Customer', value: 'client' },
        ],
      },
    },
    mode: {
      group: 'Text',
      type: 'string',
      options: {
        format: 'select',
        options: [
          { label: 'Normal', value: 'normal' },
          { label: 'Scan', value: 'scan' },
        ],
      },
    },
    ignoreColumns: { group: 'Text', type: 'expression', options: {} },
    columnAlias: { group: 'Text', type: 'expression', options: {} },
    onInsertAction: {
      group: 'On Insert',
      label: 'On Insert',
      type: 'action',
      options: [{ type: 'none' }],
    },
    detailPage: { group: 'Text', type: 'expression', options: {} },
    editPage: { group: 'Text', type: 'expression', options: {} },
    // onRowClickAction: {
    //   group: 'On Click',
    //   label: 'Row On Click',
    //   type: 'action',
    //   options: [{ type: 'none' }],
    // },
    // onEditAction: {
    //   group: 'On Edit',
    //   label: 'On Edit',
    //   type: 'action',
    //   options: [{ type: 'none' }],
    // },
    printAction: {
      group: 'Print',
      label: 'Print',
      type: 'action',
      options: [{ type: 'none' }],
    },
    createInvoiceAction: {
      group: 'Create Invoice',
      label: 'Create Invoice Action',
      type: 'action',
      options: [{ type: 'none' }],
    },
  },

  Component: (props: any) => {
    // const { clickedRow, handleRowClick } = useRowClick();
    const [clickedRow, setClickedRow] = React.useState<any>(null);
    const onClickedRow = props.hooks.useActionTrigger(
      // props.properties.onEditAction,
      [
        {
          pageID: props.properties.detailPage,
          rowID: `${clickedRow?.id}`,
          type: 'jump_to_page',
          params: {
            rowId: `${clickedRow?.id}`,
          },
          allowBackNavigation: true,
        },
      ],
      props.row,
      props.pageSource
    );

    React.useEffect(() => {
      if (clickedRow) {
        onClickedRow.handleClick();
      }
    }, [clickedRow]);

    const source = props.source.target;
    const {
      title,
      userId,
      ignoreColumns,
      columnAlias,
      platformType,
      mode,
    } = props.properties;
    const tableRowData = props.data.component?.rows;

    const insertAction = props.hooks.useActionTrigger(
      props.properties.onInsertAction,
      props.data.page.row,
      props.pageSource
    );

    const printAction = props.hooks.useActionTrigger(
      props.properties.printAction,
      props.data.page.row,
      props.pageSource
    );

    const createInvoiceAction = props.hooks.useActionTrigger(
      props.properties.createInvoiceAction,
      props.data.page.row,
      props.pageSource
    );

    // const onRowClickAction = props.hooks.useActionTrigger(
    //   props.properties.onRowClickAction,
    //   props.data.page.row,
    //   props.pageSource
    // );

    const [tableData, setTableData] = React.useState<MyShipment[]>(
      []
    );

    React.useEffect(() => {
      if (!tableRowData?.length || !source) return;
      setTableData(
        tableRowData.map((row: any) => ({
          ...row,
          print_action: () => {
            printAction.handleClick();
          },
          create_invoice_action: () => {
            createInvoiceAction.handleClick();
          },
          // on_row_click_action: (id: any) => {
          //   onRowClickAction.handleClick();
          // },
        }))
      );
    }, [tableRowData, source]);

    const [filterText, setFilterText] = React.useState('');
    const [resetFilter, setResetFilter] =
      React.useState<Boolean>(false);

    const [selectedRow, setSelectedRow] = React.useState<
      MyShipment[]
    >([]);

    // React.useEffect(() => {
    //   // Use the fetch function to make a GET request to the API
    //   fetch('https://jsonplaceholder.typicode.com/todos/1')
    //     .then((response) => response.json())
    //     .then((json) => console.log(json));
    // }, []);

    // ? : when filter text updated, add comma.
    if (mode === 'scan') {
      React.useEffect(() => {
        // Create a timeout to add a comma after 1 second of inactivity
        // const sliceSearch = setTimeout(() => {
        if (filterText && filterText.slice(-1) !== ',') {
          setFilterText(
            (prevInputText: any) =>
              prevInputText.replace(/ /g, '') + ','
          );
        }
        // }, 500);

        // Clean up the timeout when the component unmounts or when inputText changes
        // return () => {
        //   clearTimeout(sliceSearch);
        // };
      }, [filterText]);
    }

    const ignoreColumnsArray = ignoreColumns
      ?.split(',')
      .map((e: String) => e.trim());

    const filteredItems = tableData.filter((item) => {
      const filterTextArray = filterText
        .split(',')
        .map((filter) => filter.trim().toLowerCase())
        .filter((filter) => filter !== '');
      return Object.entries(item)
        .filter(([key]) => !ignoreColumnsArray.includes(key))
        .map(([_, value]) => value)
        .some(
          (value) =>
            value &&
            filterTextArray.some((filter) =>
              value.toString().toLowerCase().includes(filter)
            )
        );
    });

    if (mode === 'scan' && filteredItems.length) {
      const lastFilterText = filterText.split(',').pop();

      const lastItem = filteredItems.filter((item) => {
        // @ts-ignore
        return item.shipment_tracking_id === lastFilterText?.trim();
      })[0];

      if (lastItem) {
        //@ts-ignore
        fetch(lastItem.fedex_label, {
          headers: {
            'Content-Disposition': 'inline',
          },
        })
          .then((response) => response.blob())
          .then((blob) => {
            // Create a Blob URL from the fetched blob
            const blobURL = URL.createObjectURL(blob);

            const reader = new FileReader();
            reader.onloadend = () => {
              const dataURI = reader.result as string;
              const newDataURI = dataURI
                .split(';')
                .map((e, i) => {
                  if (i === 0) {
                    return 'data:application/pdf';
                  }
                  return e;
                })
                .join(';');
              const newWindow = window.open('', '_blank');
              if (newWindow) {
                newWindow.document.title = `${lastFilterText}`;
                newWindow.location.href = newDataURI;
                const embedElement = document.createElement('embed');
                embedElement.width = '100%';
                embedElement.height = '100%';
                embedElement.src = newDataURI;
                embedElement.type = 'application/pdf';
                newWindow.document.body.appendChild(embedElement);
              }

              URL.revokeObjectURL(blobURL);
            };
            reader.readAsDataURL(blob);
          });
      }
    }

    const subHeaderComponentMemo = React.useMemo(() => {
      const handleClear = () => {
        if (filterText) {
          setResetFilter(!resetFilter);
          setFilterText('');
        }
      };
      return (
        <HStack spacing={4}>
          {platformType === 'client' && (
            <IconButton
              onClick={() => insertAction.handleClick()}
              colorScheme="blue"
              aria-label="Search database"
              icon={<AddIcon />}
            />
          )}
          <InputGroup size="md">
            <Input
              pr="3.5rem"
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search"
            />
            <InputRightElement width="3.5rem">
              {filterText && (
                <Button h="1.75rem" size="sm" onClick={handleClear}>
                  <CloseIcon />
                </Button>
              )}
            </InputRightElement>
          </InputGroup>
        </HStack>
      );
    }, [filterText, resetFilter]);

    /**
     * TODO: need to confirm
     * fixed action example (PRINT LABEL)
     */
    const actionPrintLabels = props.hooks.useActionTrigger(
      //@ts-ignore
      [
        {
          actionName: 'gcp_print_label',
          notification: {
            onSuccess: {
              description: 'Your request successfully executed',
              title: 'Success',
            },
            onFail: {
              description: 'Oops, there is something wrong!',
              title: 'Failed',
            },
          },
          onFail: { type: 'none' },
          payload: {
            data: JSON.stringify({
              args: {
                data: selectedRow.map((e) => e.id),
              },
            }),
          },
          showNotification: false,
          type: 'trigger_action',
        },
      ],
      props.data.page.row,
      props.pageSource
    );

    /**
     * TODO: need to confirm
     * fixed action example (Create Invoice)
     */
    const actionCreateInvoices = props.hooks.useActionTrigger(
      [
        {
          actionName: 'gcp_xendit_invoice',
          notification: {
            onSuccess: {
              description: 'Your request successfully executed',
              title: 'Success',
            },
            onFail: {
              description: 'Oops, there is something wrong!',
              title: 'Failed',
            },
          },
          onFail: { type: 'none' },
          payload: {
            data: JSON.stringify({
              args: {
                data: selectedRow.map((e) => e.id),
              },
            }),
          },
          showNotification: false,
          type: 'trigger_action',
        },
        {
          pageID: `6a3`,
          rowID: `1`,
          type: 'jump_to_page',
          params: {
            rowId: `1`,
          },
        },
      ],
      props.data.page.row,
      props.pageSource
    );

    const alias: any = [];

    columnAlias?.split(',').forEach((e: String) => {
      if (e.includes(':')) {
        const [key, value] = e.split(':');
        alias.push({ key, value });
      }
    });

    const ignoredColumns = [
      'edit_action',
      'print_action',
      'create_invoice_action',
      'on_row_click_action',
      ...ignoreColumnsArray,
    ];

    const columns = [
      {
        name: 'ACTIONS',
        cell: (row: MyShipment) =>
          ActionMenuComponent({
            menuButton: (
              <MenuButton color="gray.500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="feather feather-more-vertical"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </MenuButton>
            ),
            actionEdit: true,
            // actionPrintLabel: row.print_action,
            actionCreateInvoice: row.create_invoice_action,
            row,
            ...props,
          }),
        allowOverflow: true,
        button: true,
      },
    ];

    tableData[0]
      ? Object.keys(tableData[0]).forEach((key) => {
          if (!ignoredColumns.includes(key)) {
            columns.push({
              name:
                alias
                  ?.find((e: any) => e.key === key)
                  ?.value.trim()
                  .toUpperCase() ||
                key.replace(/_/g, ' ').toUpperCase(),
              //@ts-ignore
              selector: (row: any) => row[key],
              sortable: true,
            });
          }
        })
      : [];

    return (
      <div style={{ overflow: 'unset !important' }}>
        <DataTable
          keyField="id"
          columns={columns}
          data={filterText.length ? filteredItems : tableData}
          pagination
          selectableRows
          onSelectedRowsChange={(state) =>
            setSelectedRow(state.selectedRows)
          }
          subHeader
          highlightOnHover
          selectableRowDisabled={(row) =>
            row.status_form === 'Completed'
          }
          subHeaderComponent={subHeaderComponentMemo}
          // onRowClicked={(row) => row.on_row_click_action()}
          onRowClicked={(row: any) => setClickedRow(row)}
          onColumnOrderChange={(cols) => console.log(cols)}
        />
        <br />

        {selectedRow.length > 0 &&
          ActionMenuComponent({
            platformType,
            actionPrintLabel: actionPrintLabels,
            actionCreateInvoice: actionCreateInvoices,
          })}
      </div>
    );
  },
});

export default CustomDataTable;
