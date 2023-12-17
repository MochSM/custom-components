import { useEffect, useState, useRef } from 'react';
import { registerComponent } from '@qorebase/app-cli';
import Select from 'react-select';
import {
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Spacer,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  HStack,
  Badge,
  RadioGroup,
  Radio,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  InputGroup,
  InputRightElement,
  CircularProgress,
  StackDivider,
  NumberInput,
  NumberInputField,
  ScaleFade,
  Textarea,
  InputRightAddon,
  Icon,
  Checkbox,
  Divider,
  useRadio,
  useRadioGroup,
} from '@chakra-ui/react';
import { RiArrowDropRightLine } from 'react-icons/ri';
import { FiSearch } from 'react-icons/fi';
import {
  BiTrash,
  BiPackage,
  BiPlus,
  BiSolidPackage,
  BiRefresh,
} from 'react-icons/bi';
import { MdCloudUpload } from 'react-icons/md';
import { CgClose } from 'react-icons/cg';
import { GrDocumentText } from 'react-icons/gr';
import { FaFileInvoiceDollar, FaPlus } from 'react-icons/fa';
// import FormData from 'form-data'
// import { default as FormData } from "form-data";
// import FormData = require('form-data');

const CustomStyle = {
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: 'red',
  }),
};

// CREDENTIALS_VARS //
const server = 'https://staging-qore-data-apple-202883.qore.dev';
const headers = {
  accept: '*/*',
  'x-qore-engine-admin-secret': 'LPUFvfGKE6KscQt5DAYb2AtqZiUjm76Z',
};

import {
  useForm,
  Controller,
  useFormContext,
  UseFormRegisterReturn,
  Form,
  useWatch,
} from 'react-hook-form';
import { CustomRadio } from './components/custom-radio';
import VerticalStepper from './components/vertical-stepper';
import useFetchQore from './hooks/use-fetch-qore';

function currencyFormaterIDR(val: number) {
  const formatter = new Intl.NumberFormat('IDR').format(
    Math.floor(val)
  );
  return formatter;
}

function formatDate(date: any) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function formatDateWithTime(date: any) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const amPm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

  const formattedDate = `${dayName}, ${day} ${monthName} ${year} by ${formattedHours}:${minutes
    .toString()
    .padStart(2, '0')} ${amPm}`;
  return formattedDate;
}

// TODO: problem disini.
const getData = async (
  client: any,
  relationUserShipment: string | number,
  shipmentId: string | number
) => {
  let operations = [];

  const getUser = {
    operation: 'Select',
    instruction: {
      table: 'users',
      name: 'user_data',
      condition: {
        $or: [
          {
            $or: [
              {
                id: {
                  $eq: relationUserShipment,
                },
              },
            ],
          },
        ],
      },
      limit: 1,
    },
  };

  const getShipment = {
    operation: 'Select',
    instruction: {
      table: 'my_shipment',
      name: 'shipment_data',
      condition: {
        $or: [
          {
            $or: [
              {
                id: {
                  $eq: shipmentId,
                },
              },
            ],
          },
        ],
      },
      limit: 1,
      populate: [
        'relation_myshopment_package_items',
        'relation_shipment_package_comodities_items',
      ],
    },
  };

  const getDefaultAddressBook = {
    operation: 'Select',
    instruction: {
      table: 'address_book',
      name: 'allAddressBook',
      condition: {
        $or: [
          {
            $and: [
              {
                relation_user_address_book: {
                  id: {
                    $eq: relationUserShipment,
                  },
                },
              },
              {
                primary_address: {
                  $eq: 'true',
                },
              },
            ],
          },
        ],
      },
    },
  };

  const getUserAddressBook = {
    operation: 'Select',
    instruction: {
      table: 'address_book',
      name: 'addressBook',
      condition: {
        $or: [
          {
            $and: [
              {
                relation_user_item_book: relationUserShipment,
              },
            ],
          },
        ],
      },
    },
  };

  const selectBookedItem = {
    operation: 'Select',
    instruction: {
      table: 'item_book',
      name: 'selectAllBook',
      condition: {
        $or: [
          {
            $and: [
              {
                relation_user_address_book: {
                  id: {
                    $eq: relationUserShipment,
                  },
                },
              },
            ],
          },
        ],
      },
    },
  };

  operations.push(
    getUser,
    getShipment,
    getDefaultAddressBook,
    selectBookedItem,
    getUserAddressBook
  );

  const response = await client.project.axios.post(
    `${server}/v1/execute`,
    {
      operations: operations,
    },
    { headers: headers }
  );

  return response?.data.results;
};

const getCountryData = async (client: any) => {
  console.log('>>>>> trigger get country');
  const getAllCountry = await client.project.axios.get(
    `${server}/v1/grid/other_related?limit=500&params[country_code]=ID&params[search_country_by_name]=`,
    { headers: headers }
  );
  return getAllCountry.data.items;
};

// Get Province Data
const getProvinceData = async (client: any) => {
  const getAllState = await client.project.axios.get(
    `${server}/v1/table/state_code?limit=500`,
    { headers: headers }
  );
  return getAllState.data.items;
};

const getUserMembership = async (client: any, userId: number) => {
  const response = await client.project.axios({
    method: 'post',
    headers,
    url: `${server}/v1/execute`,
    data: {
      operations: [
        {
          operation: 'Select',
          instruction: {
            view: 'user_membership',
            name: 'membership',
            params: {
              user_id: userId,
            },
            limit: 1,
          },
        },
      ],
    },
  });
  return response.data.results?.membership;
};

function validatePackage(
  currentPackageData: any,
  newArr: any,
  type: any
) {
  if (type === 'item') {
    let itemQuantity: any = 0;
    let itemWeight: any = 0;
    let itemCustomValue: any = 0;

    for (let index = 0; index < newArr.length; index++) {
      const el = newArr[index];
      itemQuantity += Number(el.quantity);
      itemWeight += Number(el.weight) * Number(el.quantity);
      itemCustomValue +=
        Number(el.custom_value) * Number(el.quantity);
    }

    return {
      itemTotalQuantity: itemQuantity,
      itemTotalWeight: itemWeight,
      itemTotalCustomValue: itemCustomValue,
    };
  } else {
    let validationNumberOfPackage: any = 0;
    let validationTotalCoverAmount: any = 0;
    let totalWeight = 0;
    let totalActualWeight = 0;

    for (let index = 0; index < newArr.length; index++) {
      const element = newArr[index];
      validationNumberOfPackage += Number(element.quantity);
    }

    if (currentPackageData?.package_type === 'Your Packaging') {
      for (let index = 0; index < newArr.length; index++) {
        const el = newArr[index];
        let itemWeight: any = 0;
        let dimensionsWeight: any = 0;
        let tempWeight = Number(el.weight) * Number(el.quantity);
        let tempVolumeWeight =
          ((Number(el.dimensions_length) *
            Number(el.dimensions_width) *
            Number(el.dimensions_height)) /
            5000) *
          Number(el.quantity);
        let precisionWeight = tempWeight.toFixed(2);
        let precisionVolumeWeight = tempVolumeWeight.toFixed(2);

        itemWeight += Number(precisionWeight);
        dimensionsWeight += Number(precisionVolumeWeight);

        if (itemWeight > dimensionsWeight) {
          totalWeight += Number(itemWeight);
        } else {
          totalWeight += Number(dimensionsWeight);
        }
        totalActualWeight += Number(precisionWeight);
        validationTotalCoverAmount +=
          Number(el.declare_value_amount) * Number(el.quantity);
      }

      return {
        validationNumberOfPackage: validationNumberOfPackage,
        validationTotalCoverAmount: validationTotalCoverAmount,
        totalWeight: totalWeight,
        totalActualWeight: totalActualWeight,
      };
    } else {
      for (let index = 0; index < newArr.length; index++) {
        const el = newArr[index];
        let itemWeight: any = 0;
        let tempWeight = Number(el.weight) * Number(el.quantity);
        let precisionWeight = tempWeight.toFixed(2);
        itemWeight += Number(precisionWeight);
        totalWeight += Number(itemWeight);
        validationTotalCoverAmount +=
          Number(el.declare_value_amount) * Number(el.quantity);
      }

      return {
        validationNumberOfPackage: validationNumberOfPackage,
        validationTotalCoverAmount: validationTotalCoverAmount,
        totalWeight: totalWeight,
      };
    }
  }
}

// COMPONENTS //
const LoaderItem: React.FC = () => (
  <Center>
    <Spinner color="var(--chakra-colors-qore-primary)" />
  </Center>
);

interface IPropsUserInformation {
  platformType: 'admin' | 'client';
  watch: any;
  countryData: any[];
  stateData: any;
  countryDefault?: string;
  receiverDataDefault: any;
  setSelectSenderStateMode: any;
  setSelectReceiverStateMode: any;
  selectSenderStateMode: any;
  selectReceiverStateMode: any;
  setSenderCountryCode: any;
  setReceiverCountryCode: any;
  senderCountryCode: any;
  receiverCountryCode: any;
  packageTypeDefault: any;
  userData: any;
  form: any;
  allAddressBook: any;
  updateFormShipment: any;
  setCurrentPackageData: any;
  currentPackageData: any;
  pageIsLoading: any;
  animateCoverBox: any;
  animateCoverBoxCurrency: any;
  animateNewContainer: any;
  animateContainerBox: any;
  currencyData: any;
  currencyCodePopover: any;
  setSearchCurrency: any;
  searchCurrencyLoad: any;
  customSelectedItemsCurrency: any;
  filteredCurrency: any;
  handleSelectedItemsChangeCurrency: any;
  setValidationTotalDeclareValue: any;
  setValidationTotalWeight: any;
  setValidationNumberOfPackage: any;
  setValidationTotalCustomValue: any;
  setValidationComoditiesItemWeight: any;
  searchItemBookLoad: any;
  setSearchItemBook: any;
  removeLoad: any;
  removePackage: any;
  removeItems: any;
  newYourPackaging: any;
  currencyCodePopoverItem: any;
  itemBook: any;
  itemBookPopover: any;
  customSelectedItemsBook: any;
  filterItemBook: any;
  validationNumberOfPackage: any;
  validationTotalWeight: any;
  validationComoditiesItemWeight: any;
  validationTotalCustomValue: any;
  boxIsLoading: any;
  validatePrintLabel: any;
  shipmentData: any;
  updatePackage: any;
  // printLabel: any;
  getRate: any;
  loading: any;
  createInvoice: any;
  fedexPDFToQore: any;
  urshipperRate: any;
  handleSelectedItemBook: any;
  addFromBook: any;
  newItems: any;
  receiverCountryDefault: any;
  currencyDefault: any;
  validationTotalDeclareValue: any;
  setSubmitType: any;
  setValidationActualTotalWeight: any;
  validationTotalActualWeight: any;
  setValidationComoditiesItemQuantity: any;
  validationComoditiesItemQuantity: any;
  updateItems: any;
  updateItemLoad: any;
  membership: any;
  handleSelectedFedexAccount: any;
  fedexAccount: any;
}

interface IPropsYourPackaging {
  getData: any;
  currentPackageData: any;
  setCurrentPackageData: any;
  packageData: any;
  index: number;
  removePackage: any;
  removeLoad: any;
  animateNewContainer: any;
  setValidationNumberOfPackage: any;
  setValidationTotalWeight: any;
  setValidationTotalDeclareValue: any;
  setValidationActualTotalWeight: any;
  validationTotalActualWeight: any;
  newYourPackaging: any;
}

interface IPropsCurrency {
  currencyData: any;
  currencyCodePopoverItem: any;
  setSearchCurrency: any;
  customSelectedItemsCurrency: any;
  searchCurrencyLoad: any;
  filteredCurrency: any;
  handleSelectedItemsChangeCurrency: any;
}

interface IPropsPackageItems {
  getData: any;
  currentPackageData: any;
  setCurrentPackageData: any;
  packageData: any;
  index: number;
  removePackage: any;
  removeLoad: any;
  animateNewContainer: any;
  setValidationTotalCustomValue: any;
  setValidationComoditiesItemWeight: any;
  setValidationTotalDeclareValue: any;
  setValidationComoditiesItemQuantity: any;
  validationComoditiesItemQuantity: any;
  newItems: any;
  itemBook: any;
  form: any;
  control: any;
  updateItems: any;
  updateItemLoad: any;
}

interface IPropsAllRate {
  el: any;
  index: any;
  membership: any;
}

type FileUploadProps = {
  register: UseFormRegisterReturn;
  accept?: string;
  multiple?: boolean;
  children: any;
  encodeImageFileAsURL: any;
};

const FileUpload = (props: FileUploadProps) => {
  const {
    register,
    accept,
    multiple,
    children,
    encodeImageFileAsURL,
  } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { ref, ...rest } = register as {
    ref: (instance: HTMLInputElement | null) => void;
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <InputGroup onClick={handleClick}>
      <Input
        type={'file'}
        multiple={false}
        hidden
        accept={accept}
        {...rest}
        onChange={(e) => encodeImageFileAsURL(e.target)}
        ref={(e) => {
          ref(e);
          inputRef.current = e;
        }}
      />
      <>{children}</>
    </InputGroup>
  );
};

const YourPackaging: React.FC<IPropsYourPackaging> = ({
  getData,
  currentPackageData,
  setCurrentPackageData,
  packageData,
  index,
  removePackage,
  removeLoad,
  animateNewContainer,
  setValidationNumberOfPackage,
  setValidationTotalWeight,
  setValidationTotalDeclareValue,
  setValidationActualTotalWeight,
  validationTotalActualWeight,
  newYourPackaging,
}) => {
  const [coverAmount, setCoverAmmount] = useState('1');
  const [boxWidth, setBoxWidth] = useState<string>('50%');

  useEffect(() => {
    if (index !== 0) {
      animateNewContainer.onOpen();
    }
  }, [index]);

  useEffect(() => {
    getBoxWidth();
  }, [currentPackageData?.is_declare_value]);

  const getBoxWidth = () => {
    const widthBox =
      currentPackageData?.is_declare_value === 'No' ? '50%' : '30%';
    setBoxWidth(widthBox);
  };

  const updateContainer = async (val: any, type: any) => {
    let newAllPackage: any = [];
    let numberOfPackage: any = 0;

    let allPackage =
      currentPackageData?.relation_myshopment_package_items;

    if (type === 'sum') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.quantity = Number(val);
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    } else if (type === 'weight') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.weight = Number(val);
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    } else if (type === 'length') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.dimensions_length = Number(val);
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    } else if (type === 'width') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.dimensions_width = Number(val);
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    } else if (type === 'height') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.dimensions_height = Number(val);
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    } else if (type === 'desc') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.description = val;
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    } else if (type === 'cover') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.declare_value_amount = Number(val);
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    }

    //Set Validation
    let validationNumberOfPackage: any = 0;
    let validationTotalCoverAmount: any = 0;

    newAllPackage.forEach((el: any) => {
      validationNumberOfPackage += Number(el.quantity);
    });

    let totalWeight = 0;
    let totalActualWeight = 0;

    setValidationNumberOfPackage(Number(validationNumberOfPackage));

    newAllPackage.forEach((el: any) => {
      let itemWeight: any = 0;
      let dimensionsWeight: any = 0;
      let tempWeight = Number(el.weight) * Number(el.quantity);
      let tempVolumeWeight =
        ((Number(el.dimensions_length) *
          Number(el.dimensions_width) *
          Number(el.dimensions_height)) /
          5000) *
        Number(el.quantity);
      let precisionWeight = tempWeight.toFixed(2);
      let precisionVolumeWeight = tempVolumeWeight.toFixed(2);

      itemWeight += Number(precisionWeight);
      dimensionsWeight += Number(precisionVolumeWeight);
      totalActualWeight += Number(itemWeight);

      if (itemWeight > dimensionsWeight) {
        totalWeight += Number(itemWeight);
        el.chargeable_weight = itemWeight;
        el.dimensions_weight = dimensionsWeight;
      } else {
        totalWeight += Number(dimensionsWeight);
        el.chargeable_weight = dimensionsWeight;
        el.dimensions_weight = dimensionsWeight;
      }
    });

    validationTotalCoverAmount =
      currentPackageData.total_declare_amount;

    setCurrentPackageData({
      ...currentPackageData,
      relation_myshopment_package_items: newAllPackage,
    });

    // Package Validation
    const packageValidation = validatePackage(
      currentPackageData,
      newAllPackage,
      'package'
    );
    setValidationNumberOfPackage(
      Number(packageValidation?.validationNumberOfPackage)
    );
    setValidationTotalWeight(Number(packageValidation?.totalWeight));
    setValidationActualTotalWeight(
      Number(packageValidation?.totalActualWeight)
    );
    setValidationTotalDeclareValue(
      packageValidation?.validationTotalCoverAmount
    );
  };

  return (
    <Box>
      {index === 0 ? (
        <Box>
          {!removeLoad ? (
            <VStack alignItems={'start'}>
              <Flex w={'100%'} justifyContent={'space-between'}>
                <Box mb={'20px'} fontWeight={600} fontSize={'16px'}>
                  {' '}
                  Package {index + 1}
                </Box>
                <Box>
                  <Box>
                    {index != 0 && (
                      <Box>
                        <Button
                          _hover={{
                            color: '#FFEDE6',
                            backgroundColor: '#E53E3E',
                          }}
                          boxShadow={'lg'}
                          onClick={(val: any) => {
                            removePackage(index);
                          }}
                          fontSize={'16px'}
                          color={'#E53E3E'}
                          leftIcon={<CgClose color={'#E53E3E'} />}
                          bg={'#FFEDE6'}
                        >
                          Remove
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Flex>

              <Flex
                w={'100%'}
                justifyContent={
                  currentPackageData?.package_type ===
                  'Your Packaging'
                    ? 'space-between'
                    : 'start'
                }
                gap={5}
                flexWrap={'wrap'}
              >
                <Box w={'30%'}>
                  <FormLabel fontWeight={600} mb={'10px'}>
                    Quantity
                  </FormLabel>
                  <Stack spacing={3}>
                    <NumberInput
                      onChange={(val: any, type: any) =>
                        updateContainer(val, 'sum')
                      }
                      step={1}
                      defaultValue={packageData?.quantity}
                      min={1}
                      max={40}
                      size="sm"
                    >
                      <NumberInputField
                        _focus={{ outline: 'none' }}
                      />
                    </NumberInput>
                  </Stack>
                </Box>

                <Box w={'30%'}>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600} mb={'10px'}>
                      Actual Weight
                    </FormLabel>
                    <Stack spacing={3}>
                      <InputGroup size="sm">
                        <NumberInput
                          w={'100%'}
                          borderColor={'A2A2A2'}
                          onChange={(val: any, type: any) => {
                            updateContainer(val, 'weight');
                          }}
                          min={0.01}
                          max={68}
                          defaultValue={Number(packageData?.weight)}
                          precision={2}
                          step={0.01}
                        >
                          <NumberInputField
                            _focus={{ outline: 'none' }}
                          />
                        </NumberInput>
                        <InputRightAddon
                          backgroundColor={'#F5F5F5'}
                          fontWeight={600}
                          children={'kg'}
                        />
                      </InputGroup>
                    </Stack>
                  </FormControl>
                </Box>

                {currentPackageData?.package_type ===
                'Your Packaging' ? (
                  <Box w={'30%'}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600} mb={'10px'}>
                        Dimensions
                      </FormLabel>
                      <Stack
                        borderRadius={'lg'}
                        border={
                          '1px solid var(--chakra-colors-gray-200)'
                        }
                        direction={'row'}
                        spacing={'10px'}
                      >
                        <Box w={'calc(100%/5)'}>
                          <NumberInput
                            size={'sm'}
                            alignItems={'center'}
                            borderColor={'transparent'}
                            onChange={(val: any, type: any) => {
                              updateContainer(val, 'length');
                            }}
                            value={packageData?.dimensions_length}
                            max={997.9}
                            min={1}
                            precision={0}
                            p={'0'}
                            w={'100%'}
                          >
                            <NumberInputField
                              p={0}
                              alignItems={'center'}
                              textAlign={'center'}
                              _hover={{ borderColor: 'transparent' }}
                              borderColor={'transparent'}
                              _focus={{ outline: 'none' }}
                            />
                          </NumberInput>
                        </Box>

                        <Center>
                          <CgClose />
                        </Center>

                        <Box w={'calc(100%/5)'}>
                          <NumberInput
                            size={'sm'}
                            borderColor={'transparent'}
                            onChange={(val: any, type: any) => {
                              updateContainer(val, 'width');
                            }}
                            value={packageData?.dimensions_width}
                            max={997.9}
                            min={0.01}
                            precision={0}
                            p={'0'}
                            w={'100%'}
                          >
                            <NumberInputField
                              p={0}
                              alignItems={'center'}
                              textAlign={'center'}
                              _hover={{ borderColor: 'transparent' }}
                              borderColor={'transparent'}
                              _focus={{ outline: 'none' }}
                            />
                          </NumberInput>
                        </Box>

                        <Center>
                          <CgClose />
                        </Center>

                        <Box w={'calc(100%/3)'}>
                          <InputGroup size="sm">
                            <NumberInput
                              borderColor={'transparent'}
                              onChange={(val: any, type: any) => {
                                updateContainer(val, 'height');
                              }}
                              value={packageData?.dimensions_height}
                              max={997.9}
                              min={0.01}
                              precision={0}
                              p={'0'}
                              w={'100%'}
                            >
                              <NumberInputField
                                p={0}
                                textAlign={'center'}
                                _hover={{
                                  borderColor: 'transparent',
                                }}
                                borderColor={'transparent'}
                                _focus={{ outline: 'none' }}
                              />
                            </NumberInput>
                            <InputRightAddon
                              backgroundColor={'#F5F5F5'}
                              p={'10px'}
                              fontWeight={600}
                              children={'cm'}
                            />
                          </InputGroup>
                        </Box>
                      </Stack>
                    </FormControl>
                  </Box>
                ) : (
                  <></>
                )}
              </Flex>

              <Flex
                w={'100%'}
                py={'20px'}
                gap={
                  currentPackageData?.is_declare_value === 'Yes'
                    ? 5
                    : 10
                }
                justifyContent={
                  currentPackageData?.is_declare_value === 'Yes'
                    ? 'space-between'
                    : 'start'
                }
                flexWrap={'wrap'}
              >
                {currentPackageData?.package_type ===
                'Your Packaging' ? (
                  <Box w={'30%'}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600} mb={'10px'}>
                        Volumemetric Weight
                      </FormLabel>
                      <InputGroup size="sm">
                        <NumberInput
                          w={'100%'}
                          backgroundColor={'#F5F5F5'}
                          // variant='filled'
                          borderRadius={'md'}
                          value={
                            (Number(packageData?.dimensions_length) *
                              Number(packageData?.dimensions_width) *
                              Number(
                                packageData?.dimensions_height
                              )) /
                            5000
                          }
                          isDisabled={true}
                        >
                          <NumberInputField
                            _focus={{ outline: 'none' }}
                          />
                        </NumberInput>
                        <InputRightAddon
                          backgroundColor={'#F5F5F5'}
                          fontWeight={600}
                          children={'kg'}
                        />
                      </InputGroup>
                    </FormControl>
                  </Box>
                ) : (
                  <></>
                )}

                {currentPackageData?.package_type ===
                'Your Packaging' ? (
                  <Box w={'30%'}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600} mb={'10px'}>
                        Chargeable Weight
                      </FormLabel>
                      <Stack spacing={3}>
                        <InputGroup size="sm">
                          <NumberInput
                            width={'100%'}
                            // variant='filled'
                            backgroundColor={'#F5F5F5'}
                            borderRadius={'md'}
                            value={
                              (Number(
                                packageData?.dimensions_length
                              ) *
                                Number(
                                  packageData?.dimensions_width
                                ) *
                                Number(
                                  packageData?.dimensions_height
                                )) /
                                5000 >
                              Number(packageData?.weight)
                                ? (Number(
                                    packageData?.dimensions_length
                                  ) *
                                    Number(
                                      packageData?.dimensions_width
                                    ) *
                                    Number(
                                      packageData?.dimensions_height
                                    )) /
                                  5000
                                : Number(packageData?.weight)
                            }
                            min={0.01}
                            precision={2}
                            isDisabled={true}
                          >
                            <NumberInputField
                              _focus={{ outline: 'none' }}
                            />
                          </NumberInput>
                          <InputRightAddon
                            backgroundColor={'#F5F5F5'}
                            fontWeight={600}
                            children={'kg'}
                          />
                        </InputGroup>
                      </Stack>
                    </FormControl>
                  </Box>
                ) : (
                  <></>
                )}

                {currentPackageData?.is_declare_value === 'Yes' && (
                  <Box w={'30%'}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600} mb={'10px'}>
                        Insured Value
                      </FormLabel>

                      {currentPackageData?.lookup_currency ? (
                        <Stack spacing={3}>
                          <InputGroup size="sm">
                            <NumberInput
                              w={'100%'}
                              // border={'1px solid var(--chakra-colors-gray-200)'}
                              borderRadius={'md'}
                              onChange={(val: any, type: any) => {
                                updateContainer(val, 'cover');
                              }}
                              defaultValue={Number(
                                packageData?.declare_value_amount
                              )}
                            >
                              <NumberInputField
                                fill={'rgb(231, 231, 231)'}
                                _focus={{ outline: 'none' }}
                              />
                            </NumberInput>
                            <InputRightAddon
                              backgroundColor={'#F5F5F5'}
                              fontWeight={600}
                              children={`${currentPackageData?.lookup_currency_code}`}
                            />
                          </InputGroup>
                        </Stack>
                      ) : (
                        <Box w={'100%'}>Please Select Currency</Box>
                      )}
                    </FormControl>
                  </Box>
                )}
              </Flex>
            </VStack>
          ) : (
            <LoaderItem />
          )}
        </Box>
      ) : (
        <ScaleFade initialScale={0.9} in={animateNewContainer.isOpen}>
          <Box>
            {!removeLoad ? (
              <VStack alignItems={'start'}>
                <Flex w={'100%'} justifyContent={'space-between'}>
                  <Box mb={'20px'} fontWeight={600} fontSize={'16px'}>
                    {' '}
                    Package {index + 1}
                  </Box>
                  <Box>
                    <Box>
                      {index != 0 && (
                        <Box>
                          <Button
                            _hover={{
                              color: '#FFEDE6',
                              backgroundColor: '#E53E3E',
                            }}
                            boxShadow={'lg'}
                            onClick={(val: any) => {
                              removePackage(index);
                            }}
                            fontSize={'16px'}
                            color={'#E53E3E'}
                            leftIcon={<CgClose color={'#E53E3E'} />}
                            bg={'#FFEDE6'}
                          >
                            Remove
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Flex>
                <Flex
                  w={'100%'}
                  gap={5}
                  flexWrap={'wrap'}
                  justifyContent={
                    currentPackageData?.package_type ===
                    'Your Packaging'
                      ? 'space-between'
                      : 'start'
                  }
                >
                  <Box w={'30%'}>
                    <FormLabel fontWeight={600} mb={'10px'}>
                      Quantity
                    </FormLabel>
                    <Stack spacing={3}>
                      <NumberInput
                        size="sm"
                        w={'100%'}
                        onChange={(val: any, type: any) =>
                          updateContainer(val, 'sum')
                        }
                        step={1}
                        defaultValue={packageData?.quantity}
                        min={1}
                        max={40}
                      >
                        <NumberInputField
                          _focus={{ outline: 'none' }}
                        />
                      </NumberInput>
                    </Stack>
                  </Box>

                  <Box w={'30%'}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600} mb={'10px'}>
                        Actual Weight
                      </FormLabel>
                      <InputGroup size="sm">
                        <NumberInput
                          w={'100%'}
                          borderColor={'A2A2A2'}
                          onChange={(val: any, type: any) => {
                            updateContainer(val, 'weight');
                          }}
                          min={0.01}
                          max={68}
                          defaultValue={Number(packageData?.weight)}
                          precision={2}
                          step={0.01}
                        >
                          <NumberInputField
                            _focus={{ outline: 'none' }}
                          />
                        </NumberInput>
                        <InputRightAddon
                          backgroundColor={'#F5F5F5'}
                          fontWeight={600}
                          children={'kg'}
                        />
                      </InputGroup>
                    </FormControl>
                  </Box>

                  {currentPackageData?.package_type ===
                  'Your Packaging' ? (
                    <Box w={'30%'}>
                      <FormControl isRequired>
                        <FormLabel fontWeight={600} mb={'10px'}>
                          Dimensions
                        </FormLabel>
                        <Stack
                          borderRadius={'lg'}
                          border={
                            '1px solid var(--chakra-colors-gray-200)'
                          }
                          direction={'row'}
                          spacing={'10px'}
                        >
                          <Box w={'calc(100%/5)'}>
                            <NumberInput
                              size={'sm'}
                              alignItems={'center'}
                              borderColor={'transparent'}
                              onChange={(val: any, type: any) => {
                                updateContainer(val, 'length');
                              }}
                              value={packageData?.dimensions_length}
                              max={997.9}
                              min={1}
                              precision={0}
                              p={'0'}
                              w={'100%'}
                            >
                              <NumberInputField
                                p={0}
                                alignItems={'center'}
                                textAlign={'center'}
                                _hover={{
                                  borderColor: 'transparent',
                                }}
                                borderColor={'transparent'}
                                _focus={{ outline: 'none' }}
                              />
                            </NumberInput>
                          </Box>

                          <Center>
                            <CgClose />
                          </Center>

                          <Box w={'calc(100%/5)'}>
                            <NumberInput
                              size={'sm'}
                              borderColor={'transparent'}
                              onChange={(val: any, type: any) => {
                                updateContainer(val, 'width');
                              }}
                              value={packageData?.dimensions_width}
                              max={997.9}
                              min={0.01}
                              precision={0}
                              p={'0'}
                              w={'100%'}
                            >
                              <NumberInputField
                                p={0}
                                alignItems={'center'}
                                textAlign={'center'}
                                _hover={{
                                  borderColor: 'transparent',
                                }}
                                borderColor={'transparent'}
                                _focus={{ outline: 'none' }}
                              />
                            </NumberInput>
                          </Box>

                          <Center>
                            <CgClose />
                          </Center>

                          <Box w={'calc(100%/3)'}>
                            <InputGroup size="sm">
                              <NumberInput
                                borderColor={'transparent'}
                                onChange={(val: any, type: any) => {
                                  updateContainer(val, 'height');
                                }}
                                value={packageData?.dimensions_height}
                                max={997.9}
                                min={0.01}
                                precision={0}
                                p={'0'}
                                w={'100%'}
                              >
                                <NumberInputField
                                  p={0}
                                  textAlign={'center'}
                                  _hover={{
                                    borderColor: 'transparent',
                                  }}
                                  borderColor={'transparent'}
                                  _focus={{ outline: 'none' }}
                                />
                              </NumberInput>
                              <InputRightAddon
                                backgroundColor={'#F5F5F5'}
                                p={'10px'}
                                fontWeight={600}
                                children={'cm'}
                              />
                            </InputGroup>
                          </Box>
                        </Stack>
                      </FormControl>
                    </Box>
                  ) : (
                    <></>
                  )}
                </Flex>

                <Flex
                  w={'100%'}
                  py={'20px'}
                  gap={
                    currentPackageData?.is_declare_value === 'Yes'
                      ? 5
                      : 10
                  }
                  justifyContent={
                    currentPackageData?.is_declare_value === 'Yes'
                      ? 'space-between'
                      : 'start'
                  }
                  flexWrap={'wrap'}
                >
                  {currentPackageData?.package_type ===
                  'Your Packaging' ? (
                    <Box w={'30%'}>
                      <FormControl isRequired>
                        <FormLabel fontWeight={600} mb={'10px'}>
                          Volumemetric Weight
                        </FormLabel>
                        <InputGroup size="sm">
                          <NumberInput
                            // variant='filled'
                            w={'100%'}
                            backgroundColor={'#F5F5F5'}
                            borderRadius={'md'}
                            value={
                              (Number(
                                packageData?.dimensions_length
                              ) *
                                Number(
                                  packageData?.dimensions_width
                                ) *
                                Number(
                                  packageData?.dimensions_height
                                )) /
                              5000
                            }
                            isDisabled={true}
                          >
                            <NumberInputField
                              _focus={{ outline: 'none' }}
                            />
                          </NumberInput>
                          <InputRightAddon
                            backgroundColor={'#F5F5F5'}
                            fontWeight={600}
                            children={'kg'}
                          />
                        </InputGroup>
                      </FormControl>
                    </Box>
                  ) : (
                    <></>
                  )}

                  {currentPackageData?.package_type ===
                  'Your Packaging' ? (
                    <Box w={'30%'}>
                      <FormControl isRequired>
                        <FormLabel fontWeight={600} mb={'10px'}>
                          Chargeable Weight
                        </FormLabel>
                        <InputGroup size="sm">
                          <NumberInput
                            w={'100%'}
                            // variant='filled'
                            backgroundColor={'#F5F5F5'}
                            borderRadius={'md'}
                            value={
                              (Number(
                                packageData?.dimensions_length
                              ) *
                                Number(
                                  packageData?.dimensions_width
                                ) *
                                Number(
                                  packageData?.dimensions_height
                                )) /
                                5000 >
                              Number(packageData?.weight)
                                ? (Number(
                                    packageData?.dimensions_length
                                  ) *
                                    Number(
                                      packageData?.dimensions_width
                                    ) *
                                    Number(
                                      packageData?.dimensions_height
                                    )) /
                                  5000
                                : Number(packageData?.weight)
                            }
                            min={0.01}
                            precision={2}
                            isDisabled={true}
                          >
                            <NumberInputField
                              _focus={{ outline: 'none' }}
                            />
                          </NumberInput>
                          <InputRightAddon
                            backgroundColor={'#F5F5F5'}
                            fontWeight={600}
                            children={'kg'}
                          />
                        </InputGroup>
                      </FormControl>
                    </Box>
                  ) : (
                    <></>
                  )}

                  {currentPackageData?.is_declare_value === 'Yes' && (
                    <Box w={'30%'}>
                      <FormControl isRequired>
                        <FormLabel fontWeight={600} mb={'10px'}>
                          Insured Value
                        </FormLabel>

                        {currentPackageData?.lookup_currency ? (
                          <InputGroup size="sm">
                            <NumberInput
                              w={'100%'}
                              // border={'1px solid var(--chakra-colors-gray-200)'}
                              borderRadius={'md'}
                              onChange={(val: any, type: any) => {
                                updateContainer(val, 'cover');
                              }}
                              defaultValue={Number(
                                packageData?.declare_value_amount
                              )}
                            >
                              <NumberInputField
                                fill={'rgb(231, 231, 231)'}
                                _focus={{ outline: 'none' }}
                              />
                            </NumberInput>
                            <InputRightAddon
                              backgroundColor={'#F5F5F5'}
                              fontWeight={600}
                              children={`${currentPackageData?.lookup_currency_code}`}
                            />
                          </InputGroup>
                        ) : (
                          <Box>Please Select Currency</Box>
                        )}
                      </FormControl>
                    </Box>
                  )}
                </Flex>
              </VStack>
            ) : (
              <LoaderItem />
            )}
          </Box>
        </ScaleFade>
      )}
    </Box>
  );
};

const CustomCurrency: React.FC<IPropsCurrency> = ({
  currencyData,
  currencyCodePopoverItem,
  setSearchCurrency,
  customSelectedItemsCurrency,
  searchCurrencyLoad,
  filteredCurrency,
  handleSelectedItemsChangeCurrency,
}) => {
  return (
    <Box w={'50%'}>
      <FormLabel fontWeight={600} mb={'10px'}>
        Currency
      </FormLabel>
      {currencyData && currencyData.length > 0 ? (
        <Popover
          isOpen={currencyCodePopoverItem.isOpen}
          onOpen={currencyCodePopoverItem.onOpen}
          onClose={() => {
            currencyCodePopoverItem.onClose();
            setSearchCurrency('');
          }}
          placement="bottom"
        >
          <PopoverTrigger>
            <Input
              color={'gray.500'}
              as={'button'}
              placeholder={'Select Country'}
              fontSize={'14px'}
              textAlign={'left'}
              border="1px"
              borderColor="#E9E9E9"
              _focus={{ outline: 'none' }}
            >
              {customSelectedItemsCurrency == ''
                ? 'Select Currency'
                : customSelectedItemsCurrency}
            </Input>
          </PopoverTrigger>
          <PopoverContent
            w={'100%'}
            minW={'269px'}
            boxShadow="base"
            maxH="320px"
            overflowY="hidden"
            _focus={{ outline: 'none' }}
          >
            <PopoverArrow />
            <PopoverBody px="0">
              <Center justifyContent={'space-between'}>
                <Box w={'100%'}>
                  <Stack spacing={3} px="10px">
                    <InputGroup>
                      <InputRightElement
                        pointerEvents="none"
                        children={
                          searchCurrencyLoad ? (
                            <CircularProgress
                              size="20px"
                              mx="auto"
                              isIndeterminate
                              color="#c6b378"
                            />
                          ) : (
                            <FiSearch color="rgba(162, 162, 162, 1)" />
                          )
                        }
                      />
                      <Input
                        _focus={{ outline: 'none' }}
                        placeholder="Search Currency by Country"
                        fontSize="12px"
                        onChange={(e: any) => {
                          setSearchCurrency(e.target.value);
                        }}
                      />
                    </InputGroup>
                  </Stack>

                  {filteredCurrency &&
                    filteredCurrency.length > 0 && (
                      <VStack
                        w={'auto'}
                        divider={
                          <StackDivider borderColor="gray.200" />
                        }
                        spacing={4}
                        align="stretch"
                        mt={0}
                        className="filter-checkbox-wrapper"
                        overflowY="scroll"
                        maxH="400px"
                        pl={'10px'}
                      >
                        <Box>
                          {filteredCurrency.map(
                            (el: any, indexCurrency: number) => {
                              return (
                                <Box
                                  py={3}
                                  key={indexCurrency}
                                  onClick={() =>
                                    handleSelectedItemsChangeCurrency(
                                      el,
                                      'item'
                                    )
                                  }
                                  cursor={'pointer'}
                                  _hover={{
                                    backgroundColor:
                                      'rgba(249, 247, 242, 1)',
                                  }}
                                >
                                  <Flex
                                    flexDir="row"
                                    justifyContent={'space-between'}
                                  >
                                    {/* <Badge rounded={'full'} p={'2px 5px'} fontSize={'12px'}>{el.Code}</Badge> */}
                                    <Box>
                                      <Flex
                                        alignItems={'center'}
                                        flexDir="row"
                                      >
                                        <Badge
                                          fontWeight={400}
                                          rounded={'md'}
                                          p={'2px 5px'}
                                          variant={'outline'}
                                          color={'#FF4C02'}
                                          colorScheme={'blue'}
                                        >
                                          {el.code}
                                        </Badge>
                                        <Text
                                          mx={'5px'}
                                          fontSize={'12px'}
                                          textTransform={'capitalize'}
                                        >
                                          {el.currency?.toLowerCase()}
                                        </Text>
                                      </Flex>
                                    </Box>
                                  </Flex>
                                </Box>
                              );
                            }
                          )}
                        </Box>
                      </VStack>
                    )}
                </Box>
              </Center>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ) : (
        <Box w={'100%'}>
          <Input
            color={'gray.500'}
            as={'button'}
            placeholder={'Select Country'}
            w={'96%'}
            fontSize={'14px'}
            mx={'10px'}
            textAlign={'left'}
            border="1px"
            borderColor="#E9E9E9"
            _focus={{ outline: 'none' }}
          >
            Select Currency
          </Input>
        </Box>
      )}
    </Box>
  );
};

const PackageItems: React.FC<IPropsPackageItems> = ({
  getData,
  currentPackageData,
  setCurrentPackageData,
  packageData,
  index,
  removePackage,
  removeLoad,
  animateNewContainer,
  setValidationTotalCustomValue,
  setValidationComoditiesItemWeight,
  setValidationTotalDeclareValue,
  setValidationComoditiesItemQuantity,
  validationComoditiesItemQuantity,
  newItems,
  itemBook,
  form,
  control,
  updateItems,
  updateItemLoad,
}) => {
  const [coverAmount, setCoverAmmount] = useState('1');
  const [boxWidth, setBoxWidth] = useState<string>('50%');

  useEffect(() => {
    if (index !== 0) {
      animateNewContainer.onOpen();
    }
  }, [index]);

  useEffect(() => {
    getBoxWidth();
  }, [currentPackageData?.is_declare_value]);

  const getBoxWidth = () => {
    const widthBox =
      currentPackageData?.is_declare_value === 'No' ? '50%' : '30%';
    setBoxWidth(widthBox);
  };

  const updateContainer = async (val: any, type: any) => {
    let newPackItems: any = [];
    let numberOfPackage: any = 0;

    let allPackage =
      currentPackageData?.relation_shipment_package_comodities_items;
    let shipmentPackage =
      currentPackageData?.relation_myshopment_package_items;

    if (type === 'sum') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.quantity = Number(val);
          newPackItems.push(el);
        } else {
          newPackItems.push(el);
        }
      });
    } else if (type === 'weight') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.weight = Number(val);
          newPackItems.push(el);
        } else {
          newPackItems.push(el);
        }
      });
    } else if (type === 'desc') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.item_description = val;
          newPackItems.push(el);
        } else {
          newPackItems.push(el);
        }
      });
    } else if (type === 'hs') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.harmonized_code = val;
          newPackItems.push(el);
        } else {
          newPackItems.push(el);
        }
      });
    } else if (type === 'cs') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.custom_value = val;
          newPackItems.push(el);
        } else {
          newPackItems.push(el);
        }
      });
    }

    setCurrentPackageData({
      ...currentPackageData,
      relation_shipment_package_comodities_items: newPackItems,
    });

    const validatePack = validatePackage(
      currentPackageData,
      newPackItems,
      'item'
    );

    setValidationComoditiesItemWeight(validatePack?.itemTotalWeight);
    setValidationTotalCustomValue(validatePack?.itemTotalCustomValue);

    // await getData();
  };

  return (
    <Box>
      {index === 0 ? (
        <Box>
          {!removeLoad && !updateItemLoad ? (
            <VStack alignItems={'start'}>
              <Flex w={'100%'} justifyContent={'space-between'}>
                <Box mb={'20px'} fontWeight={600} fontSize={'16px'}>
                  {' '}
                  Item {index + 1}
                </Box>
                <Box>
                  <Box>
                    {index != 0 && (
                      <Box>
                        <Button
                          _hover={{
                            color: '#FFEDE6',
                            backgroundColor: '#E53E3E',
                          }}
                          boxShadow={'lg'}
                          onClick={(val: any) => {
                            removePackage(index);
                          }}
                          fontSize={'16px'}
                          color={'#E53E3E'}
                          leftIcon={<CgClose color={'#E53E3E'} />}
                          bg={'#FFEDE6'}
                        >
                          Remove
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Flex>

              <Flex w={'100%'} gap={5}>
                <Box w={'50%'}>
                  {itemBook && itemBook.length > 0 ? (
                    <FormControl>
                      <FormLabel fontWeight={600}>
                        Use Saved Item
                      </FormLabel>
                      <Controller
                        {...form.register(
                          `shipping.currentItemBook${index}`
                        )}
                        name={`shipping.currentItemBook${index}`}
                        control={control}
                        render={({
                          field: { onChange, value, name, ref },
                        }) => {
                          const itemBookOption = itemBook?.map(
                            (el: any) => {
                              return {
                                value: el.item_description,
                                label: `${el.item_description} - ${el.harmonized_code}`,
                                id: el.id,
                                data: el,
                              };
                            }
                          );

                          itemBookOption.sort();

                          const currentItemSelection =
                            itemBookOption.find(
                              (c: any) => c.value === value
                            );

                          const handleSelectChange = async (
                            selectedOption: any | null
                          ) => {
                            let newPackage = [];
                            let allPackage =
                              currentPackageData?.relation_shipment_package_comodities_items;

                            for (
                              let index = 0;
                              index < allPackage.length;
                              index++
                            ) {
                              const element = allPackage[index];

                              if (element.id === packageData.id) {
                                newPackage.push({
                                  id: element.id,
                                  relation_shipment_package_comodities:
                                    element.relation_shipment_package_comodities,
                                  lookup_currency_code:
                                    element.lookup_currency_code,
                                  lookup_currency:
                                    element.lookup_currency,
                                  country_manufacture:
                                    element.country_manufacture,
                                  country_code: element.country_code,
                                  created_at: element.created_at,
                                  updated_at: element.updated_at,
                                  weight_and_value:
                                    element.weight_and_value,
                                  harmonized_code:
                                    selectedOption?.data
                                      ?.harmonized_code,
                                  custom_value:
                                    selectedOption?.data
                                      ?.custom_value,
                                  quantity:
                                    selectedOption?.data?.quantity,
                                  weight:
                                    selectedOption?.data?.weight,
                                  item_description:
                                    selectedOption?.data
                                      ?.item_description,
                                });
                              } else {
                                newPackage.push(element);
                              }
                            }
                            await updateItems(newPackage);
                          };
                          return (
                            <Select
                              className="basic-single"
                              classNamePrefix="select"
                              placeholder="Select From your Address Book"
                              isClearable
                              isSearchable
                              options={itemBookOption}
                              onChange={handleSelectChange}
                              value={currentItemSelection}
                            />
                          );
                        }}
                      />
                    </FormControl>
                  ) : (
                    <></>
                  )}
                </Box>

                <Box w={'50%'}>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600} mb={'10px'}>
                      Item Descriptions
                    </FormLabel>
                    <Stack spacing={3}>
                      <Input
                        _placeholder={{
                          opacity: 1,
                          color: 'gray.500',
                        }}
                        fontSize="12px"
                        onChange={(e: any) => {
                          updateContainer(e.target.value, `desc`);
                        }}
                        defaultValue={packageData?.item_description}
                        _focus={{ outline: 'none' }}
                        placeholder="Enter a detailed item description (one item at a time)"
                      />
                    </Stack>
                  </FormControl>
                </Box>
              </Flex>

              <Flex
                w={'100%'}
                justifyContent={'space-between'}
                gap={5}
              >
                <Box w={'33%'}>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600} mb={'10px'}>
                      Quantity
                    </FormLabel>
                    <InputGroup size="sm">
                      <NumberInput
                        w={'100%'}
                        onChange={(val: any) =>
                          updateContainer(val, 'sum')
                        }
                        step={1}
                        defaultValue={packageData?.quantity}
                        min={1}
                      >
                        <NumberInputField
                          _focus={{ outline: 'none' }}
                        />
                      </NumberInput>
                      <InputRightAddon
                        backgroundColor={'#f5f5f5'}
                        fontWeight={600}
                        children={'pc'}
                      />
                    </InputGroup>
                  </FormControl>
                </Box>

                <Box w={'33%'}>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600} mb={'10px'}>
                      Unit Weight
                    </FormLabel>
                    <InputGroup size="sm">
                      <NumberInput
                        w={'100%'}
                        borderColor={'A2A2A2'}
                        onChange={(val: any) => {
                          updateContainer(val, 'weight');
                        }}
                        min={0.01}
                        max={68}
                        defaultValue={Number(packageData?.weight)}
                        precision={2}
                        step={0.01}
                      >
                        <NumberInputField
                          _focus={{ outline: 'none' }}
                        />
                      </NumberInput>
                      <InputRightAddon
                        backgroundColor={'#f5f5f5'}
                        fontWeight={600}
                        children={'kg'}
                      />
                    </InputGroup>
                  </FormControl>
                </Box>

                <Box w={'33%'}>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600} mb={'10px'}>
                      Unit Value
                    </FormLabel>
                    <InputGroup size="sm">
                      <NumberInput
                        w={'100%'}
                        border={
                          '1px solid var(--chakra-colors-gray-200)'
                        }
                        onChange={(val: any) => {
                          updateContainer(val, 'cs');
                        }}
                        borderRadius={'md'}
                        defaultValue={Number(
                          packageData?.custom_value
                        )}
                      >
                        <NumberInputField
                          fill={'rgb(231, 231, 231)'}
                          _focus={{ outline: 'none' }}
                        />
                      </NumberInput>
                      {currentPackageData?.is_declare_value ===
                        'Yes' && (
                        <InputRightAddon
                          backgroundColor={'#f5f5f5'}
                          fontWeight={600}
                          children={
                            currentPackageData?.lookup_currency_code
                          }
                        />
                      )}
                    </InputGroup>
                  </FormControl>
                </Box>
              </Flex>

              <Flex gap={5} w={'100%'}>
                <Box w={'50%'}>
                  <FormControl>
                    <FormLabel fontWeight={600} mb={'10px'}>
                      HS Code
                    </FormLabel>
                    <Stack spacing={3}>
                      <Input
                        _placeholder={{
                          opacity: 1,
                          color: 'gray.500',
                        }}
                        fontSize="12px"
                        onChange={(e: any) => {
                          updateContainer(e.target.value, `hs`);
                        }}
                        defaultValue={packageData?.harmonized_code}
                        _focus={{ outline: 'none' }}
                        placeholder="Enter the item HS code for a faster customs clearence"
                      />
                    </Stack>
                  </FormControl>
                </Box>
                <Box w={'50%'}>
                  <FormLabel fontWeight={600} mb={'10px'}>
                    Country of Origin
                  </FormLabel>
                  <Stack spacing={3}>
                    <Input
                      fontWeight={600}
                      backgroundColor={'#F5F5F5'}
                      _placeholder={{ opacity: 1, color: 'gray.500' }}
                      fontSize="12px"
                      defaultValue={packageData?.country_manufacture}
                      _focus={{ outline: 'none' }}
                      placeholder="Country / Teritory of Manufacture"
                      disabled={true}
                    />
                  </Stack>
                </Box>
              </Flex>
            </VStack>
          ) : (
            <LoaderItem />
          )}
        </Box>
      ) : (
        <ScaleFade initialScale={0.9} in={animateNewContainer.isOpen}>
          <Box>
            {!removeLoad && !updateItemLoad ? (
              <VStack alignItems={'start'}>
                <Flex w={'100%'} justifyContent={'space-between'}>
                  <Box mb={'20px'} fontWeight={600} fontSize={'16px'}>
                    {' '}
                    Item {index + 1}
                  </Box>
                  <Box>
                    <Box>
                      {index != 0 && (
                        <Box>
                          <Button
                            _hover={{
                              color: '#FFEDE6',
                              backgroundColor: '#E53E3E',
                            }}
                            boxShadow={'lg'}
                            onClick={(val: any) => {
                              removePackage(index);
                            }}
                            fontSize={'16px'}
                            color={'#E53E3E'}
                            leftIcon={<CgClose color={'#E53E3E'} />}
                            bg={'#FFEDE6'}
                          >
                            Remove
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Flex>

                <Flex w={'100%'} gap={5}>
                  <Box w={'50%'}>
                    {itemBook && itemBook.length > 0 ? (
                      <FormControl>
                        <FormLabel fontWeight={600}>
                          Use Saved Item
                        </FormLabel>
                        <Controller
                          {...form.register(
                            `shipping.currentItemBook${index}`
                          )}
                          name={`shipping.currentItemBook${index}`}
                          control={control}
                          render={({
                            field: { onChange, value, name, ref },
                          }) => {
                            const itemBookOption = itemBook?.map(
                              (el: any) => {
                                return {
                                  value: el.item_description,
                                  label: `${el.item_description} - ${el.harmonized_code}`,
                                  id: el.id,
                                  data: el,
                                };
                              }
                            );

                            itemBookOption.sort();

                            const currentItemSelection =
                              itemBookOption.find(
                                (c: any) => c.value === value
                              );

                            const handleSelectChange = async (
                              selectedOption: any | null
                            ) => {
                              let newPackage = [];
                              let allPackage =
                                currentPackageData?.relation_shipment_package_comodities_items;

                              for (
                                let index = 0;
                                index < allPackage.length;
                                index++
                              ) {
                                const element = allPackage[index];

                                if (element.id === packageData.id) {
                                  newPackage.push({
                                    id: element.id,
                                    relation_shipment_package_comodities:
                                      element.relation_shipment_package_comodities,
                                    lookup_currency_code:
                                      element.lookup_currency_code,
                                    lookup_currency:
                                      element.lookup_currency,
                                    country_manufacture:
                                      element.country_manufacture,
                                    country_code:
                                      element.country_code,
                                    created_at: element.created_at,
                                    updated_at: element.updated_at,
                                    weight_and_value:
                                      element.weight_and_value,
                                    harmonized_code:
                                      selectedOption?.data
                                        ?.harmonized_code,
                                    custom_value:
                                      selectedOption?.data
                                        ?.custom_value,
                                    quantity:
                                      selectedOption?.data?.quantity,
                                    weight:
                                      selectedOption?.data?.weight,
                                    item_description:
                                      selectedOption?.data
                                        ?.item_description,
                                  });
                                } else {
                                  newPackage.push(element);
                                }
                              }
                              await updateItems(newPackage);
                            };
                            return (
                              <Select
                                className="basic-single"
                                classNamePrefix="select"
                                placeholder="Select From your Address Book"
                                isClearable
                                isSearchable
                                options={itemBookOption}
                                onChange={handleSelectChange}
                                value={currentItemSelection}
                              />
                            );
                          }}
                        />
                      </FormControl>
                    ) : (
                      <></>
                    )}
                  </Box>

                  <Box w={'50%'}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600} mb={'10px'}>
                        Item Descriptions
                      </FormLabel>
                      <Stack spacing={3}>
                        <Input
                          _placeholder={{
                            opacity: 1,
                            color: 'gray.500',
                          }}
                          fontSize="12px"
                          onChange={(e: any) => {
                            updateContainer(e.target.value, `desc`);
                          }}
                          defaultValue={packageData?.item_description}
                          _focus={{ outline: 'none' }}
                          placeholder="Enter a detailed item description (one item at a time)"
                        />
                      </Stack>
                    </FormControl>
                  </Box>
                </Flex>

                <Flex
                  w={'100%'}
                  justifyContent={'space-between'}
                  gap={5}
                >
                  <Box w={'33%'}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600} mb={'10px'}>
                        Quantity
                      </FormLabel>
                      <InputGroup size="sm">
                        <NumberInput
                          w={'100%'}
                          onChange={(val: any) =>
                            updateContainer(val, 'sum')
                          }
                          step={1}
                          defaultValue={packageData?.quantity}
                          min={1}
                        >
                          <NumberInputField
                            _focus={{ outline: 'none' }}
                          />
                        </NumberInput>
                        <InputRightAddon
                          backgroundColor={'#f5f5f5'}
                          fontWeight={600}
                          children={'pc'}
                        />
                      </InputGroup>
                    </FormControl>
                  </Box>

                  <Box w={'33%'}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600} mb={'10px'}>
                        Unit Weight
                      </FormLabel>
                      <InputGroup size="sm">
                        <NumberInput
                          w={'100%'}
                          borderColor={'A2A2A2'}
                          onChange={(val: any) => {
                            updateContainer(val, 'weight');
                          }}
                          min={0.01}
                          max={68}
                          defaultValue={Number(packageData?.weight)}
                          precision={2}
                          step={0.01}
                        >
                          <NumberInputField
                            _focus={{ outline: 'none' }}
                          />
                        </NumberInput>
                        <InputRightAddon
                          backgroundColor={'#f5f5f5'}
                          fontWeight={600}
                          children={'kg'}
                        />
                      </InputGroup>
                    </FormControl>
                  </Box>

                  <Box w={'33%'}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600} mb={'10px'}>
                        Unit Value
                      </FormLabel>
                      <InputGroup size="sm">
                        <NumberInput
                          w={'100%'}
                          border={
                            '1px solid var(--chakra-colors-gray-200)'
                          }
                          onChange={(val: any) => {
                            updateContainer(val, 'cs');
                          }}
                          borderRadius={'md'}
                          defaultValue={Number(
                            packageData?.custom_value
                          )}
                        >
                          <NumberInputField
                            fill={'rgb(231, 231, 231)'}
                            _focus={{ outline: 'none' }}
                          />
                        </NumberInput>
                        {currentPackageData?.is_declare_value ===
                          'Yes' && (
                          <InputRightAddon
                            backgroundColor={'#f5f5f5'}
                            fontWeight={600}
                            children={
                              currentPackageData?.lookup_currency_code
                            }
                          />
                        )}
                      </InputGroup>
                    </FormControl>
                  </Box>
                </Flex>

                <Flex gap={5} w={'100%'}>
                  <Box w={'50%'}>
                    <FormControl>
                      <FormLabel fontWeight={600} mb={'10px'}>
                        HS Code
                      </FormLabel>
                      <Stack spacing={3}>
                        <Input
                          _placeholder={{
                            opacity: 1,
                            color: 'gray.500',
                          }}
                          fontSize="12px"
                          onChange={(e: any) => {
                            updateContainer(e.target.value, `hs`);
                          }}
                          defaultValue={packageData?.harmonized_code}
                          _focus={{ outline: 'none' }}
                          placeholder="Enter the item HS code for a faster customs clearence"
                        />
                      </Stack>
                    </FormControl>
                  </Box>
                  <Box w={'50%'}>
                    <FormLabel fontWeight={600} mb={'10px'}>
                      Country of Origin
                    </FormLabel>
                    <Stack spacing={3}>
                      <Input
                        backgroundColor={'#f5f5f5'}
                        fontWeight={600}
                        _placeholder={{
                          opacity: 1,
                          color: 'gray.500',
                        }}
                        fontSize="12px"
                        defaultValue={
                          packageData?.country_manufacture
                        }
                        _focus={{ outline: 'none' }}
                        placeholder="Country / Teritory of Manufacture"
                        disabled={true}
                        // variant='filled'
                      />
                    </Stack>
                  </Box>
                </Flex>
              </VStack>
            ) : (
              <LoaderItem />
            )}
          </Box>
        </ScaleFade>
      )}
    </Box>
  );
};

const UserInformationForm: React.FC<IPropsUserInformation> = ({
  watch,
  platformType,
  countryData,
  stateData,
  setSelectSenderStateMode,
  setSelectReceiverStateMode,
  selectSenderStateMode,
  selectReceiverStateMode,
  setSenderCountryCode,
  setReceiverCountryCode,
  senderCountryCode,
  receiverCountryCode,
  countryDefault,
  packageTypeDefault,
  receiverDataDefault,
  form,
  updateFormShipment,
  setCurrentPackageData,
  currentPackageData,
  pageIsLoading,
  animateCoverBox,
  animateCoverBoxCurrency,
  currencyData,
  currencyCodePopover,
  setSearchCurrency,
  customSelectedItemsCurrency,
  searchCurrencyLoad,
  filteredCurrency,
  handleSelectedItemsChangeCurrency,
  animateContainerBox,
  setValidationTotalDeclareValue,
  setValidationTotalWeight,
  setValidationNumberOfPackage,
  animateNewContainer,
  userData,
  removeLoad,
  removePackage,
  removeItems,
  newYourPackaging,
  currencyCodePopoverItem,
  setValidationTotalCustomValue,
  setValidationComoditiesItemWeight,
  searchItemBookLoad,
  setSearchItemBook,
  itemBook,
  itemBookPopover,
  customSelectedItemsBook,
  filterItemBook,
  validationNumberOfPackage,
  validationTotalWeight,
  validationComoditiesItemWeight,
  validationTotalCustomValue,
  boxIsLoading,
  validatePrintLabel,
  shipmentData,
  updatePackage,
  // printLabel,
  getRate,
  loading,
  createInvoice,
  fedexPDFToQore,
  urshipperRate,
  handleSelectedItemBook,
  addFromBook,
  newItems,
  allAddressBook,
  receiverCountryDefault,
  currencyDefault,
  validationTotalDeclareValue,
  setSubmitType,
  setValidationActualTotalWeight,
  validationTotalActualWeight,
  setValidationComoditiesItemQuantity,
  validationComoditiesItemQuantity,
  updateItems,
  updateItemLoad,
  membership,
  handleSelectedFedexAccount,
  fedexAccount,
}) => {
  const { control, getValues, getFieldState, resetField } = useForm();
  const [receiverDefaultValue, setReceiverDefaultValue] =
    useState<string>('');
  const [receiverStateDefaultValue, setReceiverStateDefaultValue] =
    useState<string>('');
  const [currencyDefaultValue, setCurrencyDefaultValue] =
    useState<string>('');
  const [packageTypeDefaultValue, setPackageTypeDefaultValue] =
    useState<string>('');
  const [image, setImage] = useState<any>('');
  const [uploadedFile, setUploadedFile] = useState<any>();
  const [uploadedFileSize, setUploadedFileSize] = useState<any>();
  const [loadFile, setLoadFile] = useState<Boolean>(false);
  const [fileError, setFileError] = useState<boolean>(false);

  useEffect(() => {
    if (currentPackageData?.attachment_file) {
      setUploadedFile(currentPackageData?.attachment_file);
    }
  }, [currentPackageData?.attachment_file]);

  useEffect(() => {
    if (receiverCountryDefault) {
      setReceiverDefaultValue(receiverCountryDefault);
    }
  }, [receiverCountryDefault]);

  useEffect(() => {
    if (receiverDataDefault) {
      setReceiverStateDefaultValue(receiverDataDefault);
    }
  }, [receiverDataDefault]);

  useEffect(() => {
    if (currencyDefault) {
      setCurrencyDefaultValue(currencyDefault);
    }
  }, [currencyDefault]);

  useEffect(() => {
    if (packageTypeDefault) {
      setPackageTypeDefaultValue(packageTypeDefault);
    }
  }, [packageTypeDefault]);

  const submitTypeSettings = (val: any) => {
    setSubmitType(val);
  };

  function encodeImageFileAsURL(element: any) {
    try {
      setFileError(false);
      setLoadFile(true);
      let file = element.files[0];
      if (file.size > 5000000) {
        throw { name: 'File too Big' };
      }

      setUploadedFile(file);

      form.setValue('shipping.file', {
        file,
      });

      let reader = new FileReader();
      reader.onloadend = function () {
        setImage(reader.result);
      };

      reader.readAsDataURL(file);
      setLoadFile(false);
    } catch (error: any) {
      if (error.name === 'File too Big') {
        // onClose();
      }
      setLoadFile(false);
      setFileError(true);
    }
  }

  useEffect(() => {
    if (image != '') {
      form.setValue('shipping.attach_img_url', {
        attach_img_url: image,
      });
    }
  }, [image]);

  useEffect(() => {
    if (uploadedFile?.name != '' || uploadedFile?.filename) {
      const size = formatBytes(uploadedFile?.size);
      setUploadedFileSize(size);
    }
  }, [uploadedFile?.name, uploadedFile?.filename]);

  function formatBytes(bytes: any) {
    if (!+bytes) return '0 Bytes';
    const decimals = 2;
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [
      'Bytes',
      'KB',
      'MB',
      'GB',
      'TiB',
      'PiB',
      'EiB',
      'ZiB',
      'YiB',
    ];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${
      sizes[i]
    }`;
  }

  const removeFile = () => {
    setUploadedFile({});
  };

  const testing = watch();

  // TODO: for radio
  const list = ['one', 'two', 'three'];
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'test',
    // defaultValue: 'two',
    onChange: (value) => handleSelectedFedexAccount(value),
  });
  // TODO: for radio

  const group = getRootProps();

  function groupByMember(arr: any) {
    // Sort the array by the 'priority' property in ascending order
    const sortedArray = arr.sort(
      (a: any, b: any) => a.priority - b.priority
    );

    // Group the sorted array by the 'membership' property
    const grouped = sortedArray.reduce((result: any, obj: any) => {
      const key = obj.membership;
      (result[key] || (result[key] = [])).push(obj);
      return result;
    }, {});

    return Object.values(grouped);
  }

  console.log('urshipperRate >>>>>>>', urshipperRate);

  const groupedByMember = groupByMember(urshipperRate);

  console.log(groupedByMember, `groupedByMember`);

  const watchSenderForm = useWatch({
    control: form.control,
    name: 'sender',
  });

  const watchReceiverForm = useWatch({
    control: form.control,
    name: 'receiver',
  });

  const [senderCompleted, setSenderCompleted] = useState(false);
  const [receiverCompleted, setReceiverCompleted] = useState(false);
  const [itemsCompleted, setItemsCompleted] = useState(false);
  const [packageCompleted, setPackageCompleted] = useState(false);
  const [ratesCompleted, setRatesCompleted] = useState(false);

  useEffect(() => {
    if (
      watchSenderForm.fullname &&
      watchSenderForm.company &&
      watchSenderForm.phone_number &&
      watchSenderForm.email &&
      watchSenderForm.streetLine1 &&
      watchSenderForm.city &&
      watchSenderForm.state &&
      watchSenderForm.zipCode
    ) {
      setSenderCompleted(true);
    } else {
      setSenderCompleted(false);
    }
  }, [watchSenderForm]);

  useEffect(() => {
    if (
      watchReceiverForm.fullname &&
      watchReceiverForm.company &&
      watchReceiverForm.phone_number &&
      watchReceiverForm.email &&
      watchReceiverForm.streetLine1 &&
      watchReceiverForm.city &&
      watchReceiverForm.stateString &&
      watchReceiverForm.zipCode
    ) {
      setReceiverCompleted(true);
    } else {
      setReceiverCompleted(false);
    }
  }, [watchReceiverForm]);

  useEffect(() => {
    if (fedexAccount) {
      setRatesCompleted(true);
    } else {
      setRatesCompleted(false);
    }
  }, [fedexAccount]);

  // // TODO: apear on windows
  const senderSectionRef = useRef<HTMLDivElement>(null);
  const receiverSectionRef = useRef<HTMLDivElement>(null);
  const itemsSectionRef = useRef<HTMLDivElement>(null);
  const packageSectionRef = useRef<HTMLDivElement>(null);
  const packageSectionTopRef = useRef<HTMLDivElement>(null);
  const ratesSectionRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   // @ts-ignore
  //   const handleIntersection = (entries, observer) => {
  //     // @ts-ignore
  //     entries.forEach((entry) => {
  //       if (entry.isIntersecting) {
  //         // The target element is now visible in the viewport
  //         console.log('Element is visible:', entry.target);

  //         // Add your logic here, e.g., add a class to the element
  //         // entry.target.classList.add('visible');

  //         // Stop observing after the element becomes visible if needed
  //         // observer.unobserve(entry.target);
  //       }
  //     });
  //   };

  //   const options = {
  //     root: null,
  //     rootMargin: '0px',
  //     threshold: 0.5,
  //   };

  //   const observer = new IntersectionObserver(
  //     handleIntersection,
  //     options
  //   );

  //   // Start observing the target element
  //   if (senderSectionRef.current) {
  //     observer.observe(senderSectionRef.current);
  //   }

  //   // Cleanup the observer when the component unmounts
  //   return () => {
  //     if (senderSectionRef.current) {
  //       observer.unobserve(senderSectionRef.current);
  //     }
  //   };
  // }, []); // Empty dependency array ensures the effect runs only once

  const [selectedSection, setSelectedSection] = useState<number>(0);
  // Use useRef to store the previous value
  const prevCountRef = useRef(0);

  useEffect(() => {
    // Update the previous value after each render
    prevCountRef.current = selectedSection;
  }, [selectedSection]);

  useEffect(() => {
    const handleIntersection = (entries: any, observer: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          if (entry.target.id) {
            const extractedNumber = parseInt(
              entry.target.id.match(/\d+/)[0],
              10
            );

            console.log('extractedNumber', extractedNumber);
            console.log('selectedSection', prevCountRef.current);

            if (
              prevCountRef.current === 4 &&
              extractedNumber === 31
            ) {
              setSelectedSection(3);
            } else if (
              prevCountRef.current === 2 &&
              extractedNumber === 31
            ) {
              //  do nothing.
            } else {
              setSelectedSection(extractedNumber);
            }
          }
        }
      });
    };

    const options = {
      root: null,
      rootMargin: '300px 0px 0px 0px',
      threshold: 0.5,
    };

    const observer = new IntersectionObserver(
      handleIntersection,
      options
    );

    // Start observing all target elements
    [
      senderSectionRef,
      receiverSectionRef,
      itemsSectionRef,
      packageSectionRef,
      packageSectionTopRef,
      ratesSectionRef,
    ].forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    // Cleanup the observer when the component unmounts
    return () => {
      [
        senderSectionRef,
        receiverSectionRef,
        itemsSectionRef,
        packageSectionRef,
        packageSectionTopRef,
        ratesSectionRef,
      ].forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [
    senderSectionRef,
    receiverSectionRef,
    itemsSectionRef,
    packageSectionRef,
    packageSectionTopRef,
    ratesSectionRef,
  ]);

  // TODO: >>>>>>>>>>>>>>>>> >>>>>>>>>>>>>>>>> >>>>>>>>>>>>>>>>> >>>>>>>>>>>>>>>>> >>>>>>>>>>>>>>>>> >>>>>>>>>>>>>>>>>
  console.log(
    '>>>>>>>> package',
    currentPackageData.relation_myshopment_package_items
  );

  return (
    <HStack alignItems={'flex-start'}>
      <Box id="section-0">
        <form
          onSubmit={form.handleSubmit((values: any) => {
            updateFormShipment(values);
          })}
        >
          <Box
            id="section-0"
            borderColor={'green.400'}
            my={'20px'}
            boxShadow={'lg'}
            position={'relative'}
            p={'20px'}
            backgroundColor={'white'}
          >
            <Box id="section-0-ref" ref={senderSectionRef} />
            <Box p={'20px'}>
              <Flex gap={2} pb={'20px'} flexDirection={['column']}>
                <Box
                  fontSize={'24px'}
                  fontWeight={700}
                  flex="1"
                  textAlign="left"
                >
                  Sender
                </Box>
                <Box pr={'10px'} w={'50%'} mt={'10px'}>
                  <FormControl>
                    <Controller
                      {...form.register(`sender.addressSelection`)}
                      name={`sender.addressSelection`}
                      control={control}
                      render={({
                        field: { onChange, value, name, ref },
                      }) => {
                        const addressOption = allAddressBook?.map(
                          (el: any) => {
                            return {
                              value: el.full_name,
                              label: `${el.full_name} - ${el.company}`,
                              id: el.id,
                            };
                          }
                        );

                        addressOption.sort();

                        const currentSelection = addressOption.find(
                          (c: any) => c.value === value
                        );

                        const handleSelectChange = (
                          selectedOption: any | null
                        ) => {
                          if (selectedOption) {
                            const selectedAddress =
                              allAddressBook.filter(
                                (c: any) => c.id === selectedOption.id
                              );

                            form.setValue('sender', {
                              fullname: selectedAddress[0]?.full_name,
                              company: selectedAddress[0]?.company,
                              phone_number:
                                selectedAddress[0]?.phone_number,
                              email: selectedAddress[0]?.email,
                              streetLine1:
                                selectedAddress[0]?.street_line_1,
                              streetLine2:
                                selectedAddress[0]?.street_line_2,
                              streetLine3:
                                selectedAddress[0]?.street_line_3,
                              city: selectedAddress[0]?.city,
                              state: selectedAddress[0]?.state,
                              zipCode: selectedAddress[0]?.zip_code,
                              vat_tax_id:
                                selectedAddress[0]?.vat_tax_id,
                            });
                            onChange(selectedOption);
                          } else {
                            form.setValue('sender', {
                              fullname: '',
                              company: '',
                              phone_number: '',
                              email: '',
                              streetLine1: '',
                              streetLine2: '',
                              streetLine3: '',
                              city: '',
                              state: '',
                              zipCode: '',
                              vat_tax_id: '',
                            });
                            onChange(selectedOption);
                          }
                        };
                        return (
                          <Select
                            className="basic-single"
                            classNamePrefix="select"
                            placeholder="Select From your Address Book"
                            isClearable
                            isSearchable
                            options={addressOption}
                            onChange={handleSelectChange}
                            value={currentSelection}
                          />
                        );
                      }}
                      rules={{
                        required: true,
                      }}
                    />
                  </FormControl>
                </Box>
              </Flex>

              <Stack spacing={3}>
                <Flex gap={5} flexDir={['column', 'column', 'row']}>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600}>
                      Person or Trade Name
                    </FormLabel>
                    <Input
                      {...form.register(`sender.fullname`, {
                        required: true,
                        maxLength: 21,
                      })}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600}>
                      Legal Business Name
                    </FormLabel>
                    <Input
                      {...form.register(`sender.company`, {
                        maxLength: 100,
                      })}
                    />
                  </FormControl>
                </Flex>
                <Flex gap={5} flexDir={['column', 'column', 'row']}>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600}>Phone</FormLabel>
                    <Input
                      {...form.register(`sender.phone_number`, {
                        required: true,
                      })}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600}>Email</FormLabel>
                    <Input
                      {...form.register(`sender.email`, {
                        required: true,
                      })}
                    />
                  </FormControl>
                </Flex>
                <Spacer />
                <Stack gap={5} display={['block']}>
                  <FormControl isRequired>
                    <HStack alignItems={'center'}>
                      <FormLabel fontWeight={600}>Address </FormLabel>
                      <Box
                        fontWeight={100}
                        fontStyle={'italic'}
                        fontSize={'10px'}
                        mb={'8px'}
                      >{`(34 max Character)`}</Box>
                    </HStack>
                    <Input
                      {...form.register(`sender.streetLine1`, {
                        maxLength: 30,
                        required: true,
                      })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel
                      fontWeight={600}
                    >{`Address (Line 2)`}</FormLabel>
                    <Input
                      {...form.register(`sender.streetLine2`, {
                        maxLength: 30,
                      })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel
                      fontWeight={600}
                    >{`Address (Line 3)`}</FormLabel>
                    <Input
                      {...form.register(`sender.streetLine3`, {
                        maxLength: 30,
                      })}
                    />
                  </FormControl>
                </Stack>
                <Spacer />
                <Flex gap={5} display={['block', 'block', 'flex']}>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600}>Country</FormLabel>
                    <Controller
                      {...form.register(`sender.country`)}
                      name={`sender.country`}
                      control={control}
                      render={({
                        field: { onChange, value, name, ref },
                      }) => {
                        const countryOptions = countryData?.map(
                          (el) => {
                            return {
                              value: el.country,
                              label: `${el.code} - ${el.country}`,
                              id: el.id,
                              code: el.code,
                            };
                          }
                        );

                        countryOptions.push({
                          id: countryOptions.length + 1,
                          label: 'ID - Indonesia',
                          value: 'Indonesia',
                          code: 'ID',
                        });

                        countryOptions.sort();
                        const defaultOption = countryOptions.filter(
                          (el: any) => el.value == countryDefault
                        );
                        const defaultOptionIndex =
                          countryOptions.indexOf(defaultOption[0]);

                        const currentSelection = countryOptions.find(
                          (c) => c.value === value
                        );

                        const handleSelectChange = (
                          selectedOption: any | null
                        ) => {
                          setSenderCountryCode(selectedOption?.code);

                          if (
                            selectedOption?.code === 'US' ||
                            selectedOption?.code === 'CA'
                          ) {
                            setSelectSenderStateMode(true);
                          } else {
                            setSelectSenderStateMode(false);
                          }

                          const country = selectedOption;
                          form.setValue('sender.country', country);
                          onChange(selectedOption);
                        };

                        return (
                          <Select
                            isDisabled={
                              platformType == 'client' ? true : false
                            }
                            className="basic-single CustomStyle"
                            classNamePrefix="select"
                            placeholder="Select country"
                            isClearable
                            isSearchable
                            options={countryOptions}
                            defaultValue={
                              countryOptions[defaultOptionIndex]
                            }
                            onChange={handleSelectChange}
                            value={currentSelection}
                            styles={{
                              control: (baseStyles, state) => ({
                                ...baseStyles,
                                backgroundColor: state.isDisabled
                                  ? '#F5f5f5'
                                  : 'transparent',
                                background: state.isDisabled
                                  ? '#F5f5f5'
                                  : 'transparent',
                              }),
                            }}
                          />
                        );
                      }}
                      rules={{
                        required: true,
                      }}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <HStack alignItems={'center'}>
                      <FormLabel fontWeight={600}>
                        Postal Code{' '}
                      </FormLabel>
                      <Box
                        fontWeight={100}
                        fontStyle={'italic'}
                        fontSize={'10px'}
                        mb={'8px'}
                      >{`(Insert 0000 if no zip code)`}</Box>
                    </HStack>
                    <Input
                      {...form.register(`sender.zipCode`, {
                        required: true,
                      })}
                    />
                  </FormControl>
                </Flex>

                {selectSenderStateMode ? (
                  <Flex gap={5} display={['block', 'block', 'flex']}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600}>State</FormLabel>
                      <Controller
                        {...form.register(`sender.state`)}
                        name={`sender.state`}
                        control={control}
                        render={({
                          field: { onChange, value, name, ref },
                        }) => {
                          const filteredOption = stateData?.filter(
                            (el: any) =>
                              el.country_code === senderCountryCode
                          );
                          const stateOption = filteredOption?.map(
                            (el: any) => {
                              return {
                                value: el.province,
                                label: `${el.code} - ${el.province} - ${el.country_name}`,
                                id: el.id,
                                code: el.code,
                                countryCode: el.country_code,
                              };
                            }
                          );

                          stateOption.sort();

                          const currentStateSelection =
                            stateOption.find(
                              (c: any) => c.value === value
                            );

                          const handleStateSelectChange = (
                            selectedOption: any | null
                          ) => {
                            const state = selectedOption;
                            form.setValue('sender.state', state);
                            onChange(selectedOption);
                          };

                          return (
                            <Select
                              isDisabled={
                                platformType == 'client'
                                  ? true
                                  : false
                              }
                              className="basic-single CustomStyle"
                              classNamePrefix="select"
                              placeholder="Select country"
                              isClearable
                              isSearchable
                              options={stateOption}
                              onChange={handleStateSelectChange}
                              value={currentStateSelection}
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: state.isDisabled
                                    ? '#F5f5f5'
                                    : 'transparent',
                                  background: state.isDisabled
                                    ? '#F5f5f5'
                                    : 'transparent',
                                }),
                              }}
                            />
                          );
                        }}
                        rules={{
                          required: true,
                        }}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600}>City</FormLabel>
                      <Input
                        {...form.register(`sender.city`, {
                          required: true,
                        })}
                      />
                    </FormControl>
                  </Flex>
                ) : (
                  <Flex gap={5} display={['block', 'block', 'flex']}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600}>State</FormLabel>
                      <Input
                        {...form.register(`sender.state`, {
                          required: true,
                        })}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600}>City</FormLabel>
                      <Input
                        {...form.register(`sender.city`, {
                          required: true,
                        })}
                      />
                    </FormControl>
                  </Flex>
                )}

                {/* <Flex gap={5} display={["block", "block", "flex"]}>
                <FormControl isRequired>
                  <FormLabel fontWeight={600}>State</FormLabel>
                  <Input
                    placeholder={`Sender state`}
                    {...form.register(`sender.state`, { required: true })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight={600}>City</FormLabel>
                  <Input
                    placeholder={`Sender city`}
                    {...form.register(`sender.city`, { required: true })}
                  />
                </FormControl>
              </Flex> */}
              </Stack>
            </Box>
          </Box>
          <Box
            id="section-1"
            borderColor={'green.400'}
            my={'20px'}
            boxShadow={'lg'}
            position={'relative'}
            p={'20px'}
            backgroundColor={'white'}
          >
            <Box p={'20px'}>
              <Flex pb={'20px'} flexDirection={['column']} gap={2}>
                <Box
                  fontSize={'24px'}
                  fontWeight={700}
                  as="span"
                  flex="1"
                  textAlign="left"
                >
                  Receiver
                </Box>
                <Box pr={'10px'} w={'50%'} mt={'10px'}>
                  <FormControl>
                    <Controller
                      {...form.register(`receiver.addressSelection`)}
                      name={`receiver.addressSelection`}
                      control={control}
                      render={({
                        field: { onChange, value, name, ref },
                      }) => {
                        const addressOption = allAddressBook?.map(
                          (el: any) => {
                            return {
                              value: el.full_name,
                              label: `${el.full_name} - ${el.company}`,
                              id: el.id,
                            };
                          }
                        );

                        addressOption.sort();

                        const currentSelection = addressOption.find(
                          (c: any) => c.value === value
                        );

                        const handleSelectChange = (
                          selectedOption: any | null
                        ) => {
                          if (selectedOption) {
                            const selectedAddress =
                              allAddressBook.filter(
                                (c: any) => c.id === selectedOption.id
                              );

                            const countryOptions = countryData?.map(
                              (el) => {
                                return {
                                  value: el.country,
                                  label: `${el.code} - ${el.country}`,
                                  id: el.id,
                                };
                              }
                            );

                            const countrySelected =
                              countryOptions.find(
                                (c) =>
                                  c.value ===
                                  selectedAddress[0]?.country
                              );

                            let country: any;

                            if (countrySelected) {
                              if (
                                countrySelected?.value !== 'Indonesia'
                              ) {
                                country = countrySelected;
                              }
                            }

                            form.resetField('receiver.country');
                            form.setValue('receiver', {
                              fullname: selectedAddress[0]?.full_name,
                              company: selectedAddress[0]?.company,
                              phone_number:
                                selectedAddress[0]?.phone_number,
                              email: selectedAddress[0]?.email,
                              streetLine1:
                                selectedAddress[0]?.street_line_1,
                              streetLine2:
                                selectedAddress[0]?.street_line_2,
                              streetLine3:
                                selectedAddress[0]?.street_line_3,
                              city: selectedAddress[0]?.city,
                              state: selectedAddress[0]?.state,
                              country,
                              zipCode: selectedAddress[0]?.zip_code,
                              vat_tax_id:
                                selectedAddress[0]?.vat_tax_id,
                            });
                            onChange(selectedOption);
                          } else {
                            form.resetField('receiver.country');
                            form.setValue('receiver', {
                              fullname: '',
                              company: '',
                              phone_number: '',
                              email: '',
                              streetLine1: '',
                              streetLine2: '',
                              streetLine3: '',
                              city: '',
                              state: '',
                              country: {
                                value: '',
                                id: '',
                                label: '',
                              },
                              zipCode: '',
                              vat_tax_id: '',
                            });
                            onChange(selectedOption);
                          }
                        };
                        return (
                          <Select
                            // isDisabled={
                            //   platformType == 'client'
                            //     ? true
                            //     : false
                            // }
                            className="basic-single"
                            classNamePrefix="select"
                            placeholder="Select From your Address Book"
                            isClearable
                            isSearchable
                            options={addressOption}
                            onChange={handleSelectChange}
                            value={currentSelection}
                          />
                        );
                      }}
                      rules={{
                        required: true,
                      }}
                    />
                  </FormControl>
                </Box>
              </Flex>
              <Stack spacing={3}>
                <Flex gap={5} flexDir={['column', 'column', 'row']}>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600}>Name</FormLabel>
                    <Input
                      {...form.register(`receiver.fullname`, {
                        required: true,
                        maxLength: 100,
                      })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight={600}>Company</FormLabel>
                    <Input
                      {...form.register(`receiver.company`, {
                        maxLength: 100,
                      })}
                    />
                  </FormControl>
                </Flex>
                <Flex gap={5} flexDir={['column', 'column', 'row']}>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600}>Phone</FormLabel>
                    <Input
                      {...form.register(`receiver.phone_number`, {
                        required: true,
                      })}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600}>Email</FormLabel>
                    <Input
                      {...form.register(`receiver.email`, {
                        required: true,
                      })}
                    />
                  </FormControl>
                </Flex>
                <Spacer />
                <Stack gap={5} display={['block']}>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600}>Address</FormLabel>
                    <Input
                      {...form.register(`receiver.streetLine1`, {
                        maxLength: 30,
                      })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight={600}>
                      {' '}
                      {`Address (Line 2)`}{' '}
                    </FormLabel>
                    <Input
                      {...form.register(`receiver.streetLine2`, {
                        maxLength: 30,
                      })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel
                      fontWeight={600}
                    >{`Address (Line 3)`}</FormLabel>
                    <Input
                      {...form.register(`receiver.streetLine3`, {
                        maxLength: 30,
                      })}
                    />
                  </FormControl>
                </Stack>
                <Spacer />
                <Flex gap={5} display={['block', 'block', 'flex']}>
                  <FormControl isRequired>
                    <FormLabel fontWeight={600}>Country</FormLabel>
                    {receiverCountryDefault ? (
                      <Controller
                        {...form.register(`receiver.country`)}
                        name={`receiver.country`}
                        control={control}
                        render={({
                          field: { onChange, value, name, ref },
                        }) => {
                          const countryOptions = countryData?.map(
                            (el) => {
                              return {
                                value: el.country,
                                label: `${el.code} - ${el.country}`,
                                id: el.id,
                                code: el.code,
                              };
                            }
                          );

                          countryOptions.sort();

                          let defaultOption = countryOptions.filter(
                            (el: any) =>
                              el.value == receiverCountryDefault
                          );

                          const selectedAddress = getValues(
                            'receiver.addressSelection'
                          );

                          let currentSelection: any;
                          let handleSelectChange: any;
                          let isDisbaledField: any;

                          if (selectedAddress) {
                            const findAddress = allAddressBook.find(
                              (c: any) => c.id === selectedAddress?.id
                            );

                            if (findAddress.country !== 'Indonesia') {
                              currentSelection = countryOptions.find(
                                (c) => c.value === findAddress.country
                              );
                              isDisbaledField = true;
                            }

                            handleSelectChange = (
                              selectedOption: any | null
                            ) => {
                              if (selectedOption) {
                                currentSelection =
                                  countryOptions.find(
                                    (c) =>
                                      c.value === selectedOption.value
                                  );
                                const country = selectedOption;
                                form.setValue(
                                  'receiver.country',
                                  country
                                );
                                onChange(selectedOption);
                              } else {
                                const country = currentSelection;
                                form.setValue(
                                  'receiver.country',
                                  country
                                );
                                onChange(currentSelection);
                              }
                            };
                          } else {
                            isDisbaledField = false;

                            if (defaultOption.length > 0) {
                              if (receiverDefaultValue !== '') {
                                currentSelection =
                                  countryOptions.find(
                                    (c) =>
                                      c.value === receiverDefaultValue
                                  );
                              }

                              handleSelectChange = (
                                selectedOption: any | null
                              ) => {
                                if (selectedOption) {
                                  setReceiverCountryCode(
                                    selectedOption?.code
                                  );

                                  if (
                                    selectedOption?.code === 'US' ||
                                    selectedOption?.code === 'CA'
                                  ) {
                                    setSelectReceiverStateMode(true);
                                  } else {
                                    setSelectReceiverStateMode(false);
                                  }

                                  setReceiverDefaultValue('');
                                  currentSelection =
                                    countryOptions.find(
                                      (c) =>
                                        c.value ===
                                        selectedOption.value
                                    );

                                  setReceiverCountryCode(
                                    selectedOption?.code
                                  );

                                  if (
                                    selectedOption?.code === 'US' ||
                                    selectedOption?.code === 'CA'
                                  ) {
                                    setSelectReceiverStateMode(false);
                                    form.resetField('receiver.state');
                                    async function delayState() {
                                      setSelectReceiverStateMode(
                                        true
                                      );
                                    }
                                    setTimeout(delayState, 1000);
                                  } else {
                                    form.resetField('receiver.state');
                                    async function delayState() {
                                      setSelectReceiverStateMode(
                                        false
                                      );
                                    }
                                    setTimeout(delayState, 1000);
                                  }

                                  const country = selectedOption;
                                  form.setValue(
                                    'receiver.country',
                                    country
                                  );
                                  onChange(selectedOption);
                                } else {
                                  setReceiverCountryCode(
                                    defaultOption[0]?.code
                                  );

                                  if (
                                    defaultOption[0]?.code === 'US' ||
                                    defaultOption[0]?.code === 'CA'
                                  ) {
                                    setSelectReceiverStateMode(true);
                                  } else {
                                    setSelectReceiverStateMode(false);
                                  }
                                  const country = currentSelection;
                                  form.setValue(
                                    'receiver.country',
                                    country
                                  );
                                  onChange(currentSelection);
                                }
                              };
                            } else {
                              currentSelection = countryOptions.find(
                                (c) => c.value === value
                              );

                              handleSelectChange = (
                                selectedOption: any | null
                              ) => {
                                const country = selectedOption;
                                form.setValue(
                                  'receiver.country',
                                  country
                                );
                                onChange(selectedOption);
                              };
                            }
                          }

                          return (
                            //@ts-ignore
                            <Select
                              isDisabled={isDisbaledField}
                              className="basic-single"
                              classNamePrefix="select"
                              placeholder="Select country"
                              isClearable
                              isSearchable
                              defaultValue={{
                                value: 'Australia',
                                label: 'AU - Australia',
                                id: 14,
                              }}
                              options={countryOptions}
                              onChange={handleSelectChange}
                              value={currentSelection}
                            />
                          );
                        }}
                        rules={{
                          required: true,
                        }}
                      />
                    ) : (
                      <Controller
                        {...form.register(`receiver.country`)}
                        name={`receiver.country`}
                        control={control}
                        render={({
                          field: { onChange, value, name, ref },
                        }) => {
                          const countryOptions = countryData?.map(
                            (el) => {
                              return {
                                value: el.country,
                                label: `${el.code} - ${el.country}`,
                                id: el.id,
                                code: el.code,
                              };
                            }
                          );

                          countryOptions.sort();

                          const selectedAddress = getValues(
                            'receiver.addressSelection'
                          );

                          let currentSelection: any;
                          let handleSelectChange: any;
                          let isDisbaledField: any;

                          if (selectedAddress) {
                            const findAddress = allAddressBook.find(
                              (c: any) => c.id === selectedAddress?.id
                            );

                            if (findAddress.country !== 'Indonesia') {
                              currentSelection = countryOptions.find(
                                (c) => c.value === findAddress.country
                              );
                              isDisbaledField = true;
                            }

                            handleSelectChange = (
                              selectedOption: any | null
                            ) => {
                              if (selectedOption) {
                                currentSelection =
                                  countryOptions.find(
                                    (c) =>
                                      c.value === selectedOption.value
                                  );
                                const country = selectedOption;
                                form.setValue(
                                  'receiver.country',
                                  country
                                );
                                onChange(selectedOption);
                              } else {
                                const country = currentSelection;
                                form.setValue(
                                  'receiver.country',
                                  country
                                );
                                onChange(currentSelection);
                              }
                            };
                          } else {
                            isDisbaledField = false;
                            currentSelection = countryOptions.find(
                              (c) => c.value === value
                            );

                            handleSelectChange = (
                              selectedOption: any | null
                            ) => {
                              setReceiverCountryCode(
                                selectedOption?.code
                              );

                              if (
                                selectedOption?.code === 'US' ||
                                selectedOption?.code === 'CA'
                              ) {
                                setSelectReceiverStateMode(false);
                                form.resetField('receiver.state');
                                async function delayState() {
                                  setSelectReceiverStateMode(true);
                                }
                                setTimeout(delayState, 1000);
                              } else {
                                form.resetField('receiver.state');
                                async function delayState() {
                                  setSelectReceiverStateMode(false);
                                }
                                setTimeout(delayState, 1000);
                              }

                              const country = selectedOption;
                              form.setValue(
                                'receiver.country',
                                country
                              );
                              onChange(selectedOption);
                            };
                          }

                          return (
                            //@ts-ignore
                            <Select
                              // ref={ref => {
                              //   selectRef = ref;
                              // }}
                              isDisabled={isDisbaledField}
                              // isDisabled={true}
                              className="basic-single"
                              classNamePrefix="select"
                              placeholder="Select country"
                              isClearable
                              isSearchable
                              options={countryOptions}
                              onChange={handleSelectChange}
                              value={currentSelection}
                            />
                          );
                        }}
                        rules={{
                          required: true,
                        }}
                      />
                    )}
                  </FormControl>
                  <FormControl isRequired>
                    <HStack alignItems={'center'}>
                      <FormLabel fontWeight={600}>
                        Postal Code{' '}
                      </FormLabel>
                      <Box
                        fontWeight={100}
                        fontStyle={'italic'}
                        fontSize={'10px'}
                        mb={'8px'}
                      >{`(Insert 0000 if no zip code)`}</Box>
                    </HStack>
                    <Input
                      {...form.register(`receiver.zipCode`, {
                        required: true,
                      })}
                    />
                  </FormControl>
                </Flex>
                {selectReceiverStateMode ? (
                  <Flex gap={5} display={['block', 'block', 'flex']}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600}>State</FormLabel>
                      <Controller
                        {...form.register(`receiver.state`)}
                        name={`receiver.state`}
                        control={control}
                        render={({
                          field: { onChange, value, name, ref },
                        }) => {
                          let filterOption;
                          if (receiverCountryCode.length > 2) {
                            filterOption = stateData?.filter(
                              (el: any) =>
                                el.country_name ===
                                receiverCountryCode
                            );
                          } else {
                            filterOption = stateData?.filter(
                              (el: any) =>
                                el.country_code ===
                                receiverCountryCode
                            );
                          }

                          const stateOption = filterOption?.map(
                            (el: any) => {
                              return {
                                value: el.province,
                                label: `${el.code} - ${el.province} - ${el.country_name}`,
                                id: el.id,
                                code: el.code,
                                countryCode: el.country_code,
                              };
                            }
                          );

                          stateOption.sort();

                          let currentStateSelection;

                          if (receiverStateDefaultValue !== '') {
                            currentStateSelection = stateOption.find(
                              (c: any) =>
                                c.code === receiverStateDefaultValue
                            );
                            setReceiverStateDefaultValue('');
                          } else {
                            currentStateSelection = stateOption.find(
                              (c: any) => c.value === value
                            );
                          }

                          const handleStateSelectChange = (
                            selectedOption: any | null
                          ) => {
                            const state = selectedOption;
                            form.setValue('receiver.state', state);
                            onChange(selectedOption);
                          };

                          return (
                            <Select
                              className="basic-single CustomStyle"
                              classNamePrefix="select"
                              placeholder="Select State"
                              isClearable
                              isSearchable
                              options={stateOption}
                              onChange={handleStateSelectChange}
                              value={currentStateSelection}
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: state.isDisabled
                                    ? '#F5f5f5'
                                    : 'transparent',
                                  background: state.isDisabled
                                    ? '#F5f5f5'
                                    : 'transparent',
                                }),
                              }}
                            />
                          );
                        }}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600}>City</FormLabel>
                      <Input
                        placeholder={`Receiver city`}
                        {...form.register(`receiver.city`, {
                          required: true,
                        })}
                      />
                    </FormControl>
                  </Flex>
                ) : (
                  <Flex gap={5} display={['block', 'block', 'flex']}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600}>State</FormLabel>
                      <Input
                        {...form.register(`receiver.stateString`, {
                          required: true,
                        })}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600}>City</FormLabel>
                      <Input
                        {...form.register(`receiver.city`, {
                          required: true,
                        })}
                      />
                    </FormControl>
                  </Flex>
                )}
                {/* <Flex gap={5} display={["block", "block", "flex"]}>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600}>State</FormLabel>
                      <Input
                        placeholder={`Receiver state`}
                        {...form.register(`receiver.state`, { required: true })}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontWeight={600}>City</FormLabel>
                      <Input
                        placeholder={`Receiver city`}
                        {...form.register(`receiver.city`, { required: true })}
                      />
                    </FormControl>
                  </Flex> */}
                <Flex gap={5} display={['block', 'block', 'flex']}>
                  <FormControl pr={'10px'} w={'50%'}>
                    <FormLabel fontWeight={600}>
                      Tax ID / Eori Number
                    </FormLabel>
                    <Input {...form.register(`shipping.vat`)} />
                  </FormControl>
                  <Box></Box>
                </Flex>
              </Stack>
            </Box>
            <Box id="section-1-ref" ref={receiverSectionRef} />
          </Box>
          <Box id="section-2" mt={'20px'}>
            <Box
              my={'20px'}
              boxShadow={'lg'}
              position={'relative'}
              p={'20px'}
              backgroundColor={'white'}
            >
              <Box p={'20px'}>
                <Flex
                  w={'100%'}
                  justifyContent={'space-between'}
                  pb={'20px'}
                >
                  <Box fontSize={'24px'} fontWeight={600}>
                    Items
                  </Box>
                </Flex>
                <Box
                  borderRadius={'lg'}
                  background={'#FFEDE6'}
                  p={'20px'}
                >
                  <HStack spacing={5}>
                    <Center
                      p={'10px'}
                      background={'#FFB79A'}
                      borderRadius={'md'}
                    >
                      <Icon
                        color={'#FF4C02'}
                        fontSize={'40px'}
                        as={FaFileInvoiceDollar}
                      ></Icon>
                    </Center>
                    <Box fontWeight={600}>
                      <Box>
                        UrShipper will automatically generate a custom
                        invoice / declaration for you based on your
                        shipment contents.{' '}
                      </Box>
                      <Box>
                        Reduce the risk of customs delays with
                        detailed item description (e.g: Men’s Shirt of
                        Cotton) and provide in English only.
                      </Box>
                    </Box>
                  </HStack>
                </Box>

                {currencyData && currencyData.length > 0 && (
                  <Box pt={'20px'} w={'50%'}>
                    <Flex
                      gap={5}
                      display={['block', 'block', 'flex']}
                    >
                      <FormControl isRequired>
                        <FormLabel fontWeight={600} mb={'10px'}>
                          Currency
                        </FormLabel>
                        <Controller
                          {...form.register(`shipping.currency`)}
                          name={`shipping.currency`}
                          control={control}
                          render={({
                            field: { onChange, value, name, ref },
                          }) => {
                            const currencyOption = currencyData?.map(
                              (el: any) => {
                                return {
                                  value: el.currency,
                                  label: `${el.code} - ${el.currency}`,
                                  id: el.id,
                                  code: el.code,
                                };
                              }
                            );

                            currencyOption.sort();
                            let currentCurrencySelection: any;

                            if (currencyDefaultValue !== '') {
                              currentCurrencySelection =
                                currencyOption.find(
                                  (c: any) =>
                                    c.value === currencyDefaultValue
                                );
                            } else {
                              currentCurrencySelection =
                                currencyOption.find(
                                  (c: any) => c.value === value
                                );
                            }

                            const handleCurrencySelectChange = (
                              selectedOption: any | null
                            ) => {
                              if (selectedOption) {
                                setCurrencyDefaultValue('');
                                currentCurrencySelection =
                                  currencyOption.find(
                                    (c: any) =>
                                      c.value === selectedOption.value
                                  );
                                const currency = selectedOption;
                                setCurrentPackageData({
                                  ...currentPackageData,
                                  lookup_currency: currency.value,
                                  lookup_currency_code: currency.code,
                                  relation_declare_value_code:
                                    currency.id,
                                });

                                form.setValue(
                                  'shipping.currency',
                                  currency
                                );
                                onChange(selectedOption);
                              } else {
                                const currency =
                                  currentCurrencySelection;
                                form.setValue(
                                  'shipping.currency',
                                  currency
                                );
                                onChange(currentCurrencySelection);
                              }
                            };

                            return (
                              //@ts-ignore
                              <Select
                                className="basic-single"
                                classNamePrefix="select"
                                placeholder="Select Currency"
                                isClearable
                                isSearchable
                                options={currencyOption}
                                onChange={handleCurrencySelectChange}
                                value={currentCurrencySelection}
                              />
                            );
                          }}
                          rules={{
                            required: true,
                          }}
                        />
                      </FormControl>
                    </Flex>
                  </Box>
                )}

                <Box>
                  {currentPackageData?.relation_shipment_package_comodities_items &&
                    currentPackageData
                      ?.relation_shipment_package_comodities_items
                      .length > 0 &&
                    currentPackageData?.relation_shipment_package_comodities_items.map(
                      (el: any, index: number) => {
                        return (
                          <Box
                            borderRadius={'lg'}
                            p={'20px'}
                            border={'1px solid #C2C2C2'}
                            key={index}
                            my={'20px'}
                          >
                            <PackageItems
                              updateItemLoad={updateItemLoad}
                              updateItems={updateItems}
                              form={form}
                              control={control}
                              newItems={newItems}
                              getData={getData}
                              setCurrentPackageData={
                                setCurrentPackageData
                              }
                              currentPackageData={currentPackageData}
                              setValidationTotalDeclareValue={
                                setValidationTotalDeclareValue
                              }
                              setValidationTotalCustomValue={
                                setValidationTotalCustomValue
                              }
                              setValidationComoditiesItemWeight={
                                setValidationComoditiesItemWeight
                              }
                              animateNewContainer={
                                animateNewContainer
                              }
                              removeLoad={removeLoad}
                              removePackage={removeItems}
                              packageData={el}
                              index={index}
                              setValidationComoditiesItemQuantity={
                                setValidationComoditiesItemQuantity
                              }
                              validationComoditiesItemQuantity={
                                validationComoditiesItemQuantity
                              }
                              itemBook={itemBook}
                            />
                          </Box>
                        );
                      }
                    )}

                  <Box px={'5px'}>
                    <Flex justifyContent={'end'}>
                      {customSelectedItemsBook !== '' && (
                        <Box mr={'20px'} my={'10px'} fontWeight={600}>
                          <Button
                            boxShadow={'lg'}
                            color={'#FF4C02'}
                            backgroundColor={'#FFEDE6'}
                            _focus={{ outline: 'none' }}
                            onClick={addFromBook}
                            m={0}
                            py={'10px'}
                            px={'20px'}
                          >
                            Add Item
                          </Button>
                        </Box>
                      )}
                      <Box my={'10px'} fontWeight={600}>
                        <Button
                          _hover={{
                            color: '#FFEDE6',
                            backgroundColor: '#FF4C02',
                            border: '1px solid #FF4C02',
                          }}
                          boxShadow={'lg'}
                          color={'#FF4C02'}
                          backgroundColor={'#FFEDE6'}
                          _focus={{ outline: 'none' }}
                          onClick={newItems}
                          m={0}
                          py={'10px'}
                          px={'20px'}
                          leftIcon={<FaPlus color={'#FF4C02'} />}
                        >
                          Add Item
                        </Button>
                      </Box>
                    </Flex>
                  </Box>

                  <Box
                    mb={'10px'}
                    fontSize={'xl'}
                    fontWeight={700}
                    as="span"
                    flex="1"
                    textAlign="left"
                  >
                    Additional Custom Information
                  </Box>
                  <Box id="section-2-ref" ref={itemsSectionRef} />

                  <Stack spacing={3}>
                    <Flex
                      mt={'20px'}
                      gap={5}
                      display={['block', 'block', 'flex']}
                    >
                      <FormControl>
                        <FormLabel fontWeight={600}>
                          Insurance Cost
                        </FormLabel>
                        <InputGroup size="sm">
                          <Input
                            placeholder="Fill Insurance Cost"
                            {...form.register(
                              `shipping.insurance_cost`
                            )}
                          />
                          <InputRightAddon
                            backgroundColor={'#f5f5f5'}
                            fontWeight={600}
                            children={`${currentPackageData?.lookup_currency_code}`}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontWeight={600}>
                          Freight Cost
                        </FormLabel>
                        <InputGroup size="sm">
                          <Input
                            placeholder="Fill Freight Cost"
                            {...form.register(
                              `shipping.freight_cost`
                            )}
                          />
                          <InputRightAddon
                            backgroundColor={'#f5f5f5'}
                            fontWeight={600}
                            children={`${currentPackageData?.lookup_currency_code}`}
                          />
                        </InputGroup>
                      </FormControl>
                    </Flex>
                    <FormControl>
                      <FormLabel fontWeight={600}>
                        Special Instructions
                      </FormLabel>
                      <Textarea
                        placeholder="Fill Special Instructions"
                        {...form.register(
                          `shipping.special_instructions`
                        )}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontWeight={600}>
                        Declaration Statement
                      </FormLabel>
                      <Textarea
                        placeholder="Fill Add Reference"
                        {...form.register(`shipping.add_reference`)}
                      />
                    </FormControl>

                    {/* TODO: here */}
                    <FormControl>
                      <FormLabel fontWeight={600}>
                        Additional Custom Document
                      </FormLabel>
                      {loadFile ? (
                        <LoaderItem />
                      ) : (
                        <Box>
                          {uploadedFile?.name ||
                          uploadedFile?.filename ? (
                            <Flex gap={5}>
                              <Box>
                                <Button
                                  _hover={{
                                    color: '#FFEDE6',
                                    backgroundColor: '#E53E3E',
                                  }}
                                  boxShadow={'lg'}
                                  size={'xs'}
                                  onClick={(val: any) => {
                                    removeFile();
                                  }}
                                  color={'#E53E3E'}
                                  leftIcon={
                                    <BiTrash color={'#E53E3E'} />
                                  }
                                  bg={'#FFEDE6'}
                                >
                                  Remove
                                </Button>
                              </Box>
                              <Box fontWeight={600}>
                                {' '}
                                {uploadedFile?.name}{' '}
                              </Box>
                              <Box>
                                {' '}
                                {formatBytes(uploadedFile?.size)}{' '}
                              </Box>
                            </Flex>
                          ) : (
                            // TODO: here
                            <>
                              {/* <FileUpload
                              accept={'image/*, application/pdf'}
                              multiple
                              encodeImageFileAsURL={
                                encodeImageFileAsURL
                              }
                              register={...form.register(
                                'shipping.file_'
                              )}
                            >
                              <Button
                                leftIcon={<Icon as={MdCloudUpload} />}
                              >
                                Upload
                              </Button>
                            </FileUpload> */}
                            </>
                          )}

                          {fileError && (
                            <Box
                              mt={'10px'}
                              color={'red.400'}
                              fontWeight={600}
                            >
                              File is Over 5 MB{' '}
                            </Box>
                          )}
                        </Box>
                      )}
                      <Box
                        mt={'10px'}
                        fontSize={'12px'}
                      >{`* File Under 5 MB`}</Box>
                    </FormControl>
                  </Stack>

                  <Box my={'20px'}>
                    <Box w={'100%'} h={'2px'} bg={'gray.200'}></Box>
                  </Box>

                  {/* {validationComoditiesItemQuantity &&
                  validationComoditiesItemQuantity !== 0 ? (
                    <Flex
                      justifyContent={'start'}
                      my={'20px'}
                      pb={'20px'}
                    >
                      <Box w={'450px'}>
                        <Box
                          pb={'20px'}
                          fontWeight={600}
                          fontSize={'18px'}
                        >
                          Totals :
                        </Box>
                        <Flex justifyContent={'space-between'}>
                          <Box fontWeight={600}>Total Quantity</Box>
                          <Flex>
                            <Box>
                              {validationComoditiesItemQuantity}
                            </Box>
                            <Box pl={'5px'} fontWeight={600}>
                              pc
                            </Box>
                          </Flex>
                        </Flex>
                        <Flex justifyContent={'space-between'}>
                          <Box fontWeight={600}>Net Weight</Box>
                          <Flex>
                            <Box>
                              {validationComoditiesItemWeight.toFixed(
                                2
                              )}
                            </Box>
                            <Box pl={'5px'} fontWeight={600}>
                              kg
                            </Box>
                          </Flex>
                        </Flex>
                        <Flex justifyContent={'space-between'}>
                          <Box fontWeight={600}>Total Item Value</Box>
                          <Flex>
                            <Box>{validationTotalCustomValue}</Box>
                            <Box pl={'5px'} fontWeight={600}>
                              {' '}
                              {
                                currentPackageData?.lookup_currency_code
                              }{' '}
                            </Box>
                          </Flex>
                        </Flex>
                      </Box>
                    </Flex>
                  ) : (
                    <Box></Box>
                  )} */}
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            id="section-3"
            my={'20px'}
            boxShadow={'lg'}
            position={'relative'}
            p={'40px'}
            pb={'10px'}
            backgroundColor={'white'}
          >
            <Flex
              w={'100%'}
              justifyContent={'space-between'}
              pb={'20px'}
            >
              <Box fontSize={'24px'} fontWeight={600}>
                Package
              </Box>
            </Flex>
            <Box id="section-31-ref" ref={packageSectionTopRef} />

            <Box
              borderRadius={'lg'}
              background={'#FFEDE6'}
              p={'20px'}
            >
              <HStack spacing={5}>
                <Center
                  p={'10px'}
                  background={'#FFB79A'}
                  borderRadius={'md'}
                >
                  <Icon
                    color={'#FF4C02'}
                    fontSize={'40px'}
                    as={BiSolidPackage}
                  ></Icon>
                </Center>
                <Box fontWeight={600}>
                  <Box>
                    Rates are calculated based on package weight,
                    dimensions, and the insured value.
                  </Box>
                  <Box>
                    it's recommended to enter the correct and accurate
                    information. If not, you may receive adjusment
                    charges.
                  </Box>
                </Box>
              </HStack>
            </Box>
            <HStack spacing={20} direction="row">
              <Box w={'30%'} mt={'8px'}>
                <Box mb={'5px'} fontWeight={600}>
                  Packaging
                </Box>
                <Controller
                  {...form.register(`shipping.package_type`)}
                  control={control}
                  name={'shipping.package_type'}
                  render={({ field: { onChange, value } }) => {
                    const packOption = [
                      {
                        value: 'Your Packaging',
                        label: 'Your Packaging',
                        id: 1,
                      },
                      {
                        value: 'Pak',
                        label: 'Pak',
                        id: 2,
                      },
                    ];

                    packOption.sort();

                    let currentPackOption: any;
                    if (packageTypeDefaultValue !== '') {
                      currentPackOption = packOption.find(
                        (c: any) =>
                          c.value === packageTypeDefaultValue
                      );
                    } else {
                      currentPackOption = packOption.find(
                        (c: any) => c.value === value
                      );
                    }

                    const handleSelectChange = (
                      selectedOption: any | null
                    ) => {
                      if (selectedOption) {
                        setPackageTypeDefaultValue('');
                        currentPackOption = packOption.find(
                          (c: any) => c.value === value
                        );
                        setCurrentPackageData({
                          ...currentPackageData,
                          package_type: selectedOption.value,
                        });
                        form.setValue(
                          'shipping.package_type',
                          selectedOption.value
                        );
                        onChange(selectedOption);
                      } else {
                        const pack = currentPackOption;
                        form.setValue('shipping.package_type', pack);
                        onChange(currentPackOption);
                      }
                    };

                    return (
                      //@ts-ignore
                      <Select
                        className="basic-single styleWidth"
                        classNamePrefix="select"
                        placeholder="Select Packaging"
                        isClearable
                        isSearchable
                        options={packOption}
                        // defaultValue={packOption[0]}
                        onChange={(e: any) => {
                          handleSelectChange(e);
                        }}
                        value={currentPackOption}
                        // styles={{
                        //   control: (baseStyles, state) => ({
                        //     ...baseStyles,
                        //     borderColor: state.isFocused ? "#F5F5F5" : "#F5F5F5",
                        //     fontSize: '14px',
                        //     fontWeight: 600,
                        //   }),
                        //   option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                        //     return {
                        //       ...styles,
                        //       fontSize: '14px',
                        //       fontWeight: 600,
                        //       backgroundColor: isFocused ? 'rgba(253,228,217, .6)' : '#FFFFFF'
                        //     };
                        //   }
                        // }}
                      />
                    );
                  }}
                />
              </Box>

              {/* <Box mx={"auto!important"}>
              <Box mb={"5px"} fontWeight={600}>
                Insurance
              </Box>
              <Controller
                {...form.register(`receiver.is_declare_value`)}
                control={control}
                name={"shipping.is_declare_value"}
                render={({ field: { onChange, value } }) => {
                  const handleSelectChange = (selectedOption: any | null) => {
                    setCurrentPackageData({
                      ...currentPackageData,
                      is_declare_value: selectedOption?.is_declare_value,
                    });
                    form.setValue(
                      "shipping.is_declare_value",
                      selectedOption?.is_declare_value
                    );
                    onChange(selectedOption);
                  };

                  return (
                    <RadioGroup
                      onChange={(e) => {
                        handleSelectChange({
                          is_declare_value: e,
                        });
                        animateCoverBoxCurrency.onToggle();
                      }}
                      value={
                        currentPackageData?.is_declare_value
                          ? currentPackageData?.is_declare_value
                          : "No"
                      }
                    >
                      <Stack align={"center"} direction="row">
                        <Radio
                          _focus={{ outline: "none" }}
                          colorScheme="orange"
                          value="No"
                        >
                          No
                        </Radio>
                        <Radio
                          _focus={{ outline: "none" }}
                          colorScheme="orange"
                          value="Yes"
                        >
                          Yes
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  );
                }}
              />
            </Box> */}
              <Stack pt={'25px'} spacing={0} direction="column">
                <Checkbox
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      setCurrentPackageData({
                        ...currentPackageData,
                        is_declare_value: 'Yes',
                      });
                      form.setValue(
                        'shipping.is_declare_value',
                        'Yes'
                      );
                    } else {
                      setCurrentPackageData({
                        ...currentPackageData,
                        is_declare_value: 'No',
                      });
                      form.setValue(
                        'shipping.is_declare_value',
                        'No'
                      );
                    }
                  }}
                  isChecked={
                    currentPackageData?.is_declare_value === 'Yes'
                      ? true
                      : false
                  }
                  style={{
                    borderColor: 'rgb(246,75,6)',
                  }}
                  fontWeight={600}
                  size={'sm'}
                  colorScheme="orange"
                >
                  Add insurance for extra coverage
                </Checkbox>
                <Checkbox
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      setCurrentPackageData({
                        ...currentPackageData,
                        signature: 'Direct Signature',
                      });
                      form.setValue(
                        'shipping.signature',
                        'Direct Signature'
                      );
                    } else {
                      setCurrentPackageData({
                        ...currentPackageData,
                        signature: 'None',
                      });
                      form.setValue('shipping.signature', 'None');
                    }
                  }}
                  isChecked={
                    currentPackageData?.signature ===
                    'Direct Signature'
                      ? true
                      : false
                  }
                  style={{
                    borderColor: 'rgb(246,75,6)',
                  }}
                  fontWeight={600}
                  size={'sm'}
                  colorScheme="orange"
                  defaultChecked
                >
                  Require a signature on delivery
                </Checkbox>
              </Stack>
            </HStack>

            <Box>
              {pageIsLoading ? (
                <Box w={'100%'}>
                  <LoaderItem />
                </Box>
              ) : (
                <Box
                  position={'relative'}
                  // pb={'40px'}
                >
                  <Box
                    position={'relative'}
                    backgroundColor={'white'}
                  >
                    <Box>
                      <Box my={'20px'}>
                        {currentPackageData?.relation_myshopment_package_items &&
                          currentPackageData
                            ?.relation_myshopment_package_items
                            .length > 0 &&
                          currentPackageData?.relation_myshopment_package_items.map(
                            (el: any, index: number) => {
                              return (
                                <Box
                                  borderRadius={'lg'}
                                  p={'20px'}
                                  border={'1px solid #C2C2C2'}
                                  key={index}
                                  my={'20px'}
                                >
                                  <YourPackaging
                                    setValidationActualTotalWeight={
                                      setValidationActualTotalWeight
                                    }
                                    validationTotalActualWeight={
                                      validationTotalActualWeight
                                    }
                                    getData={getData}
                                    setCurrentPackageData={
                                      setCurrentPackageData
                                    }
                                    currentPackageData={
                                      currentPackageData
                                    }
                                    setValidationTotalDeclareValue={
                                      setValidationTotalDeclareValue
                                    }
                                    setValidationTotalWeight={
                                      setValidationTotalWeight
                                    }
                                    setValidationNumberOfPackage={
                                      setValidationNumberOfPackage
                                    }
                                    animateNewContainer={
                                      animateNewContainer
                                    }
                                    removeLoad={removeLoad}
                                    removePackage={removePackage}
                                    packageData={el}
                                    index={index}
                                    newYourPackaging={
                                      newYourPackaging
                                    }
                                  />
                                </Box>
                              );
                            }
                          )}

                        <Flex justifyContent={'end'}>
                          <Box my={'10px'} fontWeight={600}>
                            <Button
                              _hover={{
                                color: '#FFEDE6',
                                backgroundColor: '#FF4C02',
                                border: '1px solid #FF4C02',
                              }}
                              boxShadow={'lg'}
                              color={'#FF4C02'}
                              backgroundColor={'#FFEDE6'}
                              _focus={{ outline: 'none' }}
                              onClick={newYourPackaging}
                              m={0}
                              py={'10px'}
                              px={'20px'}
                              leftIcon={<FaPlus color={'#FF4C02'} />}
                            >
                              Add Package
                            </Button>
                          </Box>
                        </Flex>

                        <Box my={'20px'}>
                          <Box
                            w={'100%'}
                            h={'2px'}
                            bg={'gray.200'}
                          ></Box>
                        </Box>

                        {validationNumberOfPackage &&
                        validationNumberOfPackage !== 0 ? (
                          <Flex
                            justifyContent={'start'}
                            my={'20px'}
                            pb={'20px'}
                          >
                            <Box w={'450px'}>
                              <Box
                                pb={'20px'}
                                fontWeight={600}
                                fontSize={'18px'}
                              >
                                Package Summary:
                              </Box>
                              <HStack>
                                <Flex
                                  justifyContent={'space-between'}
                                >
                                  <Box
                                    // fontWeight={600}
                                    whiteSpace={'nowrap'}
                                  >
                                    Total Quantity:{' '}
                                  </Box>
                                  <Flex>
                                    <Box
                                      pl={'5px'}
                                      fontWeight={600}
                                      whiteSpace={'nowrap'}
                                    >
                                      {validationNumberOfPackage} pcs
                                    </Box>
                                  </Flex>
                                </Flex>

                                {currentPackageData?.package_type ===
                                  'Your Packaging' && (
                                  <Flex
                                    justifyContent={'space-between'}
                                  >
                                    <Box
                                      // fontWeight={600}
                                      whiteSpace={'nowrap'}
                                    >
                                      Gross Weight:{' '}
                                    </Box>
                                    <Flex>
                                      <Box
                                        pl={'5px'}
                                        fontWeight={600}
                                        whiteSpace={'nowrap'}
                                      >
                                        {validationTotalActualWeight.toFixed(
                                          2
                                        )}{' '}
                                        kg
                                      </Box>
                                    </Flex>
                                  </Flex>
                                )}

                                <Flex
                                  justifyContent={'space-between'}
                                >
                                  <Box
                                    // fontWeight={600}
                                    whiteSpace={'nowrap'}
                                  >
                                    Chargeable Weight:{' '}
                                  </Box>
                                  <Flex>
                                    <Box
                                      pl={'5px'}
                                      fontWeight={600}
                                      whiteSpace={'nowrap'}
                                    >
                                      {validationTotalWeight.toFixed(
                                        2
                                      )}{' '}
                                      kg
                                    </Box>
                                  </Flex>
                                </Flex>
                                {currentPackageData?.is_declare_value ===
                                  'Yes' && (
                                  <Flex
                                    justifyContent={'space-between'}
                                  >
                                    <Box
                                      // fontWeight={600}
                                      whiteSpace={'nowrap'}
                                    >
                                      Insured Value:{' '}
                                    </Box>
                                    <Flex>
                                      <Box
                                        pl={'5px'}
                                        fontWeight={600}
                                        whiteSpace={'nowrap'}
                                      >
                                        {validationTotalDeclareValue}{' '}
                                        {
                                          currentPackageData?.lookup_currency_code
                                        }{' '}
                                      </Box>
                                    </Flex>
                                  </Flex>
                                )}
                              </HStack>
                            </Box>
                          </Flex>
                        ) : (
                          <Box></Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
            <Box id="section-3-ref" ref={packageSectionRef} />
          </Box>
          {/* TODO: here */}
          <Box
            id="section-4"
            borderColor={'green.400'}
            my={'20px'}
            boxShadow={'lg'}
            position={'relative'}
            p={'20px'}
            backgroundColor={'white'}
          >
            <Box p={'20px'}>
              <Flex
                justifyContent={'space-between'}
                gap={5}
                pb={'20px'}
              >
                <Box
                  pb={'20px'}
                  mb={'10px'}
                  fontSize={'24px'}
                  fontWeight={700}
                  flex="1"
                  textAlign="left"
                >
                  Rates
                </Box>
                <Box>
                  <Flex>
                    {/* <Box py={"10px"} pr={"20px"} mx={"auto!important"}>
                    <Flex gap={5}>
                      <Box mb={"5px"} fontWeight={600}>
                        Direct Signature
                      </Box>
                      <Box>
                        <Controller
                          {...form.register(`receiver.signature`)}
                          control={control}
                          name={"shipping.signature"}
                          render={({ field: { onChange, value } }) => {
                            const handleSelectChange = (
                              selectedOption: any | null
                            ) => {
                              setCurrentPackageData({
                                ...currentPackageData,
                                signature: selectedOption?.is_declare_value,
                              });
                              form.setValue(
                                "shipping.signature",
                                selectedOption?.is_declare_value
                              );
                              onChange(selectedOption);
                            };

                            return (
                              <RadioGroup
                                onChange={(e) => {
                                  handleSelectChange({
                                    is_declare_value: e,
                                  });
                                  animateCoverBoxCurrency.onToggle();
                                }}
                                value={
                                  currentPackageData?.signature ===
                                    "Direct Signature"
                                    ? currentPackageData?.signature
                                    : "None"
                                }
                              >
                                <Stack align={"center"} direction="row">
                                  <Radio
                                    _focus={{ outline: "none" }}
                                    colorScheme="orange"
                                    value="None"
                                  >
                                    No
                                  </Radio>
                                  <Radio
                                    _focus={{ outline: "none" }}
                                    colorScheme="orange"
                                    value="Direct Signature"
                                  >
                                    Yes
                                  </Radio>
                                </Stack>
                              </RadioGroup>
                            );
                          }}
                        />
                      </Box>
                    </Flex>
                  </Box> */}
                    <Box>
                      <Button
                        _hover={{
                          color: '#FFFFFF',
                          transition: '0.3s',
                          backgroundColor: '#FF4C02',
                        }}
                        w={'100%'}
                        boxShadow={'lg'}
                        color={'#FF4C02'}
                        backgroundColor={'transparent'}
                        border={'1px solid #FF4C02'}
                        _focus={{ outline: 'none' }}
                        type="submit"
                        m={0}
                        py={'20px'}
                        px={'20px'}
                        isLoading={loading}
                        loadingText="Calculating"
                        onClick={() => submitTypeSettings('rate')}
                        leftIcon={<BiRefresh fontSize={'20px'} />}
                      >
                        Check Rates
                      </Button>
                    </Box>
                  </Flex>
                </Box>
              </Flex>

              {platformType === 'admin' && (
                <Box
                  p={'24px'}
                  w={'50%'}
                  border={'2px'}
                  borderColor={'#d9d9d9ff'}
                  borderRadius={'24px'}
                >
                  <VStack spacing={'12px'}>
                    <FormControl>
                      <FormLabel fontWeight={600}>
                        Import Duty / Tax
                      </FormLabel>
                      <InputGroup size="sm">
                        <Input
                          placeholder="Fill Import Duty / Tax"
                          {...form.register(
                            `shipping.import_duty_charge`
                          )}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight={600}>
                        Disbursement Fee Charge
                      </FormLabel>
                      <InputGroup size="sm">
                        <Input
                          placeholder="Fill Disbursement Fee Charge"
                          {...form.register(
                            `shipping.disbursement_fee_charge`
                          )}
                        />
                      </InputGroup>
                    </FormControl>
                  </VStack>
                </Box>
              )}

              {urshipperRate && urshipperRate.length > 0 ? (
                <Box>
                  {membership?.lookup_membership_type ? (
                    <Box>
                      {membership.rate.map(
                        (el: any, index: number) => {
                          return (
                            <Box my={'20px'}>
                              <Box my={'20px'}>
                                <Flex w={'100%'}>
                                  <Box pl={'20px'} w={'50%'}>
                                    Shipping Rates
                                  </Box>
                                  <Flex w={'50%'} gap={5}>
                                    <Box>IDR</Box>
                                    <Box>
                                      {`${currencyFormaterIDR(
                                        el?.marked
                                      )}`}{' '}
                                    </Box>
                                  </Flex>
                                </Flex>
                                <Box
                                  mt={'5px'}
                                  borderBottom={'2px solid #f5f5f5'}
                                ></Box>
                              </Box>

                              <Box my={'20px'}>
                                <Flex w={'100%'}>
                                  <Box pl={'20px'} w={'50%'}>
                                    {' '}
                                    {`Discount ${membership?.lookup_membership_type} Membership (${el?.discount}%)`}{' '}
                                  </Box>
                                  <Flex w={'50%'} gap={5}>
                                    <Box>IDR</Box>
                                    <Box>
                                      {'- '}
                                      {`${currencyFormaterIDR(
                                        el?.totalDiscount
                                      )}`}{' '}
                                    </Box>
                                  </Flex>
                                </Flex>
                                <Box
                                  mt={'5px'}
                                  borderBottom={'2px solid #f5f5f5'}
                                ></Box>
                              </Box>

                              {/* <Box my={"20px"}>
                              <Flex w={"100%"}>
                                <Box pl={"20px"} w={"50%"}>
                                 Subtotal
                                </Box>
                                <Flex w={"50%"} gap={5}>
                                  <Box>IDR</Box>
                                  <Box>
                                    {`${currencyFormaterIDR(
                                      el?.subTotal
                                    )}`}{" "}
                                  </Box>
                                </Flex>
                              </Flex>
                              <Box mt={"5px"} borderBottom={"2px solid #f5f5f5"}></Box>
                            </Box> */}

                              <Box my={'20px'}>
                                <Flex w={'100%'}>
                                  <Box pl={'20px'} w={'50%'}>
                                    {' '}
                                    {`VAT (${el.percentage_vat}%)`}{' '}
                                  </Box>
                                  <Flex w={'50%'} gap={5}>
                                    <Box>IDR</Box>
                                    <Box>
                                      {`${currencyFormaterIDR(
                                        el?.displayVAT
                                      )}`}{' '}
                                    </Box>
                                  </Flex>
                                </Flex>
                                <Box
                                  mt={'5px'}
                                  borderBottom={'2px solid #f5f5f5'}
                                ></Box>
                              </Box>

                              <Box fontWeight={600} my={'20px'}>
                                <Flex w={'100%'}>
                                  <Box pl={'20px'} w={'50%'}>
                                    Total
                                  </Box>
                                  <Flex w={'50%'} gap={5}>
                                    <Box>IDR</Box>
                                    <Box>
                                      {`${currencyFormaterIDR(
                                        el?.totalPrice
                                      )}`}{' '}
                                    </Box>
                                  </Flex>
                                </Flex>
                                <Box
                                  mt={'5px'}
                                  borderBottom={'2px solid #f5f5f5'}
                                ></Box>
                              </Box>

                              {urshipperRate[0]?.delivTime && (
                                <Box fontWeight={600} my={'20px'}>
                                  <Flex w={'100%'}>
                                    <Box pl={'20px'} w={'50%'}>
                                      Estimated Delivery
                                    </Box>
                                    <Flex w={'50%'} gap={5}>
                                      <Box> {el?.delivTime} </Box>
                                    </Flex>
                                  </Flex>
                                  <Box
                                    mt={'5px'}
                                    borderBottom={'2px solid #f5f5f5'}
                                  ></Box>
                                </Box>
                              )}
                            </Box>
                          );
                        }
                      )}
                    </Box>
                  ) : (
                    <VStack {...group}>
                      {
                        // @ts-ignore
                        groupedByMember[0].map((item) => (
                          <CustomRadio
                            key={String(item.fedexAccountId)}
                            data={item}
                            {...getRadioProps({
                              value: String(item.fedexAccountId),
                            })}
                          />
                        ))
                      }
                    </VStack>
                  )}
                </Box>
              ) : null}
            </Box>
            <Box id="section-4-ref" ref={ratesSectionRef} />
          </Box>

          {/* Client */}
          {platformType === 'client' && (
            <Flex gap={5} justifyContent={'end'} mt="5">
              <Box>
                <Button
                  _hover={{
                    color: '#FFEDE6',
                    backgroundColor: '#FF4C02',
                  }}
                  w={'100%'}
                  boxShadow={'lg'}
                  color={'#FF4C02'}
                  border={'1px solid #ff4c02'}
                  backgroundColor={'transparent'}
                  _focus={{ outline: 'none' }}
                  type="submit"
                  m={0}
                  py={'20px'}
                  px={'20px'}
                  isLoading={loading}
                  loadingText="Loading"
                  onClick={() => submitTypeSettings('update')}
                >
                  Save as Draft
                </Button>
              </Box>
              <Box>
                <Button
                  _hover={{
                    color: '#FF4C02',
                    transition: '0.3s',
                    backgroundColor: 'transparent',
                  }}
                  w={'100%'}
                  boxShadow={'lg'}
                  color={'#FFFFFF'}
                  backgroundColor={'#FF4C02'}
                  border={'1px solid #FF4C02'}
                  _focus={{ outline: 'none' }}
                  type="submit"
                  m={0}
                  py={'20px'}
                  px={'20px'}
                  onClick={() => submitTypeSettings('submit')}
                  isLoading={loading}
                  loadingText="Loading"
                >
                  Create Shipment
                </Button>
              </Box>
            </Flex>
          )}

          {/* Admin */}
          {platformType === 'admin' && (
            <>
              <HStack spacing={'24px'} mt="5">
                <Box>
                  <Button
                    _hover={{
                      color: '#FFEDE6',
                      backgroundColor: '#FF4C02',
                    }}
                    w={'100%'}
                    boxShadow={'lg'}
                    color={'#ffffff'}
                    backgroundColor={'#ff4c02'}
                    _focus={{ outline: 'none' }}
                    type="submit"
                    m={0}
                    py={'20px'}
                    px={'20px'}
                    onClick={() => submitTypeSettings('invoice')}
                    isLoading={loading}
                    loadingText="Loading"
                  >
                    {membership?.status_membership == 'Active'
                      ? 'Generate Invoice'
                      : 'Create Invoice'}
                  </Button>
                </Box>
                <Box>
                  <Button
                    _hover={{
                      color: '#FFEDE6',
                      backgroundColor: '#FF4C02',
                    }}
                    w={'100%'}
                    boxShadow={'lg'}
                    color={'#FF4C02'}
                    border={'1px solid #ff4c02'}
                    backgroundColor={'transparent'}
                    _focus={{ outline: 'none' }}
                    type="submit"
                    m={0}
                    py={'10px'}
                    px={'20px'}
                    isLoading={loading}
                    loadingText="Loading"
                    onClick={() => submitTypeSettings('update')}
                  >
                    Update Shipment
                  </Button>
                </Box>
                {currentPackageData?.new_status_urshipper ==
                  'Shipment Accepted' && (
                  <Box>
                    <Button
                      _hover={{
                        color: '#FFEDE6',
                        backgroundColor: '#FF4C02',
                      }}
                      w={'100%'}
                      boxShadow={'lg'}
                      color={'#FF4C02'}
                      border={'1px solid #ff4c02'}
                      backgroundColor={'transparent'}
                      _focus={{ outline: 'none' }}
                      type="submit"
                      m={0}
                      py={'10px'}
                      px={'20px'}
                      isLoading={loading}
                      loadingText="Loading"
                      onClick={() =>
                        submitTypeSettings('print-label')
                      }
                    >
                      Create FedEx Label
                    </Button>
                  </Box>
                )}
              </HStack>
            </>
          )}
        </form>
      </Box>
      <Box>
        <VerticalStepper
          isSenderCompleted={senderCompleted}
          isReceiverCompleted={receiverCompleted}
          isRatesCompleted={ratesCompleted}
          selectedSectionFromParent={selectedSection}
        />
      </Box>
    </HStack>
  );
};

const AllRate: React.FC<IPropsAllRate> = ({
  el,
  index,
  membership,
}) => {
  return (
    <Box>
      {
        // @ts-ignore
        <Flex
          w={'100%'}
          justifyContent={'space-between'}
          my={'10px'}
          fontSize={
            !membership && el.membership === 'Free' ? '14px' : '8px'
          }
        >
          <Box w={'50%'}>{el.desc_marked}</Box>
          <Box alignItems={'end'} color={'#171717'} w={'30%'}>
            {`IDR ${currencyFormaterIDR(el.marked)}`}
          </Box>
        </Flex>
      }

      <Flex
        w={'100%'}
        justifyContent={'space-between'}
        my={'10px'}
        fontSize={
          !membership && el.membership === 'Free' ? '14px' : '8px'
        }
      >
        <Box
          w={'50%'}
        >{`${el.desc_vat} (${el.percentage_vat}%)`}</Box>
        <Box alignItems={'end'} color={'#171717'} w={'30%'}>
          {`IDR ${currencyFormaterIDR(el.displayVAT)}`}
        </Box>
      </Flex>

      <Flex
        w={'100%'}
        justifyContent={'space-between'}
        my={'10px'}
        fontSize={
          !membership && el.membership === 'Free' ? '14px' : '8px'
        }
      >
        <Box
          fontSize={
            !membership && el.membership === 'Free' ? '14px' : '8px'
          }
          color={index != 0 ? '#171717' : '#A2A2A2'}
          w={'50%'}
        >
          {el.desc_total_rate}
        </Box>
        {!membership && el.membership === 'Free' ? (
          <Box
            color={index != 0 ? '#A2A2A2' : '#171717'}
            alignItems={'end'}
            fontWeight={index != 0 ? 400 : 600}
            w={'30%'}
            fontSize={index !== 0 ? '14px' : '16px'}
          >
            {`IDR ${currencyFormaterIDR(el.totalMarked)}`}
          </Box>
        ) : (
          <Box
            color={index != 0 ? '#A2A2A2' : '#171717'}
            alignItems={'end'}
            fontWeight={index != 0 ? 400 : 600}
            w={'30%'}
            fontSize={index !== 0 ? '9px' : '8px'}
          >
            {`IDR ${currencyFormaterIDR(el.totalMarked)}`}
          </Box>
        )}
      </Flex>
      {index !== 0 && (
        <Box>
          <Flex
            fontSize={
              !membership && el.membership === 'Free' ? '14px' : '8px'
            }
            w={'100%'}
            justifyContent={'space-between'}
            my={'10px'}
          >
            <Box
              fontSize={
                !membership && el.membership === 'Free'
                  ? '14px'
                  : '8px'
              }
              w={'50%'}
            >
              {el.desc_after_discount}
            </Box>
            <Box alignItems={'end'} color={'#171717'} w={'30%'}>
              {`IDR ${currencyFormaterIDR(el.totalDiscount)}`}
            </Box>
          </Flex>
          <Flex
            w={'100%'}
            justifyContent={'space-between'}
            my={'10px'}
          >
            <Box
              fontSize={
                !membership && el.membership === 'Free'
                  ? '14px'
                  : '8px'
              }
              w={'50%'}
            >{`${el.desc_after_discount} ${el.membership}`}</Box>
            <Box
              fontSize={
                !membership && el.membership === 'Free'
                  ? '14px'
                  : '8px'
              }
              alignItems={'end'}
              color={'#171717'}
              fontWeight={600}
              w={'30%'}
            >
              {`IDR ${currencyFormaterIDR(el.afterDiscount)}`}
            </Box>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

// COMPONENTS END //

const shingleShipment = registerComponent(
  'single-shipment-urshipper-v2',
  {
    type: 'none',
    icon: 'none',
    group: 'text',
    defaultProps: {
      platform_type: 'admin',
      shipment_id: '',
      user_id: '',
      relation_user_shipment: '',
      action: { type: 'none' },
      action_print_label_success: { type: 'none' },
      action_create_invoice_success: { type: 'none' },
      action_print_label_failed: { type: 'none' },
      action_create_invoice_failed: { type: 'none' },
    },
    propDefinition: {
      platform_type: {
        group: 'Text',
        type: 'string',
        options: {
          format: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Client', value: 'client' },
          ],
        },
      },
      shipment_id: { group: 'Text', type: 'expression', options: {} },
      user_id: { group: 'Text', type: 'expression', options: {} },
      relation_user_shipment: {
        group: 'Text',
        type: 'expression',
        options: {},
      },
      // @ts-ignore
      action: {
        group: 'After Submit Form',
        label: 'After Submit Form',
        type: 'action',
        options: [{ type: 'none' }],
      },
      // @ts-ignore
      action_print_label_success: {
        group: 'After Create Label',
        label: 'After Create Label',
        type: 'action',
        options: [{ type: 'none' }],
      },
      // @ts-ignore
      action_create_invoice_success: {
        group: 'After Create Invoice',
        label: 'After Create Invoice',
        type: 'action',
        options: [{ type: 'none' }],
      },
      // @ts-ignore
      action_print_label_failed: {
        group: 'Failed Create Label',
        label: 'Failed Create Label',
        type: 'action',
        options: [{ type: 'none' }],
      },
      // @ts-ignore
      action_create_invoice_failed: {
        group: 'Failed Create Invoice',
        label: 'Failed Create Invoice',
        type: 'action',
        options: [{ type: 'none' }],
      },
    },
    Component: (props: any) => {
      const actionAfterSubmitForm = props.hooks.useActionTrigger(
        props.properties.action,
        props.data.page.row,
        props.pageSource
      );

      const actionAfterPrintLabel = props.hooks.useActionTrigger(
        props.properties.action_print_label_success,
        props.data.page.row,
        props.pageSource
      );

      const actionAfterCreateInvoice = props.hooks.useActionTrigger(
        props.properties.action_create_invoice_success,
        props.data.page.row,
        props.pageSource
      );

      const actionFailedPrintLabel = props.hooks.useActionTrigger(
        props.properties.action_print_label_success,
        props.data.page.row,
        props.pageSource
      );

      const actionFailedCreateInvoice = props.hooks.useActionTrigger(
        props.properties.action_create_invoice_success,
        props.data.page.row,
        props.pageSource
      );

      const client = props.hooks.useClient();

      const shipmentId = props.hooks.useTemplate(
        props.properties.shipment_id
      );
      // const userId = props.hooks.useTemplate(props.properties.user_id);
      const platformType = props.properties.platform_type;
      const relationUserShipment = props.hooks.useTemplate(
        props.properties.relation_user_shipment
      );
      const title = props.hooks.useEvaluate(
        props.properties.relation_user_shipment
      );

      // TODO: Test
      console.log(
        '>>>>>>>>>>>>>>> props.properties',
        props,
        relationUserShipment,
        title
      );

      const {
        data,
        loading: load,
        error,
      } = useFetchQore(
        '/v1/grid/other_related?limit=500&params[country_code]=ID&params[search_country_by_name]='
      );

      console.log('>>>>>>>>>>>>>>> data', data, load, error);

      const [pageData, setPageData] = useState<any>({
        isLoading: true,
        errors: [],
      });

      const [shippingData, setShippingData] = useState<any>({
        my_shipment: null,
      });

      const [currentFormData, setCurrentFormData] = useState<any>({
        my_shipment: null,
      });

      const [currentPackageData, setCurrentPackageData] =
        useState<any>({});
      const [submitType, setSubmitType] = useState<any>('');
      const [allAddressBook, setAllAddressBook] = useState<any>([]);
      const [removedPackageList, setRemovedPackageList] = useState<
        any[]
      >([]);
      const [removeItemList, setRemoveItemList] = useState<any[]>([]);
      const [updateItemList, setUpdateItemList] = useState<any[]>([]);
      const [itemBook, setItemBook] = useState<any[]>([]);
      const [validatePrintLabel, setValidatePrintLabel] =
        useState<boolean>(false);
      const [rateError, setRateError] = useState<any>([]);
      // Data
      const [countryData, setCountryData] = useState<any[]>([]);
      const [stateData, setStateData] = useState<any[]>([]);
      const [currencyData, setCurrencyData] = useState<any[]>([]);
      const [userData, setUserData] = useState<any>({});
      const [membership, setMembership] = useState<any>({});

      // State Data
      const [senderCountryCode, setSenderCountryCode] =
        useState<string>('ID');
      const [selectSenderStateMode, setSelectSenderStateMode] =
        useState<boolean>(false);
      const [receiverCountryCode, setReceiverCountryCode] =
        useState<string>('');
      const [selectReceiverStateMode, setSelectReceiverStateMode] =
        useState<boolean>(false);
      const [selectSenderCityMode, setSelectSenderCityeMode] =
        useState<string>('');

      // TODO: form here
      const form = useForm({
        defaultValues: {
          sender: {},
          receiver: {},
          shipping: {},
        },
      });

      const {
        watch,
        setValue,
        handleSubmit,
        formState: { errors },
      } = form;

      // State Validation
      const [
        validationNumberOfPackage,
        setValidationNumberOfPackage,
      ] = useState<number>(0);
      const [validationTotalWeight, setValidationTotalWeight] =
        useState<number>(0);
      const [
        validationTotalActualWeight,
        setValidationActualTotalWeight,
      ] = useState<number>(0);
      const [
        validationTotalDeclareValue,
        setValidationTotalDeclareValue,
      ] = useState<number>(0);
      const [
        validationComoditiesItemQuantity,
        setValidationComoditiesItemQuantity,
      ] = useState<number>(0);
      const [
        validationTotalCustomValue,
        setValidationTotalCustomValue,
      ] = useState<number>(0);
      const [
        validationComoditiesItemWeight,
        setValidationComoditiesItemWeight,
      ] = useState<number>(0);
      // Global Status
      const [pageIsLoading, setPageIsLoading] =
        useState<boolean>(true);
      const [boxIsLoading, setBoxIsLoading] =
        useState<boolean>(false);
      const [removeLoad, setRemoveLoad] = useState<boolean>(false);
      const [updateItemLoad, setUpdateItemLoad] =
        useState<boolean>(false);
      const [loading, setLoading] = useState<boolean>(true);
      // Chakra Animation
      const animateCoverBox = useDisclosure();
      const animateCoverBoxCurrency = useDisclosure();
      const animateContainerBox = useDisclosure();
      const animateNewContainer = useDisclosure();
      const animateNewItems = useDisclosure();
      const animateRate = useDisclosure();
      // Dropdown State
      const receiverCountryPopover = useDisclosure();
      // Country Data
      const [filteredCountryReceiver, setFilteredCountryReceiver] =
        useState<any[]>([]);
      // Dropdown Search Box
      const [searchCurrencyLoad, setSearchCurrencyLoad] =
        useState<boolean>(false);
      const [searchItemBookLoad, setSearchItemBookLoad] =
        useState<boolean>(false);
      const [
        receiverCountrySearchBoxLoad,
        setReceiverCountrySearchBoxLoad,
      ] = useState<boolean>(false); // Load Search
      // Currency Data

      // Dropdown State
      const [urshipperRate, setUrshipperRate] = useState<any[0]>([]);
      const [searchCurrency, setSearchCurrency] =
        useState<string>('');
      const [searchItemBook, setSearchItemBook] =
        useState<string>('');
      const [filteredCurrency, setFilteredCurrency] = useState<any[]>(
        []
      );
      const [filterItemBook, setFilterItemBook] = useState<any[]>([]);
      // Receiver Address State
      const [searchReceiverCountry, setSearchReceiverCountry] =
        useState<string>('');
      const [
        selectedItemsReceiverCountry,
        setSelectedItemReceiverCountry,
      ] = useState<string>('');
      // Handle Dropdown Select Receiver Country
      const handleSelectedItemsChangeReceiverCountry = async (
        selectedItems: any
      ) => {
        if (selectedItems) {
          setSelectedItemReceiverCountry(
            `${selectedItems.code} - ${selectedItems.country}`
          );
          receiverCountryPopover.onClose();
        }
      };
      //Handle Dropdown Select Currency
      const [
        customSelectedItemsCurrency,
        setCustomSelectedItemCurrency,
      ] = useState<string>('');
      const [currencyCode, setCurrencyCode] = useState<string>('');
      const currencyCodePopover = useDisclosure();
      const currencyCodePopoverItem = useDisclosure();
      const handleSelectedItemsChangeCurrency = async (
        selectedItems: any,
        type: any
      ) => {
        if (selectedItems) {
          setCustomSelectedItemCurrency(
            `${selectedItems.code} - ${selectedItems.currency}`
          );
          setCurrencyCode(selectedItems.code);
          if (type === 'item') {
            currencyCodePopoverItem.onClose();
          } else {
            currencyCodePopover.onClose();
          }
          // let declareCurrency: any = currencyCode
          // let totalDeclareAmount: any = 0
          // let newPack: any = []
          // allPackage.forEach((el: any) => {
          //     el.commodities.declareValue.currencyCode = selectedItems.code
          //     totalDeclareAmount += Number(el.commodities.declareValue.currencyAmount) * Number(el.commodities.qty)
          //     el.commodities.declareValue.currencyCode = declareCurrency
          //     newPack.push(el)
          // });
          // setAllPackage(newPack)
        }
      };

      //Handle Dropdown Select Item Book
      const [customSelectedItemsBook, setCustomSelectedItemBook] =
        useState<string>('');
      const [currentItemBook, setCurrentItemBook] = useState<any>({});
      const itemBookPopover = useDisclosure();
      const handleSelectedItemBook = async (
        selectedItems: any,
        type: any
      ) => {
        if (selectedItems) {
          setCustomSelectedItemBook(
            `${selectedItems.harmonized_code} - ${selectedItems.item_description} - ${selectedItems.quantity} - ${selectedItems.weight} kg - ${selectedItems.custom_value} - ${selectedItems.lookup_currency}`
          );

          setCurrentItemBook(selectedItems);
        }
      };

      // TODO: temp to uupdate.
      const [selectedFedexAccount, setSelectedFedexAccount] =
        useState<String>(''); // use default acc id.

      // Data Func
      const generateDefaultFommValue = (
        status: string,
        data: any | any
      ) => {
        const country =
          platformType === 'client'
            ? {
                id: 1,
                label: 'ID - Indonesia',
                value: 'Indonesia',
                code: 'ID',
              }
            : {
                id: 1,
                label: 'ID - Indonesia',
                value: 'Indonesia',
                code: 'ID',
              };

        let receiverCountry;
        let defaultCurrency;
        let receiverState;

        if (status === 'Incomplete' || status === 'Completed') {
          const stateOption = stateData?.map((el) => {
            return {
              value: el.province,
              label: `${el.code} - ${el.province} - ${el.country_name}`,
              id: el.id,
              code: el.code,
              countryCode: el.country_code,
            };
          });

          const countryOptions = countryData?.map((el) => {
            return {
              value: el.country,
              label: `${el.code} - ${el.country}`,
              id: el.id,
              code: el.code,
            };
          });

          const currencyOption = currencyData?.map((el) => {
            return {
              value: el.currency,
              label: `${el.code} - ${el.currency}`,
              id: el.id,
            };
          });

          const packOption = [
            {
              value: 'Your Packaging',
              label: 'Your Packaging',
              id: 1,
            },
            {
              value: 'Pak',
              label: 'Pak',
              id: 2,
            },
          ];

          countryOptions.sort();
          currencyOption.sort();
          stateOption.sort();

          const findCountry = countryOptions.find(
            (c: any) => c.value === data?.lookup_receiver_country
          );

          const findCurrency = currencyOption.find(
            (c: any) => c.value === data?.lookup_currency
          );

          receiverCountry = findCountry;
          defaultCurrency = findCurrency;

          if (data?.lookup_state_name) {
            const findState = stateOption.find(
              (c: any) => c.value === data?.lookup_state_name
            );
            receiverState = findState;
            setReceiverCountryCode(data?.lookup_receiver_country);
            setSelectReceiverStateMode(true);
            setValue('sender', {
              fullname: data?.sender_name,
              company: data?.sender_contact_company,
              phone_number: data?.sender_phone,
              email: data?.sender_email,
              streetLine1: data?.sender_streetline_1,
              streetLine2: data?.sender_streetline_2,
              streetLine3: data?.sender_streetline_3,
              city: data?.sender_city,
              state: data?.sender_province,
              country: data?.sender_country,
              zipCode: data?.sender_zip_code,
              address: data?.id,
            });
            setValue('receiver', {
              fullname: data?.receiver_full_name,
              company: data?.receiver_company,
              phone_number: data?.receiver_phone,
              email: data?.receiver_email,
              streetLine1: data?.receiver_street_address_1,
              streetLine2: data?.receiver_street_address_2,
              streetLine3: data?.receiver_street_address_3,
              city: data?.receiver_city,
              state: receiverState,
              country: receiverCountry,
              zipCode: data?.receiver_zip_code,
            });
            setValue('shipping', {
              date: data?.shipment_date,
              vat: data?.vat_number,
              special_instructions: data?.special_instructions,
              add_reference: data?.add_refrence,
              freight_cost: data?.freight_cost,
              insurance_cost: data?.insurance_cost,
              package_type: data?.package_type,
              is_declare_value: data?.is_declare_value,
              currency: defaultCurrency,
              import_duty_charge: data?.import_duty_charge,
              disbursement_fee_charge: data?.disbursement_fee_charge,
            });
          } else {
            receiverState = data?.receiver_province;

            setValue('sender', {
              fullname: data?.sender_name,
              company: data?.sender_contact_company,
              phone_number: data?.sender_phone,
              email: data?.sender_email,
              streetLine1: data?.sender_streetline_1,
              streetLine2: data?.sender_streetline_2,
              streetLine3: data?.sender_streetline_3,
              city: data?.sender_city,
              state: data?.sender_province,
              country: data?.sender_country,
              zipCode: data?.sender_zip_code,
              address: data?.id,
            });
            setValue('receiver', {
              fullname: data?.receiver_full_name,
              company: data?.receiver_company,
              phone_number: data?.receiver_phone,
              email: data?.receiver_email,
              streetLine1: data?.receiver_street_address_1,
              streetLine2: data?.receiver_street_address_2,
              streetLine3: data?.receiver_street_address_3,
              city: data?.receiver_city,
              stateString: receiverState,
              country: receiverCountry,
              zipCode: data?.receiver_zip_code,
            });
            setValue('shipping', {
              date: data?.shipment_date,
              vat: data?.vat_number,
              special_instructions: data?.special_instructions,
              add_reference: data?.add_refrence,
              freight_cost: data?.freight_cost,
              insurance_cost: data?.insurance_cost,
              package_type:
                data?.package_type === 'Pak'
                  ? packOption[1]
                  : packOption[0],
              is_declare_value: data?.is_declare_value,
              currency: defaultCurrency,
              import_duty_charge: data?.import_duty_charge,
              disbursement_fee_charge: data?.disbursement_fee_charge,
            });
          }
        } else {
          setValue('sender', {
            fullname: data?.sender_name,
            company: data?.sender_company,
            phone_number: data?.sender_phone,
            email: data?.sender_email,
            streetLine1: data?.sender_streetline_1,
            streetLine2: data?.sender_streetline_2,
            streetLine3: data?.sender_streetline_3,
            city: data?.sender_city,
            state: data?.sender_province,
            country,
            zipCode: data?.sender_zip_code,
            address: data?.id,
          });
        }
      };

      // Data Func`
      const checkIsActiveMembership = (membership: any) => {
        if (!membership) return false;
        if (membership.status_membership == 'Active') {
          return true;
        } else {
          return false;
        }
      };

      // Use Default Address
      const usedDefaultAddress = async () => {
        const information: any = watch();

        if (
          !information?.sender?.fullname &&
          !information?.sender?.email
        ) {
          const country =
            platformType === 'client'
              ? {
                  id: 1,
                  label: 'ID - Indonesia',
                  value: 'Indonesia',
                }
              : {
                  id: '',
                  label: '',
                  value: '',
                };

          setValue('sender', {
            fullname: userData?.full_name,
            company: userData?.company,
            phone_number: userData?.phone_number,
            email: userData?.email,
            streetLine1: userData?.street_line_1,
            streetLine2: userData?.street_line_2,
            streetLine3: userData?.street_line_3,
            city: userData?.city,
            state: userData?.state,
            zipCode: userData?.zip_code,
            country,
            address: userData.id,
          });
        }
      };

      // Get Currency Code
      const getCurrencyData = async (id: any) => {
        const getTotalRow = await client.project.axios.get(
          `${server}/v1/table/currency_code?limit=1`,
          { headers: headers }
        );
        if (getTotalRow.data.total_rows) {
          const currencyLength = getTotalRow.data.total_rows;
          const getAllCurrency = await client.project.axios.get(
            `${server}/v1/table/currency_code?limit=${currencyLength}`,
            { headers: headers }
          );
          setCurrencyData(getAllCurrency.data.items);
          setFilteredCurrency(getAllCurrency.data.items);

          for (
            let index = 0;
            index < getAllCurrency.data.items.length;
            index++
          ) {
            const element = getAllCurrency.data.items[index];
            if (element.id === id) {
              handleSelectedItemsChangeCurrency(element, `item`);
            }
          }
        }
      };

      // Get List Item Book
      const getListItemBook = async () => {
        setSearchItemBookLoad(true);
        let temp: any = [];
        const currencyFilter = itemBook.filter((el: any) => {
          if (
            el.item_description
              .toLowerCase()
              .match(searchItemBook.toLowerCase())
          ) {
            temp.push(el);
          } else if (
            el.harmonized_code
              .toLowerCase()
              .match(searchItemBook.toLowerCase())
          ) {
            temp.push(el);
          }
          return el.item_description
            .toLowerCase()
            .match(searchItemBook.toLowerCase());
        });
        setFilterItemBook(temp);
        setTimeout(() => {
          setSearchItemBookLoad(false);
        }, 500);
      };

      const addTemporItems = () => {
        setCurrentPackageData({
          ...currentPackageData,
          relation_shipment_package_comodities_items: [
            ...currentPackageData.relation_shipment_package_comodities_items,
            {
              relation_shipment_package_comodities: shipmentId,
              item_description: '',
              quantity: 1,
              weight: 0.01,
              custom_value: 1,
              country_manufacture: 'Indonesia',
              country_code: 'IN',
              harmonized_code: '',
              lookup_currency: '',
              lookup_currency_code: '',
            },
          ],
        });
        let newAllPackage = [];

        for (
          let index = 0;
          index <
          currentPackageData
            .relation_shipment_package_comodities_items.length;
          index++
        ) {
          const element =
            currentPackageData
              .relation_shipment_package_comodities_items[index];
          newAllPackage.push(element);
          newAllPackage.push({
            relation_shipment_package_comodities: shipmentId,
            item_description: '',
            quantity: 1,
            weight: 0.01,
            custom_value: 1,
            country_manufacture: 'Indonesia',
            country_code: 'IN',
            harmonized_code: '',
            lookup_currency: '',
            lookup_currency_code: '',
          });
        }

        // Package Validation
        const packageValidation = validatePackage(
          currentPackageData,
          currentPackageData.relation_myshopment_package_items,
          'package'
        );
        setValidationNumberOfPackage(
          Number(packageValidation?.validationNumberOfPackage)
        );
        setValidationTotalWeight(
          Number(packageValidation?.totalWeight)
        );
        setValidationActualTotalWeight(
          Number(packageValidation?.totalActualWeight)
        );
        setValidationTotalDeclareValue(
          packageValidation?.validationTotalCoverAmount
        );
        // Item Validation
        const itemValidation = validatePackage(
          currentPackageData,
          newAllPackage,
          'item'
        );
        setValidationComoditiesItemQuantity(
          itemValidation?.itemTotalQuantity
        );
        setValidationComoditiesItemWeight(
          itemValidation?.itemTotalWeight
        );
        setValidationTotalCustomValue(
          itemValidation?.itemTotalCustomValue
        );
      };

      const addTemporPackage = () => {
        setCurrentPackageData(
          currentPackageData.package_type === 'Pak'
            ? {
                ...currentPackageData,
                relation_myshopment_package_items: [
                  ...currentPackageData.relation_myshopment_package_items,
                  {
                    relation_myshopment_package: shipmentId,
                    description: '',
                    quantity: 1,
                    weight: 0.01,
                    dimensions_length: 1,
                    dimensions_width: 1,
                    dimensions_height: 1,
                    dimensions_weight: (1 * 1 * 1) / 5000,
                    chargeable_weight: 1,
                    declare_value_amount: 0,
                  },
                ],
                package_type: 'Pak',
              }
            : {
                ...currentPackageData,
                relation_myshopment_package_items: [
                  ...currentPackageData.relation_myshopment_package_items,
                  {
                    relation_myshopment_package: shipmentId,
                    description: '',
                    quantity: 1,
                    weight: 0.01,
                    dimensions_length: 1,
                    dimensions_width: 1,
                    dimensions_height: 1,
                    dimensions_weight: (1 * 1 * 1) / 5000,
                    chargeable_weight: 1,
                    declare_value_amount: 0,
                  },
                ],
                package_type: 'Your Packaging',
              }
        );

        let newPackage = [];

        for (
          let index = 0;
          index <
          currentPackageData.relation_myshopment_package_items.length;
          index++
        ) {
          const element =
            currentPackageData.relation_myshopment_package_items[
              index
            ];
          newPackage.push(element);
          newPackage.push({
            relation_myshopment_package: shipmentId,
            description: '',
            quantity: 1,
            weight: 0.01,
            dimensions_length: 1,
            dimensions_width: 1,
            dimensions_height: 1,
            dimensions_weight: (1 * 1 * 1) / 5000,
            chargeable_weight: 1,
            declare_value_amount: 0,
          });
        }
        // Package Validation
        const packageValidation = validatePackage(
          currentPackageData,
          currentPackageData.relation_myshopment_package_items,
          'package'
        );
        setValidationNumberOfPackage(
          Number(packageValidation?.validationNumberOfPackage)
        );
        setValidationTotalWeight(
          Number(packageValidation?.totalWeight)
        );
        setValidationActualTotalWeight(
          Number(packageValidation?.totalActualWeight)
        );
        setValidationTotalDeclareValue(
          packageValidation?.validationTotalCoverAmount
        );
        // Item Validation
        const itemValidation = validatePackage(
          currentPackageData,
          currentPackageData.relation_shipment_package_comodities_items,
          'item'
        );
        setValidationComoditiesItemQuantity(
          itemValidation?.itemTotalQuantity
        );
        setValidationComoditiesItemWeight(
          itemValidation?.itemTotalWeight
        );
        setValidationTotalCustomValue(
          itemValidation?.itemTotalCustomValue
        );
      };

      // Load user and shipping resources
      useEffect(() => {
        (async () => {
          if (shipmentId && relationUserShipment) {
            await getNewData();
          }

          if (shippingData.my_shipment !== null) {
            setPageData({ ...pageData, isLoading: false });
          }

          setPageIsLoading(false);
          setLoading(false);
        })();
      }, [relationUserShipment, shipmentId]);

      // Generate Default Value
      useEffect(() => {
        if (!shippingData || !userData) return;
        const { my_shipment } = shippingData;
        if (!my_shipment) return;
        const shipmentStatus = my_shipment?.status_form || 'Draft';
        if (shipmentStatus == 'Draft') {
          generateDefaultFommValue(shipmentStatus, userData);
        } else {
          generateDefaultFommValue(shipmentStatus, my_shipment);
        }

        if (userData.primary_address) {
          usedDefaultAddress();
        }
      }, [shippingData, userData]);

      // User Membership
      useEffect(() => {
        (async () => {
          if (relationUserShipment) {
            const userMembership = await getUserMembership(
              client,
              Number(relationUserShipment)
            );
            const isActiveMembership = checkIsActiveMembership(
              userMembership[0]
            );
            userMembership?.length > 0 &&
              isActiveMembership &&
              setMembership({ ...userMembership[0] });
          }
        })();
      }, [relationUserShipment]);

      // List Filter Currency Data
      useEffect(() => {
        if (searchItemBook.trim() != ``) {
          getListItemBook();
        }
      }, [searchItemBook]);

      // No Package & No Package Items
      useEffect(() => {
        if (
          currentPackageData
            ?.relation_shipment_package_comodities_items?.length ===
            0 &&
          currentPackageData?.id
        ) {
          addTemporItems();
        }

        if (
          currentPackageData?.relation_myshopment_package_items
            ?.length === 0 &&
          currentPackageData?.id
        ) {
          addTemporPackage();
        }
      }, [
        currentPackageData?.relation_shipment_package_comodities_items
          ?.length,
        currentPackageData?.relation_myshopment_package_items?.length,
      ]);

      // TODO: also here.
      const getNewData = async () => {
        console.log('>>>>>> getNewData');
        const shipping = await getData(
          client,
          relationUserShipment,
          shipmentId
        );

        // TODO: Shipment data
        await getCurrencyData(
          shipping.shipment_data[0].relation_declare_value_code
        );

        if (countryData.length === 0) {
          const country = await getCountryData(client);
          const state = await getProvinceData(client);
          country.length > 0 && setCountryData(country);
          state.length > 0 && setStateData(state);
        }

        if (shipping?.selectAllBook.length > 0) {
          setItemBook(shipping?.selectAllBook);
        }

        shipping?.shipment_data.length > 0 &&
          setCurrentPackageData(shipping?.shipment_data[0]);

        if (
          shipping?.shipment_data[0]
            ?.relation_myshopment_package_items?.length > 0
        ) {
          // Package Validation
          const packageValidation = validatePackage(
            shipping?.shipment_data[0],
            shipping?.shipment_data[0]
              ?.relation_myshopment_package_items,
            'package'
          );
          setValidationNumberOfPackage(
            Number(packageValidation?.validationNumberOfPackage)
          );
          setValidationTotalWeight(
            Number(packageValidation?.totalWeight)
          );
          setValidationActualTotalWeight(
            Number(packageValidation?.totalActualWeight)
          );
          setValidationTotalDeclareValue(
            packageValidation?.validationTotalCoverAmount
          );
          // Item Validation
          const itemValidation = validatePackage(
            shipping?.shipment_data[0],
            shipping?.shipment_data[0]
              ?.relation_shipment_package_comodities_items,
            'item'
          );
          setValidationComoditiesItemQuantity(
            itemValidation?.itemTotalQuantity
          );
          setValidationComoditiesItemWeight(
            itemValidation?.itemTotalWeight
          );
          setValidationTotalCustomValue(
            itemValidation?.itemTotalCustomValue
          );
        }

        shipping?.allAddressBook.length > 0 &&
          setUserData(shipping?.allAddressBook[0]);

        shipping?.addressBook.length > 0 &&
          setAllAddressBook(shipping?.addressBook);

        shipping?.shipment_data.length > 0 &&
          setShippingData({
            ...shippingData,
            my_shipment: shipping?.shipment_data[0],
          });
      };

      const addItemBook = () => {
        setCurrentPackageData({
          ...currentPackageData,
          relation_shipment_package_comodities_items: [
            ...currentPackageData.relation_shipment_package_comodities_items,
            currentItemBook,
          ],
        });

        let newAllPackage = [];

        for (
          let index = 0;
          index <
          currentPackageData
            .relation_shipment_package_comodities_items.length;
          index++
        ) {
          const element =
            currentPackageData
              .relation_shipment_package_comodities_items[index];
          newAllPackage.push(element);
          newAllPackage.push(currentItemBook);
        }

        // Package Validation
        const packageValidation = validatePackage(
          currentPackageData,
          currentPackageData.relation_myshopment_package_items,
          'package'
        );
        setValidationNumberOfPackage(
          Number(packageValidation?.validationNumberOfPackage)
        );
        setValidationTotalWeight(
          Number(packageValidation?.totalWeight)
        );
        setValidationActualTotalWeight(
          Number(packageValidation?.totalActualWeight)
        );
        setValidationTotalDeclareValue(
          packageValidation?.validationTotalCoverAmount
        );
        // Item Validation
        const itemValidation = validatePackage(
          currentPackageData,
          newAllPackage,
          'item'
        );
        setValidationComoditiesItemQuantity(
          itemValidation?.itemTotalQuantity
        );
        setValidationComoditiesItemWeight(
          itemValidation?.itemTotalWeight
        );
        setValidationTotalCustomValue(
          itemValidation?.itemTotalCustomValue
        );

        // Empty State
        setCustomSelectedItemBook('');
        setCurrentItemBook({});
        setSearchItemBook('');
      };

      const newItems = async () => {
        animateNewItems.onOpen();
        addTemporItems();
      };

      const addFromBook = async () => {
        animateNewItems.onOpen();
        await addItemBook();
      };

      const updateFormShipment = async (val: any) => {
        setLoading(true);
        if (platformType === 'client') {
          if (submitType === 'update') {
            await updateShipmentData();
            await updatePackage();
            await getRate();
            setPageData({ ...pageData, isLoading: true });
            setPageIsLoading(true);
            setLoading(true);
            await getNewData();
            setPageData({ ...pageData, isLoading: false });
            setPageIsLoading(false);
            setLoading(false);
          } else if (submitType === 'rate') {
            await updateShipmentData();
            await updatePackage();
            await getRate();
            setPageData({ ...pageData, isLoading: true });
            setPageIsLoading(true);
            setLoading(true);
            await getNewData();
            setPageData({ ...pageData, isLoading: false });
            setPageIsLoading(false);
            setLoading(false);
          } else if (submitType === 'submit') {
            await updateShipmentData();
            await updatePackage();
            await updateStatusShipment();
            await actionAfterSubmitForm.handleClick();
          }
        } else {
          if (submitType === 'invoice') {
            await updateShipmentData();
            await updatePackage();
            await createInvoice();
          }

          if (submitType === 'print-label') {
            await updateShipmentData();
            await updatePackage();
            await fedexPDFToQore();
          }

          if (submitType === 'update') {
            await updateShipmentData();
            await updatePackage();
            await getRate();
            setPageData({ ...pageData, isLoading: true });
            setPageIsLoading(true);
            setLoading(true);
            await getNewData();
            setPageData({ ...pageData, isLoading: false });
            setPageIsLoading(false);
            setLoading(false);
          }

          if (submitType === 'rate') {
            await updateShipmentData();
            await updatePackage();
            await getRate();
            setPageData({ ...pageData, isLoading: true });
            setPageIsLoading(true);
            setLoading(true);
            await getNewData();
            setPageData({ ...pageData, isLoading: false });
            setPageIsLoading(false);
            setLoading(false);
          }
        }
        setLoading(false);
      };

      const updateShipmentData = async () => {
        try {
          const information: any = watch();
          const operations: any = [];

          const tableName = 'my_shipment';
          const rowId = Number(shipmentId);

          if (information?.shipping?.file?.file) {
            const token = await client.project.axios.get(
              `${server}/v1/files/token/table/${tableName}/id/${rowId}/column/attachment_file?access=write`,
              { operations: operations },
              { headers: headers }
            );

            const fileForm = new FormData();
            fileForm.append(
              'attachment_file',
              information?.shipping?.file?.file,
              'test.pdf'
            );

            const uploadFile = await client.project.axios.post(
              `${server}/v1/files/upload?token=${token.data.token}`,
              fileForm,
              {
                headers: {
                  'x-qore-engine-admin-secret':
                    'LPUFvfGKE6KscQt5DAYb2AtqZiUjm76Z',
                  'content-type': 'multipart/form-data',
                },
              }
            );
          }

          let updatePayload;

          let senderState;
          let receiverState;

          if (information?.receiver?.state?.code) {
            receiverState = information?.receiver?.state?.code;
          } else {
            receiverState = information?.receiver?.stateString;
          }

          if (platformType === 'client') {
            // TODO: add relation here.
            updatePayload = {
              status_form: 'Incomplete',
              sender_name: information?.sender.fullname,
              sender_phone: information?.sender.phone_number,
              sender_email: information?.sender.email,
              sender_streetline_1: information?.sender.streetLine1,
              sender_streetline_2: information?.sender.streetLine2,
              sender_streetline_3: information?.sender.streetLine3,
              sender_province: information?.sender.state,
              sender_zip_code: information?.sender.zipCode,
              sender_city: information?.sender.city,
              sender_country: information?.sender?.country?.value,
              sender_contact_company: information?.sender.company,
              receiver_full_name: information?.receiver.fullname,
              receiver_phone: information?.receiver.phone_number,
              receiver_email: information?.receiver.email,
              receiver_street_address_1:
                information?.receiver.streetLine1,
              receiver_street_address_2:
                information?.receiver.streetLine2,
              receiver_street_address_3:
                information?.receiver.streetLine3,
              receiver_province: receiverState,
              receiver_zip_code: information?.receiver.zipCode,
              receiver_city: information?.receiver.city,
              receiver_company: information?.receiver.company,
              relation_country_my_shipment:
                information?.receiver?.country?.id,
              shipment_date: new Date(),
              vat_number: Number(information?.shipping.vat),
              special_instructions:
                information?.shipping.special_instructions,
              add_refrence: information?.shipping.add_reference,
              insurance_cost: Number(
                information?.shipping.insurance_cost
              ),
              freight_cost: Number(
                information?.shipping.freight_cost
              ),
              package_type: information?.shipping.package_type?.value,
              signature: information?.shipping.signature,
              relation_declare_value_code:
                information?.shipping?.currency?.id,
              gross_weight: Number(
                validationTotalActualWeight.toFixed(2)
              ),
              net_weight: Number(validationTotalWeight.toFixed(2)),
              is_declare_value:
                information?.shipping.is_declare_value,
              // new_status_urshipper: 'Ready to Ship',
              shipment: selectedFedexAccount,
            };
          }

          if (platformType === 'admin') {
            updatePayload = {
              // status_form: "Incomplete",
              sender_name: information?.sender.fullname,
              sender_phone: information?.sender.phone_number,
              sender_email: information?.sender.email,
              sender_streetline_1: information?.sender.streetLine1,
              sender_streetline_2: information?.sender.streetLine2,
              sender_streetline_3: information?.sender.streetLine3,
              sender_province: information?.sender.state,
              sender_zip_code: information?.sender.zipCode,
              sender_city: information?.sender.city,
              sender_country: information?.sender?.country?.value,
              sender_contact_company: information?.sender.company,
              receiver_full_name: information?.receiver.fullname,
              receiver_phone: information?.receiver.phone_number,
              receiver_email: information?.receiver.email,
              receiver_street_address_1:
                information?.receiver.streetLine1,
              receiver_street_address_2:
                information?.receiver.streetLine2,
              receiver_street_address_3:
                information?.receiver.streetLine3,
              receiver_province: receiverState,
              receiver_zip_code: information?.receiver.zipCode,
              receiver_city: information?.receiver.city,
              receiver_company: information?.receiver.company,
              relation_country_my_shipment:
                information?.receiver?.country?.id,
              shipment_date: new Date(),
              vat_number: Number(information?.shipping.vat),
              special_instructions:
                information?.shipping.special_instructions,
              add_refrence: information?.shipping.add_reference,
              insurance_cost: Number(
                information?.shipping.insurance_cost
              ),
              freight_cost: Number(
                information?.shipping.freight_cost
              ),
              package_type: information?.shipping.package_type,
              signature: information?.shipping.signature,
              relation_declare_value_code:
                information?.shipping?.currency?.id,
              import_duty_charge:
                information?.shipping?.import_duty_charge,
              disbursement_fee_charge:
                information?.shipping?.disbursement_fee_charge,
              gross_weight: Number(
                validationTotalActualWeight.toFixed(2)
              ),
              net_weight: Number(validationTotalWeight.toFixed(2)),
            };
          }

          if (updatePayload) {
            if (information?.receiver?.state?.id) {
              Object.assign(updatePayload, {
                relation_state_code: information?.receiver?.state?.id,
              });
            } else {
              operations.push({
                operation: 'RemoveRelation',
                instruction: {
                  table: 'my_shipment',
                  name: 'removeRelation',
                  condition: {
                    $and: [
                      {
                        relation_user_my_shipment: Number(
                          relationUserShipment
                        ),
                      },
                      {
                        id: Number(shipmentId),
                      },
                    ],
                  },
                  relation: {
                    name: 'relation_state_code',
                    data: {
                      origin: Number(shipmentId),
                      target: currentPackageData.relation_state_code,
                    },
                  },
                },
              });
            }
          }

          const update = {
            operation: 'Update',
            instruction: {
              table: 'my_shipment',
              name: 'updateShipment',
              condition: {
                $and: [
                  {
                    relation_user_my_shipment: Number(
                      relationUserShipment
                    ),
                  },
                  {
                    id: Number(shipmentId),
                  },
                ],
              },
              set: updatePayload,
            },
          };

          operations.push(update);

          const response = await client.project.axios.post(
            `${server}/v1/execute`,
            { operations: operations },
            { headers: headers }
          );
        } catch (error) {
          return error;
        }
      };

      const updatePackage = async () => {
        let operations = [];

        const shippingPackage =
          shippingData?.my_shipment
            ?.relation_myshopment_package_items;

        if (shippingPackage.length > 0) {
          for (
            let index = 0;
            index <
            currentPackageData.relation_myshopment_package_items
              .length;
            index++
          ) {
            const element =
              currentPackageData.relation_myshopment_package_items[
                index
              ];
            if (element.id) {
              // Update Package
              let updatePackage = {
                operation: 'Update',
                instruction: {
                  table: 'package',
                  name: 'updatePackage' + `${index}`,
                  condition: {
                    $and: [
                      {
                        relation_myshopment_package: shipmentId,
                      },
                      {
                        id: element.id,
                      },
                    ],
                  },
                  set: {
                    relation_myshopment_package: shipmentId,
                    description: element.description,
                    quantity: element.quantity,
                    weight: element.weight,
                    dimensions_length: element.dimensions_length,
                    dimensions_width: element.dimensions_width,
                    dimensions_height: element.dimensions_height,
                    dimensions_weight: element.dimensions_weight,
                    chargeable_weight: element.chargeable_weight,
                    declare_value_amount:
                      element.declare_value_amount,
                  },
                },
              };

              operations.push(updatePackage);
            } else {
              // Insert New Package
              let insertPackage = {
                operation: 'Insert',
                instruction: {
                  table: 'package',
                  name: 'insertPackage' + `${index}`,
                  data: {
                    relation_myshopment_package: shipmentId,
                    description: element.description,
                    quantity: element.quantity,
                    weight: element.weight,
                    dimensions_length: element.dimensions_length,
                    dimensions_width: element.dimensions_width,
                    dimensions_height: element.dimensions_height,
                    dimensions_weight: element.dimensions_weight,
                    chargeable_weight: element.chargeable_weight,
                    declare_value_amount:
                      element.declare_value_amount,
                  },
                },
              };

              operations.push(insertPackage);
            }
          }
          // Remove Package
          for (
            let index = 0;
            index < removedPackageList.length;
            index++
          ) {
            const element = removedPackageList[index];
            let deleteRowPackage = {
              operation: 'Delete',
              instruction: {
                table: 'package',
                name: 'removePackage' + `${index}`,
                condition: {
                  $and: [
                    {
                      relation_myshopment_package: shipmentId,
                    },
                    {
                      id: element.id,
                    },
                  ],
                },
              },
            };

            operations.push(deleteRowPackage);
          }
        } else {
          // Insert New Package if 0
          for (
            let index = 0;
            index <
            currentPackageData.relation_myshopment_package_items
              .length;
            index++
          ) {
            const element =
              currentPackageData.relation_myshopment_package_items[
                index
              ];
            let insertPackage = {
              operation: 'Insert',
              instruction: {
                table: 'package',
                name: 'insertPackage' + `${index}`,
                data: {
                  relation_myshopment_package: shipmentId,
                  description: element.description,
                  quantity: element.quantity,
                  weight: element.weight,
                  dimensions_length: element.dimensions_length,
                  dimensions_width: element.dimensions_width,
                  dimensions_height: element.dimensions_height,
                  dimensions_weight: element.dimensions_weight,
                  chargeable_weight: element.chargeable_weight,
                  declare_value_amount: element.declare_value_amount,
                },
              },
            };

            operations.push(insertPackage);
          }
        }

        if (
          shippingData?.my_shipment
            ?.relation_shipment_package_comodities_items?.length > 0
        ) {
          let comodities =
            currentPackageData.relation_shipment_package_comodities_items;
          // Update Item Comodities
          for (let index = 0; index < comodities.length; index++) {
            const element = comodities[index];
            if (element.id) {
              let updateCommodities = {
                operation: 'Update',
                instruction: {
                  table: 'package_comodities',
                  name: 'updateCommodities' + `${index}`,
                  condition: {
                    $and: [
                      {
                        relation_shipment_package_comodities:
                          shipmentId,
                      },
                      {
                        id: element.id,
                      },
                    ],
                  },
                  set: {
                    relation_shipment_package_comodities: shipmentId,
                    item_description: element.item_description,
                    quantity: element.quantity,
                    weight: element.weight,
                    custom_value: element.custom_value,
                    harmonized_code: element.harmonized_code,
                  },
                },
              };

              operations.push(updateCommodities);
            } else {
              let insertCommodities = {
                operation: 'Insert',
                instruction: {
                  table: 'package_comodities',
                  name: 'insertCommodities' + `${index}`,
                  data: {
                    relation_shipment_package_comodities: shipmentId,
                    item_description: element.item_description,
                    quantity: element.quantity,
                    weight: element.weight,
                    custom_value: element.custom_value,
                    harmonized_code: element.harmonized_code,
                    country_code: element.country_code,
                    country_manufacture: element.country_manufacture,
                  },
                },
              };

              operations.push(insertCommodities);
            }
          }
          // Remove Commodities
          for (
            let index = 0;
            index < removeItemList.length;
            index++
          ) {
            const element = removeItemList[index];
            let deleteRowPackage = {
              operation: 'Delete',
              instruction: {
                table: 'package_comodities',
                name: 'removePackage' + `${index}`,
                condition: {
                  $and: [
                    {
                      relation_shipment_package_comodities:
                        shipmentId,
                    },
                    {
                      id: element.id,
                    },
                  ],
                },
              },
            };

            operations.push(deleteRowPackage);
          }
        } else {
          for (
            let index = 0;
            index <
            currentPackageData
              .relation_shipment_package_comodities_items.length;
            index++
          ) {
            const element =
              currentPackageData
                .relation_shipment_package_comodities_items[index];
            let insertCommodities = {
              operation: 'Insert',
              instruction: {
                table: 'package_comodities',
                name: 'insertCommodities' + `${index}`,
                data: {
                  relation_shipment_package_comodities: shipmentId,
                  item_description: element.item_description,
                  quantity: element.quantity,
                  weight: element.weight,
                  custom_value: element.custom_value,
                  harmonized_code: element.harmonized_code,
                  country_code: element.country_code,
                  country_manufacture: element.country_manufacture,
                },
              },
            };

            operations.push(insertCommodities);
          }
        }

        const response = await client.project.axios.post(
          `${server}/v1/execute`,
          {
            operations: operations,
          },
          { headers: headers }
        );
      };

      const getRate = async () => {
        try {
          let container: any = [];
          for (
            let index = 0;
            index <
            currentPackageData?.relation_myshopment_package_items
              .length;
            index++
          ) {
            const element =
              currentPackageData?.relation_myshopment_package_items[
                index
              ];

            const temporPackage = {
              commodities: {
                qty: element.quantity,
                weight: element.weight,
                length: element.dimensions_length,
                width: element.dimensions_width,
                height: element.dimensions_height,
                declareValue: {
                  isDeclare: currentPackageData.is_declare_value,
                  currencyCode: currencyCode,
                  currencyAmount: element.declare_value_amount,
                },
              },
            };
            container.push(temporPackage);
          }

          const information: any = watch();

          const payload = {
            sender: 'default',
            receiver: {
              zip_code: information?.receiver?.zipCode,
              country_code: information?.receiver?.country?.code,
            },
            container: container,
            shippingDate: formatDate(new Date()),
            isDeclareValue: currentPackageData?.is_declare_value,
            signature: currentPackageData?.signature,
            packageType: currentPackageData?.package_type,
          };

          // const getDenoRow = await client.project.axios.post(
          //   `${server}/v1/action/api_crendential/get_rate/1`,
          //   { args: payload },
          //   {
          //     headers: {
          //       authority: 'staging-qore-data-apple-202883.qore.dev',
          //       'x-qore-engine-admin-secret':
          //         'LPUFvfGKE6KscQt5DAYb2AtqZiUjm76Z',
          //     },
          //   }
          // );

          const getMultiRate = await client.project.axios.post(
            `${server}/v1/action/api_crendential/get_rates/1`,
            { args: payload },
            {
              headers: {
                authority: 'staging-qore-data-apple-202883.qore.dev',
                'x-qore-engine-admin-secret':
                  'LPUFvfGKE6KscQt5DAYb2AtqZiUjm76Z',
              },
            }
          );

          // reset urshipperrate
          setUrshipperRate([]);

          if (
            getMultiRate?.data?.result?.response?.data?.errors
              ?.length > 0
          ) {
            setLoading(false);
            throw getMultiRate?.data?.result?.response?.data?.errors;
          }
          // if (
          //   getDenoRow?.data?.result?.response?.data?.errors?.length >
          //   0
          // ) {
          //   setLoading(false);
          //   throw getDenoRow?.data?.result?.response?.data?.errors;
          // }
          const rateData = getMultiRate?.data?.result;

          for (let i = 0; i < rateData.length; i++) {
            const getDenoRow = rateData[i];

            console.log('getDenoRow >>>>>', getDenoRow);

            if (
              getDenoRow?.dataFedex?.output?.rateReplyDetails
                ?.length > 0
            ) {
              setRateError([]);
              const responseFedex =
                getDenoRow.dataFedex.output.rateReplyDetails[0]
                  .ratedShipmentDetails[0];
              const totalBaseCharge = responseFedex.totalBaseCharge;

              let totalSurcharge = 0;
              let totalTaxes = 0;
              let totalDiscount = 0;
              let estimatedDeliv: any = false;

              if (
                getDenoRow?.dataFedex?.output?.rateReplyDetails[0]
                  ?.commit?.dateDetail?.dayFormat
              ) {
                let dateDeliv =
                  getDenoRow?.dataFedex?.output?.rateReplyDetails[0]
                    ?.commit?.dateDetail?.dayFormat;
                estimatedDeliv = formatDateWithTime(
                  new Date(dateDeliv)
                );
              }

              // responseFedex.shipmentRateDetail.surCharges.forEach((el: any) => {
              //   totalSurcharge += el.amount;
              // });

              for (
                let index = 0;
                index <
                responseFedex.shipmentRateDetail.surCharges.length;
                index++
              ) {
                const element =
                  responseFedex.shipmentRateDetail.surCharges[index];
                totalSurcharge += element.amount;
              }

              // responseFedex.shipmentRateDetail.taxes.forEach((el: any) => {
              //   totalSurcharge += el.amount;
              // });

              for (
                let index = 0;
                index < responseFedex.shipmentRateDetail.taxes.length;
                index++
              ) {
                const element =
                  responseFedex.shipmentRateDetail.taxes[index];
                totalTaxes += element.amount;
              }

              // responseFedex.shipmentRateDetail.freightDiscount.forEach(
              //   (el: any) => {
              //     totalSurcharge += el.amount;
              //   }
              // );

              for (
                let index = 0;
                index <
                responseFedex.shipmentRateDetail.freightDiscount
                  .length;
                index++
              ) {
                const element =
                  responseFedex.shipmentRateDetail.freightDiscount[
                    index
                  ];
                totalDiscount += element.amount;
              }

              const totalCharge =
                totalBaseCharge +
                totalSurcharge +
                totalTaxes -
                totalDiscount;

              const getTransitRate = await client.project.axios.post(
                `${server}/v1/action/finance_management/transit_rate/1`,
                {},
                {
                  headers: {
                    authority:
                      'staging-qore-data-apple-202883.qore.dev',
                    'x-qore-engine-admin-secret':
                      'LPUFvfGKE6KscQt5DAYb2AtqZiUjm76Z',
                  },
                }
              );

              const allTransitRate = getTransitRate.data.result;
              let allRate: any = [];

              allTransitRate.forEach((el: any) => {
                const marked = Number(
                  totalCharge +
                    (totalCharge * Number(el.percentage_shipping)) /
                      100
                );
                const discount =
                  Number(marked) * (Number(el.discount) / 100);

                const subTotal = Number(marked) - Number(discount);

                const displayVAT = Number(
                  subTotal * (Number(el.percentage_vat) / 100)
                );

                const totalPrice = subTotal + displayVAT;

                if (estimatedDeliv) {
                  el.delivTime = estimatedDeliv;
                } else {
                  el.delivTime = false;
                }

                el.priority = getDenoRow.priority;
                el.fedexAccountId = getDenoRow.id;
                el.label = getDenoRow.label;
                el.marked = marked;
                el.displayVAT = displayVAT;
                el.totalDiscount = discount;
                el.subTotal = subTotal;
                el.totalPrice = totalPrice;
                allRate.push(el);
              });

              if (
                membership?.lookup_membership_type &&
                membership?.status_membership === 'Active'
              ) {
                membership.rate = allRate.filter(
                  (el: any, index: number) =>
                    el.membership ===
                    membership?.lookup_membership_type
                );
              }

              // setUrshipperRate(allRate);
              console.log('allRate >>>>>', allRate);
              setUrshipperRate((prev: any) => [...prev, ...allRate]);

              animateRate.onOpen();
            }
          }

          console.log('urshipperRate >>>>>', urshipperRate);
        } catch (error) {
          setRateError(error);
        }
      };

      const getLastTrackingId = async () => {
        const operations = [];

        const lastOrder = {
          operation: 'Select',
          instruction: {
            name: 'selectLastTrackingId',
            orderBy: {
              shipment_tracking_id: 'DESC',
            },
            condition: {
              status_form: 'Completed',
            },
            limit: 1,
            table: 'my_shipment',
          },
        };

        operations.push(lastOrder);

        const response = await client.project.axios.post(
          `${server}/v1/execute`,
          {
            operations: operations,
          },
          {
            headers: {
              Accept: '*/*',
              'Content-Type': 'application/json',
              'x-qore-engine-admin-secret':
                'LPUFvfGKE6KscQt5DAYb2AtqZiUjm76Z',
            },
          }
        );

        if (response.data.results.selectLastTrackingId.length > 0) {
          const trackingId =
            response.data.results.selectLastTrackingId[0]
              .shipment_tracking_id;
          const id = trackingId.split('UR')[1];
          return Number(id);
        } else {
          return 0;
        }
      };

      const updateStatusShipment = async () => {
        const lastTrackingId = await getLastTrackingId();

        const generateShipmentTrackingId = async (
          lastTrackingId: any
        ) => {
          const zeroPad = (num: any, places: any) =>
            String(num).padStart(places, '0');
          const unique = zeroPad(Number(lastTrackingId) + 1, 6);
          let prefixOrderId = `UR${unique}`;

          return prefixOrderId;
        };

        const shipmentTrackingId = await generateShipmentTrackingId(
          lastTrackingId
        );

        let operations: any = [];
        const updateStatus = {
          operation: 'Update',
          instruction: {
            table: 'my_shipment',
            name: 'updateMyShipment',
            condition: {
              $and: [
                {
                  relation_user_my_shipment: relationUserShipment,
                },
                {
                  id: shipmentId,
                },
              ],
            },
            set: {
              shipment_tracking_id: shipmentTrackingId,
              status_form: 'Completed',
            },
          },
        };

        operations.push(updateStatus);

        const response = await client.project.axios.post(
          `${server}/v1/execute`,
          {
            operations: operations,
          },
          { headers: headers }
        );

        return response.data;
      };

      const createInvoice = async () => {
        try {
          setLoading(true);

          const response = await client.project.axios.post(
            `${server}/v1/action/action/gcp_xendit_invoice/1`,
            {
              args: {
                data: [
                  {
                    id: shipmentId,
                  },
                ],
              },
            },
            { headers: headers }
          );

          await actionAfterCreateInvoice.handleClick();
          return response.data;
        } catch (error) {
          await actionFailedCreateInvoice.handleClick();
          return error;
        } finally {
          setLoading(false);
        }
      };

      const removePackage = async (val: any) => {
        await setRemoveLoad(true);
        animateNewContainer.onClose();
        let newPack: any = [];
        let newRemovedPackage: any = [];

        for (
          let index = 0;
          index < removedPackageList.length;
          index++
        ) {
          const element = removedPackageList[index];
          newRemovedPackage.push(element);
        }

        for (
          let index = 0;
          index <
          currentPackageData?.relation_myshopment_package_items
            .length;
          index++
        ) {
          const element =
            currentPackageData?.relation_myshopment_package_items[
              index
            ];
          if (index !== val) {
            newPack.push(element);
          }

          if (index === val) {
            if (element.id) {
              newRemovedPackage.push(element);
            }
          }
        }

        setRemovedPackageList(newRemovedPackage);

        let numberOfPackage: any = 0;
        let itemWeight: any = 0;
        let dimensionsWeight: any = 0;
        let totalDeclareAmount: any = 0;

        setCurrentPackageData({
          ...currentPackageData,
          relation_myshopment_package_items: newPack,
        });

        // Package Validation
        const packageValidation = validatePackage(
          currentPackageData,
          currentPackageData.relation_myshopment_package_items,
          'package'
        );
        setValidationNumberOfPackage(
          Number(packageValidation?.validationNumberOfPackage)
        );
        setValidationTotalWeight(
          Number(packageValidation?.totalWeight)
        );
        setValidationActualTotalWeight(
          Number(packageValidation?.totalActualWeight)
        );
        setValidationTotalDeclareValue(
          packageValidation?.validationTotalCoverAmount
        );
        // Item Validation
        const itemValidation = validatePackage(
          currentPackageData,
          currentPackageData?.relation_shipment_package_comodities_items,
          'item'
        );
        setValidationComoditiesItemQuantity(
          itemValidation?.itemTotalQuantity
        );
        setValidationComoditiesItemWeight(
          itemValidation?.itemTotalWeight
        );
        setValidationTotalCustomValue(
          itemValidation?.itemTotalCustomValue
        );

        animateNewContainer.onOpen();
        await setRemoveLoad(false);
      };

      const removeItems = async (val: any) => {
        await setRemoveLoad(true);
        animateNewContainer.onClose();
        let newPackItems: any = [];
        let newRemovedPackageItems: any = [];

        for (let index = 0; index < removeItemList.length; index++) {
          const element = removeItemList[index];
          newRemovedPackageItems.push(element);
        }

        for (
          let index = 0;
          index <
          currentPackageData
            ?.relation_shipment_package_comodities_items.length;
          index++
        ) {
          const element =
            currentPackageData
              ?.relation_shipment_package_comodities_items[index];
          if (index !== val) {
            newPackItems.push(element);
          }

          if (index === val) {
            if (element.id) {
              newRemovedPackageItems.push(element);
            }
          }
        }

        setRemoveItemList(newRemovedPackageItems);

        setCurrentPackageData({
          ...currentPackageData,
          relation_shipment_package_comodities_items: newPackItems,
        });

        // Package Validation
        const packageValidation = validatePackage(
          currentPackageData,
          currentPackageData?.relation_myshopment_package_items,
          'package'
        );
        setValidationNumberOfPackage(
          Number(packageValidation?.validationNumberOfPackage)
        );
        setValidationTotalWeight(
          Number(packageValidation?.totalWeight)
        );
        setValidationTotalDeclareValue(
          packageValidation?.validationTotalCoverAmount
        );
        // Item Validation
        const itemValidation = validatePackage(
          currentPackageData,
          newPackItems,
          'item'
        );
        setValidationComoditiesItemWeight(
          itemValidation?.itemTotalWeight
        );
        setValidationTotalCustomValue(
          itemValidation?.itemTotalCustomValue
        );

        animateNewContainer.onOpen();
        await setRemoveLoad(false);
      };

      const updateItems = async (val: any) => {
        setUpdateItemLoad(true);
        let newUpdateItemList: any = [];

        for (let index = 0; index < val.length; index++) {
          const element = val[index];
          newUpdateItemList.push(element);
        }

        setCurrentPackageData({
          ...currentPackageData,
          relation_shipment_package_comodities_items:
            newUpdateItemList,
        });

        // Package Validation
        const packageValidation = validatePackage(
          currentPackageData,
          currentPackageData?.relation_myshopment_package_items,
          'package'
        );
        setValidationNumberOfPackage(
          Number(packageValidation?.validationNumberOfPackage)
        );
        setValidationTotalWeight(
          Number(packageValidation?.totalWeight)
        );
        setValidationTotalDeclareValue(
          packageValidation?.validationTotalCoverAmount
        );
        // Item Validation
        const itemValidation = validatePackage(
          currentPackageData,
          newUpdateItemList,
          'item'
        );
        setValidationComoditiesItemWeight(
          itemValidation?.itemTotalWeight
        );
        setValidationTotalCustomValue(
          itemValidation?.itemTotalCustomValue
        );

        setTimeout(() => {
          setUpdateItemLoad(false);
        }, 1000);
      };

      const newYourPackaging = async () => {
        animateNewContainer.onOpen();
        addTemporPackage();
      };

      const fedexPDFToQore = async () => {
        try {
          setLoading(true);

          const response = await client.project.axios.post(
            `${server}/v1/action/my_shipment/fedex_pdf_to_qore/${shipmentId}`,
            {},
            { headers: headers }
          );

          await actionAfterPrintLabel.handleClick();
          return response.data;
        } catch (error) {
          await actionFailedPrintLabel.handleClick();
          return error;
        } finally {
          setLoading(false);
        }
      };

      return (
        <Center
          my={'20px'}
          minH={'100vh'}
          w={'100%'}
          bg="transparent"
        >
          <Stack
            position={'relative'}
            w={'auto'}
            minW={'700px'}
            maxW={'1000px'}
            pb={'20px'}
          >
            <Box>
              <Box>
                <UserInformationForm
                  platformType={platformType}
                  currentPackageData={currentPackageData}
                  countryData={countryData}
                  stateData={stateData}
                  setSelectSenderStateMode={setSelectSenderStateMode}
                  setSelectReceiverStateMode={
                    setSelectReceiverStateMode
                  }
                  setSenderCountryCode={setSenderCountryCode}
                  setReceiverCountryCode={setReceiverCountryCode}
                  senderCountryCode={senderCountryCode}
                  receiverCountryCode={receiverCountryCode}
                  selectSenderStateMode={selectSenderStateMode}
                  selectReceiverStateMode={selectReceiverStateMode}
                  userData={userData}
                  receiverCountryDefault={
                    shippingData?.my_shipment?.lookup_receiver_country
                  }
                  watch={watch}
                  currencyDefault={
                    shippingData?.my_shipment?.lookup_currency
                  }
                  countryDefault={'Indonesia'}
                  receiverDataDefault={
                    shippingData?.my_shipment?.lookup_state_code
                  }
                  packageTypeDefault={
                    shippingData?.my_shipment?.package_type
                  }
                  currencyData={currencyData}
                  filterItemBook={filterItemBook}
                  shipmentData={shippingData}
                  allAddressBook={allAddressBook}
                  // shipmentData={userData?.shipment_data[0]}
                  validationNumberOfPackage={
                    validationNumberOfPackage
                  }
                  validationTotalWeight={validationTotalWeight}
                  validationComoditiesItemWeight={
                    validationComoditiesItemWeight
                  }
                  validationTotalCustomValue={
                    validationTotalCustomValue
                  }
                  validatePrintLabel={validatePrintLabel}
                  urshipperRate={urshipperRate}
                  form={form}
                  getRate={getRate}
                  // printLabel={printLabel}
                  updatePackage={updatePackage}
                  createInvoice={createInvoice}
                  fedexPDFToQore={fedexPDFToQore}
                  updateFormShipment={updateFormShipment}
                  removeLoad={removeLoad}
                  removePackage={removePackage}
                  removeItems={removeItems}
                  updateItems={updateItems}
                  updateItemLoad={updateItemLoad}
                  newYourPackaging={newYourPackaging}
                  addFromBook={addFromBook}
                  newItems={newItems}
                  setCurrentPackageData={setCurrentPackageData}
                  setValidationTotalDeclareValue={
                    setValidationTotalDeclareValue
                  }
                  setValidationTotalWeight={setValidationTotalWeight}
                  setValidationNumberOfPackage={
                    setValidationNumberOfPackage
                  }
                  setValidationTotalCustomValue={
                    setValidationTotalCustomValue
                  }
                  setValidationComoditiesItemWeight={
                    setValidationComoditiesItemWeight
                  }
                  setSearchCurrency={setSearchCurrency}
                  searchItemBookLoad={searchItemBookLoad}
                  itemBook={itemBook}
                  setSearchItemBook={setSearchItemBook}
                  customSelectedItemsCurrency={
                    customSelectedItemsCurrency
                  }
                  customSelectedItemsBook={customSelectedItemsBook}
                  handleSelectedItemsChangeCurrency={
                    handleSelectedItemsChangeCurrency
                  }
                  handleSelectedItemBook={handleSelectedItemBook}
                  pageIsLoading={pageIsLoading}
                  loading={loading}
                  boxIsLoading={boxIsLoading}
                  searchCurrencyLoad={searchCurrencyLoad}
                  animateCoverBox={animateCoverBox}
                  animateCoverBoxCurrency={animateCoverBoxCurrency}
                  animateContainerBox={animateContainerBox}
                  animateNewContainer={animateNewContainer}
                  currencyCodePopover={currencyCodePopover}
                  currencyCodePopoverItem={currencyCodePopoverItem}
                  itemBookPopover={itemBookPopover}
                  filteredCurrency={filteredCurrency}
                  validationTotalDeclareValue={
                    validationTotalDeclareValue
                  }
                  setSubmitType={setSubmitType}
                  setValidationActualTotalWeight={
                    setValidationActualTotalWeight
                  }
                  validationTotalActualWeight={
                    validationTotalActualWeight
                  }
                  setValidationComoditiesItemQuantity={
                    setValidationComoditiesItemQuantity
                  }
                  validationComoditiesItemQuantity={
                    validationComoditiesItemQuantity
                  }
                  membership={membership}
                  handleSelectedFedexAccount={setSelectedFedexAccount}
                  fedexAccount={selectedFedexAccount}
                />
              </Box>
              {rateError && rateError.length > 0 && (
                <Box>
                  {rateError.map((el: any, index: number) => {
                    return (
                      <Box
                        key={index}
                        my={'20px'}
                        boxShadow={'lg'}
                        position={'relative'}
                        p={'20px'}
                        backgroundColor={'white'}
                      >
                        <Box color={'red'}> {el?.message} </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Stack>
        </Center>
      );
    },
  }
);

export default shingleShipment;
