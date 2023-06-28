import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
} from '@chakra-ui/react';

export const ActionMenuComponent = (props: any) => {
  const {
    menuButton,
    platformType,
    actionEdit,
    actionPrintLabel,
    actionCreateInvoice,
  } = props;
  return (
    <Menu>
      {menuButton ? (
        menuButton
      ) : (
        <MenuButton as={Button} size="sm">
          Action
        </MenuButton>
      )}
      <Portal>
        <MenuList>
          {actionEdit && (
            <MenuItem onClick={actionEdit}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="feather feather-edit"
                viewBox="0 0 24 24"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              &nbsp;Edit
            </MenuItem>
          )}
          {actionPrintLabel && (
            <MenuItem onClick={actionPrintLabel}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="feather feather-printer"
                viewBox="0 0 24 24"
              >
                <path d="M6 9L6 2 18 2 18 9"></path>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"></path>
                <path d="M6 14H18V22H6z"></path>
              </svg>
              &nbsp;Print Label
            </MenuItem>
          )}
          {platformType === 'admin' && actionCreateInvoice && (
            <MenuItem onClick={actionCreateInvoice}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="feather feather-clipboard"
                viewBox="0 0 24 24"
              >
                <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
                <rect
                  width="8"
                  height="4"
                  x="8"
                  y="2"
                  rx="1"
                  ry="1"
                ></rect>
              </svg>
              &nbsp;Create Invoice
            </MenuItem>
          )}
        </MenuList>
      </Portal>
    </Menu>
  );
};
