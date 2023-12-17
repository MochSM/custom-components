// import qs from 'qs'
import { useEffect, useState, useCallback } from 'react';
import { registerComponent } from '@qorebase/app-cli';

import {
  Box,
  Button,
  HStack,
  Stack,
  SimpleGrid,
  Text,
  Flex,
  Grid,
  GridItem,
  Skeleton,
  Center,
  Divider,
  Switch,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Spinner,
  InputGroup,
  Input,
  InputRightElement,
  CircularProgress,
  Badge,
  VStack,
  StackDivider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  useDisclosure,
  // Tooltip,
  FormLabel,
  RadioGroup,
  Radio,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spacer,
  forwardRef,
  ScaleFade,
  SlideFade,
  Icon,
  FormControl,
  InputRightAddon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  Container,
} from '@chakra-ui/react';
// import DatePicker from 'react-date-picker'
// import { QuestionOutlineIcon, AddIcon } from '@chakra-ui/icons'
import { FiSearch } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import { BsSignpost } from 'react-icons/bs';
import { MdVerified } from 'react-icons/md';
import {
  BiTrash,
  BiMapPin,
  BiSolidPackage,
  BiPlus,
  BiRefresh,
} from 'react-icons/bi';
import { SiGooglemaps } from 'react-icons/si';
import { FaCity } from 'react-icons/fa';
import ReactSelect from 'react-select';
import { get } from 'react-hook-form';

const server = 'https://staging-qore-data-apple-202883.qore.dev';
const headers = {
  accept: '*/*',
  'x-qore-engine-admin-secret': 'LPUFvfGKE6KscQt5DAYb2AtqZiUjm76Z',
};

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

function formatDate(date: Date) {
  const daysOfWeek = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ];
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

  const day = daysOfWeek[date.getDay()];
  const dayOfMonth = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}, ${dayOfMonth} ${month}, ${year}`;
}

function currencyFormaterIDR(val: number) {
  const formatter = new Intl.NumberFormat('IDR').format(
    Math.floor(val)
  );
  return formatter;
}

const LoaderItem: React.FC = () => (
  <Center>
    <Spinner />
  </Center>
);

const LoaderBox: React.FC = () => (
  <Center height={'100%'}>
    <Spinner />
  </Center>
);

function validatePackage(package_type: any, newArr: any) {
  let validationNumberOfPackage: any = 0;
  let validationTotalCoverAmount: any = 0;
  let totalWeight = 0;
  let totalActualWeight = 0;

  for (let index = 0; index < newArr.length; index++) {
    const element = newArr[index];
    validationNumberOfPackage += Number(element.commodities.qty);
  }

  if (
    package_type === 'YOUR_PACKAGING' ||
    package_type === 'Your Packaging'
  ) {
    for (let index = 0; index < newArr.length; index++) {
      const el = newArr[index];
      let itemWeight: any = 0;
      let dimensionsWeight: any = 0;
      let tempWeight =
        Number(el.commodities.weight) * Number(el.commodities.qty);
      let tempVolumeWeight =
        ((Number(el.commodities.length) *
          Number(el.commodities.width) *
          Number(el.commodities.height)) /
          5000) *
        Number(el.commodities.qty);
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
        Number(el.commodities.declareValue.currencyAmount) *
        Number(el.commodities.qty);
    }

    return {
      validationNumberOfPackage: validationNumberOfPackage,
      validationTotalCoverAmount: validationTotalCoverAmount,
      totalWeight: totalWeight, // Chargeable weight
      totalActualWeight: totalActualWeight, // Gross
    };
  } else {
    for (let index = 0; index < newArr.length; index++) {
      const el = newArr[index];
      let itemWeight: any = 0;
      let tempWeight =
        Number(el.commodities.weight) * Number(el.commodities.qty);
      let precisionWeight = tempWeight.toFixed(2);
      itemWeight += Number(precisionWeight);
      totalWeight += Number(itemWeight);
      validationTotalCoverAmount +=
        Number(el.commodities.declareValue.currencyAmount) *
        Number(el.commodities.qty);
    }

    return {
      validationNumberOfPackage: validationNumberOfPackage,
      validationTotalCoverAmount: validationTotalCoverAmount,
      totalWeight: totalWeight,
    };
  }
}

const YourPackagingData = ({
  cover,
  packageData,
  index,
  currency,
  setAllPackage,
  allPackage,
  removePackage,
  removeLoad,
  animateNewContainer,
  setValidationNumberOfPackage,
  setValidationTotalWeight,
  setValidationTotalDeclareValue,
  setValidationActualTotalWeight,
  packageType,
}: {
  cover: any;
  packageData: any;
  index: number;
  currency: any;
  setAllPackage: any;
  allPackage: any;
  removePackage: any;
  removeLoad: any;
  animateNewContainer: any;
  setValidationNumberOfPackage: any;
  setValidationTotalWeight: any;
  setValidationTotalDeclareValue: any;
  setValidationActualTotalWeight: any;
  packageType: any;
}) => {
  //Format Currency
  const formatCurrency = (val: any) => val + ` ${currency}`;
  const parseCurrency = (val: any) => {
    return val + `${currency}`;
  };

  //Handle YOUR_PACKAGING
  const [coverAmount, setCoverAmmount] = useState('1');
  const [boxWidth, setBoxWidth] = useState<string>('50%');

  useEffect(() => {
    getBoxWidth();
  }, [cover]);

  const getBoxWidth = () => {
    const widthBox = cover === 'No' ? '50%' : '30%';
    setBoxWidth(widthBox);
  };

  const updateContainer = async (val: any, type: any) => {
    let newAllPackage: any = [];
    let numberOfPackage: any = 0;
    if (type === 'sum') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.commodities.qty = Number(val);
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    } else if (type === 'weight') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.commodities.weight = Number(val);
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    } else if (type === 'length') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.commodities.length = Number(val);
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    } else if (type === 'width') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.commodities.width = Number(val);
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    } else if (type === 'height') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.commodities.height = Number(val);
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    } else if (type === 'cover') {
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl === index) {
          el.commodities.declareValue.currencyAmount = Number(val);
          newAllPackage.push(el);
        } else {
          newAllPackage.push(el);
        }
      });
    }

    setAllPackage(newAllPackage);

    const packageValidation = validatePackage(
      packageType,
      allPackage
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

    //Set Validation
    /* let validationNumberOfPackage: any = 0;
    let validationTotalCoverAmount: any = 0;

    newAllPackage.forEach((el: any) => {
      validationNumberOfPackage += Number(el.commodities.qty);
    });

    let totalWeight = 0;

    await setValidationNumberOfPackage(Number(validationNumberOfPackage));

    newAllPackage.forEach((el: any) => {
      let itemWeight: any = 0;
      let dimensionsWeight: any = 0;
      let tempWeight =
        Number(el.commodities.weight) * Number(el.commodities.qty);
      let tempVolumeWeight =
        ((Number(el.commodities.length) *
          Number(el.commodities.width) *
          Number(el.commodities.height)) /
          5000) *
        Number(el.commodities.qty);
      let precisionWeight = tempWeight.toFixed(2);
      let precisionVolumeWeight = tempVolumeWeight.toFixed(2);

      itemWeight += Number(precisionWeight);
      dimensionsWeight += Number(precisionVolumeWeight);
      validationTotalCoverAmount +=
        Number(el.commodities.declareValue.currencyAmount) *
        Number(el.commodities.qty);

      if (itemWeight > dimensionsWeight) {
        totalWeight += Number(itemWeight);
      } else {
        totalWeight += Number(dimensionsWeight);
      }
    });

    await setValidationTotalWeight(Number(totalWeight));

    await setValidationTotalDeclareValue(validationTotalCoverAmount); */
  };

  return (
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
                      fontSize={'14px'}
                      color={'#FF4C02'}
                      backgroundColor={'#ffffff'}
                      _focus={{ outline: 'none' }}
                      _hover={{
                        backgroundColor: '#f7e9e9',
                      }}
                      border={'1px'}
                      borderColor={'FF4C02'}
                      m={0}
                      h={'14px'}
                      py={'14px'}
                      px={'10px'}
                      onClick={(val: any) => {
                        removePackage(index);
                      }}
                      leftIcon={
                        <CgClose
                          fontSize={'16px'}
                          color={'#FF4C02'}
                        />
                      }
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
              packageType === 'Your Packaging'
                ? 'space-between'
                : 'start'
            }
            gap={5}
            flexWrap={'wrap'}
          >
            <Box w={'30%'}>
              <FormControl isRequired>
                <FormLabel fontWeight={600} mb={'10px'}>
                  Quantity
                </FormLabel>
                <Stack spacing={3}>
                  <InputGroup size="sm">
                    <NumberInput
                      w={'100%'}
                      onChange={(val: any, type: any) =>
                        updateContainer(val, 'sum')
                      }
                      step={1}
                      defaultValue={packageData?.commodities?.qty}
                      min={1}
                      max={40}
                      size={'sm'}
                    >
                      <NumberInputField
                        borderRadius={'md'}
                        borderRightRadius={'0'}
                        _focus={{ outline: 'none' }}
                      />
                    </NumberInput>
                    <InputRightAddon
                      borderRadius={'md'}
                      backgroundColor={'#F5F5F5'}
                      fontWeight={600}
                      children={'pc'}
                    />
                  </InputGroup>
                </Stack>
              </FormControl>
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
                      min={0.02}
                      max={packageType === 'Pak' ? 2.5 : 68}
                      defaultValue={Number(
                        packageData?.commodities?.weight
                      )}
                      precision={2}
                      step={0.01}
                    >
                      <NumberInputField
                        borderRadius={'md'}
                        borderRightRadius={'0'}
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

            {packageType === 'Your Packaging' ? (
              <Box w={'30%'}>
                <FormControl isRequired>
                  <FormLabel fontWeight={600} mb={'10px'}>
                    Dimensions
                  </FormLabel>
                  <Stack
                    borderRadius={'md'}
                    border={'1px solid var(--chakra-colors-gray-200)'}
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
                        value={packageData?.commodities?.length}
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
                        value={packageData?.commodities?.width}
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

                    <Box maxW={'35%'} w={'auto'}>
                      <InputGroup size="sm">
                        <NumberInput
                          borderColor={'transparent'}
                          onChange={(val: any, type: any) => {
                            updateContainer(val, 'height');
                          }}
                          value={packageData?.commodities?.height}
                          max={997.9}
                          min={0.01}
                          precision={0}
                          p={'0'}
                          w={'100%'}
                        >
                          <NumberInputField
                            p={0}
                            textAlign={'center'}
                            _hover={{ borderColor: 'transparent' }}
                            borderColor={'transparent'}
                            _focus={{ outline: 'none' }}
                          />
                        </NumberInput>
                        <InputRightAddon
                          backgroundColor={'#F5F5F5'}
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
            gap={5}
            justifyContent={
              packageType === 'Your Packaging'
                ? 'space-between'
                : 'start'
            }
            flexWrap={'wrap'}
          >
            {packageType === 'Your Packaging' ? (
              <Box w={'30%'}>
                <FormControl isRequired>
                  <FormLabel fontWeight={600} mb={'10px'}>
                    Volumemetric Weight
                  </FormLabel>
                  <InputGroup size="sm">
                    <NumberInput
                      w={'100%'}
                      backgroundColor={'#F5F5F5'}
                      borderRadius={'md'}
                      value={
                        (Number(packageData?.commodities?.length) *
                          Number(packageData?.commodities?.width) *
                          Number(packageData?.commodities?.height)) /
                        5000
                      }
                      isDisabled={true}
                    >
                      <NumberInputField
                        borderRadius={'md'}
                        borderRightRadius={'0'}
                        _focus={{ outline: 'none' }}
                      />
                    </NumberInput>
                    <InputRightAddon
                      borderRadius={'md'}
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

            {packageType === 'Your Packaging' ? (
              <Box w={'30%'}>
                <FormControl isRequired>
                  <FormLabel fontWeight={600} mb={'10px'}>
                    Chargeable Weight
                  </FormLabel>
                  <Stack spacing={3}>
                    <InputGroup size="sm">
                      <NumberInput
                        width={'100%'}
                        backgroundColor={'#F5F5F5'}
                        borderRadius={'md'}
                        value={
                          (Number(packageData?.commodities?.length) *
                            Number(packageData?.commodities?.width) *
                            Number(
                              packageData?.commodities?.height
                            )) /
                            5000 >
                          Number(packageData?.commodities?.weight)
                            ? (Number(
                                packageData?.commodities?.length
                              ) *
                                Number(
                                  packageData?.commodities?.width
                                ) *
                                Number(
                                  packageData?.commodities?.height
                                )) /
                              5000
                            : Number(packageData?.commodities?.weight)
                        }
                        min={0.01}
                        precision={2}
                        isDisabled={true}
                      >
                        <NumberInputField
                          borderRadius={'md'}
                          borderRightRadius={'0'}
                          _focus={{ outline: 'none' }}
                        />
                      </NumberInput>
                      <InputRightAddon
                        borderRadius={'md'}
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

            {cover === 'Yes' && (
              <Box w={'30%'}>
                <FormControl isRequired>
                  <FormLabel fontWeight={600} mb={'10px'}>
                    Insured Value
                  </FormLabel>

                  {currency ? (
                    <Stack spacing={3}>
                      <InputGroup size="sm">
                        <NumberInput
                          w={'100%'}
                          borderRadius={'md'}
                          onChange={(val: any, type: any) => {
                            updateContainer(val, 'cover');
                          }}
                          defaultValue={Number(
                            packageData?.commodities?.declareValue
                              ?.currencyAmount
                          )}
                        >
                          <NumberInputField
                            borderRadius={'md'}
                            borderRightRadius={'0'}
                            _focus={{ outline: 'none' }}
                          />
                        </NumberInput>
                        <InputRightAddon
                          borderRadius={'md'}
                          backgroundColor={'#F5F5F5'}
                          fontWeight={600}
                          children={`${currency}`}
                        />
                      </InputGroup>
                    </Stack>
                  ) : (
                    <Box w={'100%'}>Please Select Currency</Box>
                  )}
                </FormControl>
              </Box>
            )}

            {cover === 'No' && <Box w={'30%'}></Box>}
          </Flex>
        </VStack>
      ) : (
        <LoaderItem />
      )}
    </Box>
  );
};

const AllRateTab = ({
  urshipperRate,
  membershipPlan,
  userMembership,
  getRate,
  loading,
  action,
  showRateButton,
}: {
  urshipperRate: any;
  userMembership: any;
  membershipPlan: any;
  getRate: any;
  loading: any;
  action: any;
  showRateButton: any;
}) => {
  const [tabColor, setTabColor] = useState<any[]>([
    true,
    false,
    false,
    false,
  ]);
  const [tabIndex, setTabIndex] = useState<number>(
    userMembership.length > 0 ? userMembership?.index : 0
  );
  const [iconVerfy, setIconVerfy] = useState<boolean>(false);
  const [boxLoad, setBoxLoad] = useState<boolean>(true);

  useEffect(() => {
    if (userMembership.length > 0) {
      console.log(userMembership, `userMembership`);
      userMembershipSettings();
      setIconVerfy(true);
    }
  }, []);

  useEffect(() => {
    colorSettings();
  }, [tabIndex]);

  const userMembershipSettings = () => {
    setBoxLoad(true);
    let indexNumber = 0;

    for (let index = 0; index < membershipPlan.length; index++) {
      const element = membershipPlan[index];
      if (
        element?.membership ===
        userMembership[0]?.lookup_membership_type
      ) {
        indexNumber = index;
        userMembership[0].membershipIcon = true;
      } else {
        userMembership[0].membershipIcon = false;
      }
    }

    let tabsArr = [];
    for (let index = 0; index < tabColor.length; index++) {
      if (index === indexNumber) {
        tabsArr.push(true);
      } else {
        tabsArr.push(false);
      }
    }
    setTabIndex(indexNumber);
    setTabColor(tabsArr);
    setBoxLoad(false);
  };

  const colorSettings = () => {
    let tabsArr = [];
    for (let index = 0; index < tabColor.length; index++) {
      if (index === tabIndex) {
        tabsArr.push(true);
      } else {
        tabsArr.push(false);
      }
    }
    setTabColor(tabsArr);
    setBoxLoad(false);
  };

  console.log(urshipperRate, `urshipperRate`);

  const groupedByMember = groupByMember(urshipperRate);

  console.log(groupedByMember, `groupedByMember`);
  return (
    <Box w={'100%'}>
      {!boxLoad && (
        <Tabs
          defaultIndex={tabIndex}
          isLazy
          onChange={(index: any) => setTabIndex(index)}
          isFitted
          variant="soft-rounded"
        >
          <Box
            backgroundColor={'#fff'}
            mt={'80px'}
            mb={'20px'}
            p={'24px'}
            boxShadow={'lg'}
          >
            <Center mb={'20px'} flexDirection={'column'}>
              <Box
                color={'#000000'}
                fontSize={'20px'}
                fontWeight={600}
              >
                Pick Your Membership Plan
              </Box>
              <Box
                fontSize={'16px'}
                fontWeight={600}
                color={'rgb(122,122,122)'}
              >
                Select your flexible membership plan for an exclusive
                discounted rate.
              </Box>
            </Center>

            <TabList>
              <Center justifyContent={'space-between'} w={'100%'}>
                {membershipPlan.map(
                  (el: any, tabListIndex: number) => {
                    return (
                      <Box
                        p={'10px'}
                        w={'calc(100% / 4)'}
                        onClick={() => {}}
                      >
                        <Center
                          flexDirection={'column'}
                          bg={
                            tabColor[tabListIndex]
                              ? '#FDE4D9'
                              : '#F7F7F7'
                          }
                        >
                          <Box
                            color={'#000000'}
                            textAlign={'center'}
                            mt={'20px'}
                          >
                            <Box mb={'20px'} fontWeight={600}>
                              {el.membership === 'Free'
                                ? 'Starter'
                                : el.membership}
                            </Box>
                            <Box>
                              {el.membership === 'Free'
                                ? 'No Subscription'
                                : `IDR ${currencyFormaterIDR(
                                    el.price
                                  )} / month`}
                            </Box>
                            <Box mb={'20px'}>
                              {el.membership === 'Free'
                                ? 'Publish Rates'
                                : `${Number(
                                    el.discount
                                  )}% Discount Rates`}
                            </Box>
                          </Box>
                          <Tab
                            w={'90%'}
                            py={'5px'}
                            borderRadius={'10px'}
                            m={'10px'}
                            border={'1px solid #A7A7A7'}
                            color={'#000000'}
                            backgroundColor={'#FFFFFF'}
                            _selected={{
                              border: '1px solid #FF4C02',
                              color: 'white',
                              bg: '#FF4C02',
                            }}
                            key={tabListIndex}
                          >
                            {el.membership === 'Free'
                              ? 'Start'
                              : el.membership}{' '}
                            Rate
                          </Tab>
                        </Center>
                      </Box>
                    );
                  }
                )}
              </Center>
            </TabList>
          </Box>

          <Box
            backgroundColor={'#fff'}
            // mt={'80px'}
            mb={'20px'}
            p={'24px'}
            boxShadow={'lg'}
          >
            <Center mb={'20px'} flexDirection={'column'}>
              <Box
                color={'#000000'}
                fontSize={'20px'}
                fontWeight={600}
              >
                Rates & Delivery
              </Box>
              <Box
                fontSize={'16px'}
                fontWeight={600}
                color={'rgb(122,122,122)'}
              >
                Your rates and delivery estimates for shipping on Tue,
                {formatDate(new Date())}
              </Box>
            </Center>
            <TabPanels transition={'0.3s'}>
              {/* TODO: tambah validasi, show if cheaper than priority 1 */}
              {groupedByMember && groupedByMember.length > 0
                ? groupedByMember.map((rates: any, index: number) => (
                    <TabPanel transition={'0.3s'} key={index}>
                      {/* Estimated Delivery */}
                      {rates.length > 0
                        ? rates.map((el: any, index: number) => (
                            <>
                              {el.elestimatedDeliv && (
                                <VStack mt={'14px'} mb={'10px'}>
                                  <Flex
                                    bg={'#F7F7F7'}
                                    borderRadius={'2px'}
                                    p={'15px 20px'}
                                    w={'100%'}
                                    justifyContent={'space-between'}
                                  >
                                    <Box
                                      color={'#171717'}
                                      fontWeight={'bold'}
                                      w={'220px'}
                                    >
                                      FedEx Intl. Priority
                                    </Box>
                                    <Box
                                      color={'#171717'}
                                      fontWeight={'bold'}
                                    >
                                      {el.elestimatedDeliv}
                                    </Box>
                                    <Box
                                      color={'#171717'}
                                      fontWeight={'bold'}
                                      textAlign={'right'}
                                    >
                                      {`IDR ${currencyFormaterIDR(
                                        el.totalPrice
                                      )}`}
                                    </Box>
                                  </Flex>
                                </VStack>
                              )}
                            </>
                          ))
                        : null}
                    </TabPanel>
                  ))
                : null}
            </TabPanels>
          </Box>
        </Tabs>
      )}
      <Flex gap={5} justifyContent={'end'}>
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
            onClick={action}
          >
            Get Membership
          </Button>
        </Box>

        {showRateButton && (
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
              isLoading={loading}
              loadingText="Calculating"
              onClick={getRate}
              leftIcon={<BiRefresh fontSize={'20px'} />}
            >
              Check Rates
            </Button>
          </Box>
        )}
      </Flex>
    </Box>
  );
};

const ShippingRate = registerComponent('shipping-ratev3-2', {
  type: 'none',
  icon: 'none',
  group: 'text',
  defaultProps: {
    platform_type: '',
    action: { type: 'none' },
    userId: '',
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
    action: {
      group: 'Action',
      type: 'action',
      label: 'Success Action',
      options: { type: 'none' },
    },
    userId: {
      type: 'string',
      options: {
        format: 'text',
      },
    },
  },
  Component: (props: any) => {
    const platformType = props.properties.platform_type;

    const action = props.hooks.useActionTrigger(
      props.properties.action,
      props.data.page.row,
      props.pageSource
    );

    const jumpToPage = async () => {
      try {
        action.handleClick();
      } catch (error) {
        return error;
      }
    };

    const userId = props.hooks.useTemplate(props.properties.userId);
    const client = props.hooks.useClient();

    const actionDenoTest = props.hooks.useActionTrigger(
      props.properties.action,
      props.data.page.row,
      props.pageSource
    );

    // Global Status
    const [pageIsLoading, setPageIsLoading] = useState<boolean>(true);
    const [boxIsLoading, setBoxIsLoading] = useState<boolean>(false);
    const [removeLoad, setRemoveLoad] = useState<boolean>(false);
    //State Rate
    const [userMembership, setUserMembership] = useState<any[]>([]);
    const [membershipPlan, setMembershipPlan] = useState<any[]>([]);
    const [isShowRate, setIsShowRate] = useState<boolean>(false);
    const [showRateButton, setShowRateButton] =
      useState<boolean>(false);

    // Fedex Status
    const [isErrorFedex, setIsErrorFedex] = useState<boolean>(false);
    const [msgErrorFedex, setMsgErrorFedex] = useState<any[]>([]);
    const [transactionId, setTransactionId] = useState<string>('');
    const [accessToken, setAccessToken] = useState<string>('');

    // Chakra Animation
    const animateAddressBox = useDisclosure();
    const animateErrorsBox = useDisclosure();
    const animateCoverBox = useDisclosure();
    const animateContainerBox = useDisclosure();
    const animateNewContainer = useDisclosure();
    const animateRate = useDisclosure();
    // Dropdown Search Box
    const [
      receiverCountrySearchBoxLoad,
      setReceiverCountrySearchBoxLoad,
    ] = useState<boolean>(false); // Load Search
    const [
      receiverCountryProvinceSearchBoxLoad,
      setReceiverCountryProvinceSearchBoxLoad,
    ] = useState<boolean>(false);
    const [searchCurrencyLoad, setSearchCurrencyLoad] =
      useState<boolean>(false);
    const [receiverCitySearchBoxLoad, setReceiverCitySearchBoxLoad] =
      useState<boolean>(false);
    const receiverCountryPopover = useDisclosure();
    const receiverCountryProvincePopover = useDisclosure();
    const receiverCityPopover = useDisclosure();

    // Country Data
    const [countryData, setCountryData] = useState<any[]>([]);
    // Currency Data
    const [currencyData, setCurrencyData] = useState<any[]>([]);
    // Province Data
    const [provinceData, setProvinceData] = useState<any[]>([]);
    const [
      currentCountryProvinceReceiverList,
      setCurrentFilteredCountryProvinceReceiverList,
    ] = useState<any[]>([]);
    // City Data
    const [cityData, setCityData] = useState<any[]>([]);
    // UrShipper Data
    const [urshipperData, setUrshipperData] = useState<any[]>([]);

    // Receiver Address Country
    const [isProvince, setIsProvince] = useState<boolean>(false);
    const [searchReceiverCountry, setSearchReceiverCountry] =
      useState<string>('');
    const [receiverCountryCode, setReceiverCountryCode] =
      useState<string>('');
    const [receiverCountryName, setReceiverCountryName] =
      useState<string>('');
    const [filteredCountryReceiver, setFilteredCountryReceiver] =
      useState<any[]>([]);
    const [
      selectedItemsReceiverCountry,
      setSelectedItemReceiverCountry,
    ] = useState<string>('');
    // Receiver Address Province
    const [
      searchReceiverCountryProvince,
      setSearchReceiverCountryProvince,
    ] = useState<string>('');
    const [
      receiverCountryProvinceCode,
      setReceiverCountryProvinceCode,
    ] = useState<string>('');
    const [
      filteredCountryProvinceReceiver,
      setFilteredCountryProvinceReceiver,
    ] = useState<any[]>([]);
    const [
      selectedItemsReceiverCountryProvince,
      setSelectedItemReceiverCountryProvince,
    ] = useState<string>('');
    // Receiver Address City
    const [isCity, setIsCity] = useState<boolean>(false);
    const [searchReceiverCity, setSearchReceiverCity] =
      useState<string>('');
    const [receiverCity, setReceiverCity] = useState<string>('');
    const [filteredReceiverCity, setFilteredReceiverCity] = useState<
      any[]
    >([]);
    const [selectedItemsReceiverCity, setSelectedItemReceiverCity] =
      useState<string>('');
    // Receiver Address Zip Code
    const [isZipCodeCountry, setIsZipCodeCountry] =
      useState<boolean>(false);
    const [receiverZipCode, setReceiverZipCode] =
      useState<string>('');
    //Handle Validation Container
    const [validationNumberOfPackage, setValidationNumberOfPackage] =
      useState<number>(0);
    const [validationTotalWeight, setValidationTotalWeight] =
      useState<number>(0);
    const [
      validationTotalDeclareValue,
      setValidationTotalDeclareValue,
    ] = useState<number>(0);
    const [
      validationActualTotalWeight,
      setValidationActualTotalWeight,
    ] = useState<number>(0);

    const [showRateLoading, setShowRateLoading] =
      useState<boolean>(false);
    const [showRateError, setShowRateError] = useState<any>([]);

    // Handle Dropdown Select Receiver Country
    const handleSelectedItemsChangeReceiverCountry = async (
      selectedItems: any
    ) => {
      if (selectedItems) {
        await setSelectedItemReceiverCountry(
          `${selectedItems.code} - ${selectedItems.country}`
        );
        await setReceiverCountryCode(selectedItems.code);
        await setReceiverCountryName(selectedItems.country);
        await receiverCountryPopover.onClose();
        await setShowRateButton(true);
      } else {
        await setShowRateButton(false);
      }
    };
    // Handle Dropdown Select Receiver Country
    const handleSelectedItemsChangeReceiverCountryProvince = async (
      selectedItems: any
    ) => {
      if (selectedItems) {
        await setSelectedItemReceiverCountryProvince(
          `${selectedItems.province}`
        );
        await setReceiverCountryProvinceCode(selectedItems.code);
        await setSearchReceiverCountryProvince('');
        await receiverCountryProvincePopover.onClose();
      }
    };

    // Handle Dropdown Select Receiver City
    const handleSelectedItemsChangeReceiverCity = async (
      selectedItems: any
    ) => {
      if (selectedItems) {
        await setSelectedItemReceiverCity(`${selectedItems.city}`);
        await setReceiverCity(selectedItems.city);
        await setSearchReceiverCity('');
        await receiverCityPopover.onClose();
      }
    };

    //Handle Dropdown Select Currency
    const [
      customSelectedItemsCurrency,
      setCustomSelectedItemCurrency,
    ] = useState<string>('');
    const [currencyCode, setCurrencyCode] = useState<string>('USD');
    const currencyCodePopover = useDisclosure();
    const handleSelectedItemsChangeCurrency = async (
      selectedItems: any
    ) => {
      if (selectedItems) {
        await setCustomSelectedItemCurrency(
          `${selectedItems.code} - ${selectedItems.currency}`
        );
        await setCurrencyCode(selectedItems.code);
        await currencyCodePopover.onClose();
        let declareCurrency: any = currencyCode;
        let totalDeclareAmount: any = 0;
        let newPack: any = [];
        allPackage.forEach((el: any) => {
          el.commodities.declareValue.currencyCode =
            selectedItems.code;
          totalDeclareAmount +=
            Number(el.commodities.declareValue.currencyAmount) *
            Number(el.commodities.qty);
          el.commodities.declareValue.currencyCode = declareCurrency;
          newPack.push(el);
        });
        setValidationTotalDeclareValue(totalDeclareAmount);
        setAllPackage(newPack);
      }
    };

    //Handle Declare Value
    const [isDeclareValue, setIsDeclareValue] =
      useState<string>('No');
    const [searchCurrency, setSearchCurrency] = useState<string>('');
    const [filteredCurrency, setFilteredCurrency] = useState<any[]>(
      []
    );
    //Handle Package
    const [packageType, setPackageType] =
      useState<string>('Your Packaging');
    //Handle AllPackage
    const [allPackage, setAllPackage] = useState<any[]>([
      {
        commodities: {
          qty: 1,
          weight: 0.02,
          length: 1,
          width: 1,
          height: 1,
          declareValue: {
            isDeclare: isDeclareValue,
            currencyCode: currencyCode,
            currencyAmount: 1,
          },
        },
      },
    ]);

    const [urshipperRate, setUrshipperRate] = useState<any[0]>([]);

    const [signature, setSignature] = useState<any>('None');

    // First Time Load
    useEffect(() => {
      if (urshipperData.length === 0) {
        getUrShipperData();
      }

      if (countryData.length === 0) {
        getCountryData();
      }

      if (provinceData.length == 0) {
        getProvinceData();
      }

      if (currencyData.length == 0) {
        getCurrencyData();
      }

      if (membershipPlan.length == 0) {
        getMembershipPlan();
      }

      if (
        countryData.length > 0 &&
        currencyData.length > 0 &&
        provinceData.length > 0 &&
        urshipperData.length > 0 &&
        membershipPlan.length > 0
      ) {
        setPageIsLoading(false);
        animateAddressBox.onOpen();
      }
    }, [
      countryData.length,
      currencyData.length,
      provinceData.length,
      membershipPlan.length,
    ]);

    // Country Data onChange
    useEffect(() => {
      if (receiverCountryCode.trim() != ``) {
        onCountryDataChange();
      }
    }, [receiverCountryCode]);

    // List Filter Receiver Country Data
    /* useEffect(() => {
      if (searchReceiverCountry.trim() != ``) {
        getListFilterReceiverCountry();
      }
    }, [searchReceiverCountry]); */

    // List Filter Receiver Country Province Data
    useEffect(() => {
      if (searchReceiverCountryProvince.trim() != ``) {
        getListFilterReceiverCountryProvince();
      }
    }, [searchReceiverCountryProvince]);

    // List Filter Receiver City
    useEffect(() => {
      if (receiverCountryCode !== ' ' && cityData.length !== 0) {
        // getListFilterCityData();

        let debouncer = setTimeout(() => {
          getListFilterCityData();
        }, 1000);

        return () => {
          clearTimeout(debouncer);
        };
      }

      if (searchReceiverCity.trim() != ``) {
        // getListFilterCityData();

        let debouncer = setTimeout(() => {
          getListFilterCityData();
        }, 1000);

        return () => {
          clearTimeout(debouncer);
        };
      }
    }, [searchReceiverCity, cityData.length]);

    // Current List Filter Receiver Country Province Data
    useEffect(() => {
      getCountryProvinceData();
    }, [receiverCountryCode]);

    // List Filter Currency Data
    useEffect(() => {
      if (searchCurrency.trim() != ``) {
        getListFilterCurrency();
      }
    }, [searchCurrency]);

    // Animate Box Reaction
    useEffect(() => {
      if (receiverZipCode !== '' || receiverCity !== '') {
        if (!animateCoverBox.isOpen) {
          animateCoverBox.onOpen();
          animateContainerBox.onOpen();
        }
      }
    }, [receiverZipCode, receiverCity]);

    // Enable/Disabed Show Rate Button
    useEffect(() => {
      if (
        receiverCountryCode &&
        receiverZipCode &&
        receiverZipCode !== '00000'
      ) {
        setShowRateButton(true);
      }
    }, [receiverCountryCode, receiverZipCode]);

    useEffect(() => {
      if (
        receiverCountryCode &&
        receiverCity &&
        receiverZipCode === '00000'
      ) {
        setShowRateButton(true);
      }
    }, [receiverCountryCode, receiverCity]);

    useEffect(() => {
      setUrshipperRate([]);
    }, [
      receiverCountryCode,
      receiverCity,
      receiverZipCode,
      allPackage.length,
      packageType,
      isDeclareValue,
      currencyCode,
      signature,
    ]);

    //Get UrShipper Data
    const getUrShipperData = async () => {
      const response = await client.project.axios.get(
        `${server}/v1/grid/public_rate_shipping?limit=1&params[id_api]=1`,
        { headers: headers }
      );
      await setUrshipperData(response.data.items);
    };

    const getMembershipPlan = async () => {
      try {
        const getTransitRate = await client.project.axios.post(
          `${server}/v1/action/finance_management/transit_rate/1`,
          {},
          {
            headers: {
              authority: 'staging-qore-data-apple-202883.qore.dev',
              'x-qore-engine-admin-secret':
                'LPUFvfGKE6KscQt5DAYb2AtqZiUjm76Z',
            },
          }
        );

        setMembershipPlan(getTransitRate.data.result);

        if (platformType === 'client') {
          let userMembershipData = await getUserMembership(userId);
          for (
            let index = 0;
            index < getTransitRate.data.result.length;
            index++
          ) {
            const element = getTransitRate.data.result[index];
            if (
              element?.membership ===
              userMembershipData[0]?.lookup_membership_type
            ) {
              userMembershipData[0].index = index;
            }
          }
          setUserMembership(userMembershipData);
        }
      } catch (error) {
        return error;
      }
    };

    const getUserMembership = async (userId: number) => {
      try {
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

        return response.data.results.membership;
      } catch (error) {
        return error;
      }
    };

    //Get Country Data
    const getCountryData = async () => {
      const getTotalRow = await client.project.axios.get(
        `${server}/v1/table/country_code?limit=1`,
        { headers: headers }
      );
      if (getTotalRow.data.total_rows) {
        const countryLength = getTotalRow.data.total_rows;
        const getAllCountry = await client.project.axios.get(
          `${server}/v1/grid/other_related?limit=${countryLength}&params[country_code]=ID&params[search_country_by_name]=`,
          { headers: headers }
        );
        await setCountryData(getAllCountry.data.items);
        await setFilteredCountryReceiver(getAllCountry.data.items);
      }
    };

    // Receiver Country List Filter
    const getListFilterReceiverCountry = async () => {
      setReceiverCountrySearchBoxLoad(true);
      const countryFilter = countryData.filter((el: any) => {
        if (
          el.country
            .toLowerCase()
            .match(searchReceiverCountry.toLowerCase())
        ) {
          return el.country
            .toLowerCase()
            .match(searchReceiverCountry.toLowerCase());
        } else if (
          el.code
            .toLowerCase()
            .match(searchReceiverCountry.toLowerCase())
        ) {
          return el.code
            .toLowerCase()
            .match(searchReceiverCountry.toLowerCase());
        }
      });

      await setFilteredCountryReceiver(countryFilter);
      setTimeout(() => {
        setReceiverCountrySearchBoxLoad(false);
      }, 500);
    };

    // Receiver City List Filter
    const getListFilterCityData = async () => {
      setReceiverCitySearchBoxLoad(true);

      const findCity = await client.project.axios.get(
        `${server}/v1/grid/city_by_country_name?limit=500&params[by_country_code]=${receiverCountryCode}&params[by_name]=${searchReceiverCity}`,
        { headers: headers }
      );

      await setFilteredReceiverCity(findCity.data.items);
      setTimeout(() => {
        setReceiverCitySearchBoxLoad(false);
      }, 500);
    };

    // Get Province Data
    const getProvinceData = async () => {
      const getTotalRow = await client.project.axios.get(
        `${server}/v1/table/state_code?limit=1`,
        { headers: headers }
      );

      if (getTotalRow.data.total_rows) {
        const provinceLength = getTotalRow.data.total_rows;
        const getAllState = await client.project.axios.get(
          `${server}/v1/table/state_code?limit=${provinceLength}`,
          { headers: headers }
        );
        await setProvinceData(getAllState.data.items);
      }
    };

    // Get Current Country Province Data
    const getCountryProvinceData = async () => {
      const countryState = provinceData.filter(
        (el: any, index: number) => {
          return el.country_code.match(receiverCountryCode);
        }
      );
      await setCurrentFilteredCountryProvinceReceiverList(
        countryState
      );
      await setFilteredCountryProvinceReceiver(countryState);
    };

    // Receiver Country Province List Filter
    const getListFilterReceiverCountryProvince = async () => {
      setReceiverCountryProvinceSearchBoxLoad(true);
      const provinceFilter =
        currentCountryProvinceReceiverList.filter((el: any) => {
          if (
            el.province
              .toLowerCase()
              .match(searchReceiverCountryProvince.toLowerCase())
          ) {
            return el.province
              .toLowerCase()
              .match(searchReceiverCountryProvince.toLowerCase());
          } else if (
            el.code
              .toLowerCase()
              .match(searchReceiverCountryProvince.toLowerCase())
          ) {
            return el.code
              .toLowerCase()
              .match(searchReceiverCountryProvince.toLowerCase());
          }
        });

      await setFilteredCountryProvinceReceiver(provinceFilter);
      setTimeout(() => {
        setReceiverCountryProvinceSearchBoxLoad(false);
      }, 500);
    };

    //Get Currency Data
    const getCurrencyData = async () => {
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
        await setCurrencyData(getAllCurrency.data.items);
        await setFilteredCurrency(getAllCurrency.data.items);
      }
    };

    const getListFilterCurrency = async () => {
      setSearchCurrencyLoad(true);
      const currencyFilter = currencyData.filter((el: any) => {
        return el.currency
          .toLowerCase()
          .match(searchCurrency.toLowerCase());
      });

      await setFilteredCurrency(currencyFilter);
      setTimeout(() => {
        setSearchCurrencyLoad(false);
      }, 500);
    };

    // Validate Address
    const getAddressValidate = async () => {
      setBoxIsLoading(true);
      const payload = {
        payload_country_code: receiverCountryCode,
        payload_province_code: receiverCountryProvinceCode,
        payload_postal_code: receiverZipCode,
      };

      const response = await client.project.axios.post(
        `${server}/v1/action/validate_postal_code/1`,
        { args: payload },
        {
          headers: {
            authority: 'staging-qore-data-apple-202883.qore.dev',
            'x-qore-engine-admin-secret':
              'LPUFvfGKE6KscQt5DAYb2AtqZiUjm76Z',
          },
        }
      );
      setBoxIsLoading(false);
    };

    const onCountryDataChange = async () => {
      await setBoxIsLoading(true);
      if (
        receiverCountryCode === 'CA' ||
        receiverCountryCode === 'US' ||
        receiverCountryCode === 'AE' ||
        receiverCountryCode === 'MX' ||
        receiverCountryCode === 'IN'
      ) {
        await setSelectedItemReceiverCountryProvince('');
        await setReceiverCountryProvinceCode('');

        await setReceiverCity('');
        await setSearchReceiverCity('');

        await setIsZipCodeCountry(true);
        await setReceiverZipCode('');

        await setCityData([]);
        await setIsCity(false);
      } else {
        // const getCountryNoZipCode = await client.project.axios.get(`${server}/v1/grid/filter_city_by_country_code?limit=${dataLength}&params[country_code]=${receiverCountryCode}`, { headers: headers });
        const getCountryNoZipCode = await client.project.axios.get(
          `${server}/v1/grid/filter_city_by_country_code?limit=500&params[country_code]=${receiverCountryCode}`,
          { headers: headers }
        );
        if (getCountryNoZipCode.data.items.length > 0) {
          await setIsProvince(false);
          await setSelectedItemReceiverCountryProvince('');
          await setReceiverCountryProvinceCode('');

          await setIsZipCodeCountry(false);
          await setReceiverZipCode('00000');

          await setCityData(getCountryNoZipCode.data.items);
          await setIsCity(true);

          await setShowRateButton(false);
        } else {
          await setSelectedItemReceiverCountryProvince('');
          await setReceiverCountryProvinceCode('');

          await setCityData([]);
          await setIsCity(false);

          await setReceiverZipCode('');
          await setIsZipCodeCountry(true);

          await setShowRateButton(false);
        }
      }
      await setBoxIsLoading(false);
    };

    // Add New Package - [YOUR_PACKAGING]
    const newYourPackaging = async () => {
      animateNewContainer.onOpen();
      const newPackage = [
        ...allPackage,
        {
          commodities: {
            qty: 1,
            weight: 0.02,
            length: 1,
            width: 1,
            height: 1,
            declareValue: {
              isDeclare: 'No',
              currencyCode: '',
              currencyAmount: 1,
            },
          },
        },
      ];

      let numberOfPackage: any = 0;
      let itemWeight: any = 0;
      let dimensionsWeight: any = 0;
      let totalDeclareAmount: any = 0;

      newPackage.forEach((el: any) => {
        numberOfPackage += Number(el.commodities.qty);
        itemWeight +=
          Number(el.commodities.weight) * Number(el.commodities.qty);
        dimensionsWeight +=
          ((Number(el.commodities.length) *
            Number(el.commodities.width) *
            Number(el.commodities.height)) /
            5000) *
          Number(el.commodities.qty);
        if (currencyCode !== '') {
          totalDeclareAmount +=
            Number(el.commodities.declareValue.currencyAmount) *
            Number(el.commodities.qty);
          el.commodities.declareValue.currencyCode = currencyCode;
        }
      });

      /* if (itemWeight > dimensionsWeight) {
        setValidationTotalWeight(Number(itemWeight));
      } else {
        setValidationTotalWeight(Number(dimensionsWeight));
      }

      await setValidationTotalDeclareValue(totalDeclareAmount);
      await setValidationNumberOfPackage(Number(numberOfPackage)); */
      await setAllPackage(newPackage);

      const packageValidation = validatePackage(
        packageType,
        newPackage
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
    };

    const removePackage = async (val: any) => {
      await setRemoveLoad(true);
      animateNewContainer.onClose();
      let newPack: any = [];
      allPackage.forEach((el: any, indexEl: number) => {
        if (indexEl !== val) {
          newPack.push(el);
        }
      });

      let numberOfPackage: any = 0;
      let itemWeight: any = 0;
      let dimensionsWeight: any = 0;
      let totalDeclareAmount: any = 0;

      newPack.forEach((el: any) => {
        numberOfPackage += Number(el.commodities.qty);
        itemWeight +=
          Number(el.commodities.weight) * Number(el.commodities.qty);
        dimensionsWeight +=
          ((Number(el.commodities.length) *
            Number(el.commodities.width) *
            Number(el.commodities.height)) /
            5000) *
          Number(el.commodities.qty);
        if (currencyCode !== '') {
          totalDeclareAmount +=
            Number(el.commodities.declareValue.currencyAmount) *
            Number(el.commodities.qty);
          el.commodities.declareValue.currencyCode = currencyCode;
        }
      });

      /* if (itemWeight > dimensionsWeight) {
        setValidationTotalWeight(Number(itemWeight));
      } else {
        setValidationTotalWeight(Number(dimensionsWeight));
      }

      await setValidationNumberOfPackage(Number(numberOfPackage));
      await setValidationTotalDeclareValue(totalDeclareAmount); */
      await setAllPackage(newPack);

      const packageValidation = validatePackage(packageType, newPack);
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

      animateNewContainer.onOpen();
      await setRemoveLoad(false);
    };

    const formatDateWithTime = (date: any) => {
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
    };

    //Get Rate
    const getRate = async () => {
      try {
        setIsShowRate(true);
        setShowRateLoading(true);
        function formatDate(date: any) {
          var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

          if (month.length < 2) month = '0' + month;
          if (day.length < 2) day = '0' + day;

          return [year, month, day].join('-');
        }

        const payload = {
          sender: 'default',
          receiver: {
            zip_code: receiverZipCode,
            country_code: receiverCountryCode,
          },
          container: allPackage,
          shippingDate: formatDate(new Date()),
          isDeclareValue: isDeclareValue,
          signature: signature,
          packageType: packageType,
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

        // console.log('getDenoRow >>> ', getDenoRow);
        console.log('getMultiRate >>> ', getMultiRate);

        if (
          getMultiRate?.data?.result?.response?.data?.errors?.length >
          0
        ) {
          setShowRateLoading(false);
          throw getMultiRate?.data?.result?.response?.data?.errors;
        }

        // if (
        //   getDenoRow?.data?.result?.response?.data?.errors?.length > 0
        // ) {
        //   setShowRateLoading(false);
        //   throw getDenoRow?.data?.result?.response?.data?.errors;
        // }

        const rateData = getMultiRate?.data?.result;

        for (let i = 0; i < rateData.length; i++) {
          const getDenoRow = rateData[i];

          console.log('getDenoRow >>> ', getDenoRow);

          // TODO: here
          if (
            getDenoRow.dataFedex?.output?.rateReplyDetails?.length > 0
          ) {
            setShowRateError([]);
            const responseFedex =
              getDenoRow.dataFedex.output.rateReplyDetails[0]
                .ratedShipmentDetails[0];

            const totalBaseCharge = responseFedex.totalBaseCharge;

            let totalSurcharge = 0;
            let totalTaxes = 0;
            let totalDiscount = 0;

            responseFedex.shipmentRateDetail.surCharges.forEach(
              (el: any) => {
                totalSurcharge += el.amount;
              }
            );

            responseFedex.shipmentRateDetail.taxes.forEach(
              (el: any) => {
                totalSurcharge += el.amount;
              }
            );

            responseFedex.shipmentRateDetail.freightDiscount.forEach(
              (el: any) => {
                totalSurcharge += el.amount;
              }
            );

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

            for (
              let index = 0;
              index < allTransitRate.length;
              index++
            ) {
              const el = allTransitRate[index];
              const marked = Number(
                totalCharge +
                  (totalCharge * Number(el.percentage_shipping)) / 100
              );
              const discount =
                Number(marked) * (Number(el.discount) / 100);

              const subTotal = Number(marked) - Number(discount);

              const displayVAT = Number(
                subTotal * (Number(el.percentage_vat) / 100)
              );

              const totalPrice = subTotal + displayVAT;

              el.priority = getDenoRow.priority;
              el.marked = marked;
              el.displayVAT = displayVAT;
              el.totalDiscount = discount;
              el.subTotal = subTotal;
              el.totalPrice = totalPrice;

              if (
                getDenoRow?.dataFedex?.output?.rateReplyDetails[0]
                  ?.commit
              ) {
                let dateDeliv =
                  getDenoRow?.dataFedex?.output?.rateReplyDetails[0]
                    ?.commit?.dateDetail?.dayFormat;
                el.elestimatedDeliv = formatDateWithTime(
                  new Date(dateDeliv)
                );
              }

              allRate.push(el);
            }

            console.log('allRate >>> ', allRate);
            setUrshipperRate((prev: any) => [...prev, ...allRate]);

            animateRate.onOpen();
            setIsShowRate(false);
          }
          // TODO: to here
        }

        setShowRateLoading(false);
      } catch (error) {
        setShowRateError(error);
      }
    };

    const handleSelectChange = (selectedOption: any | null) => {
      setSignature(selectedOption?.is_declare_value);
    };

    return (
      <Center mx={'20px'} w={'100%'}>
        {pageIsLoading ? (
          <Box w={'100%'}>
            <LoaderItem />
          </Box>
        ) : (
          <Box
            position={'relative'}
            w={'100%'}
            minW={'700px'}
            maxW={'1000px'}
            minHeight={'500px'}
            pb={'40px'}
          >
            <SlideFade in={animateAddressBox.isOpen} offsetY="20px">
              <Box
                boxShadow={'lg'}
                position={'relative'}
                p={'20px'}
                backgroundColor={'white'}
              >
                {/* Recivicer Country + Zip Code  */}
                <Box>
                  {/* Title */}
                  <Box
                    color={'#171717'}
                    px={'10px'}
                    my={'5px'}
                    pb={'10px'}
                    fontSize={'16px'}
                    fontWeight={700}
                    w={'100%'}
                  >
                    Ship to
                  </Box>

                  <Center
                    flexWrap={'wrap'}
                    justifyContent={'space-between'}
                  >
                    {/* Received Country  */}
                    <Box w={'50%'} my={'5px'}>
                      <FormControl isRequired>
                        <FormLabel
                          fontWeight={600}
                          ml={'10px'}
                          mb={'10px'}
                        >
                          Country
                        </FormLabel>
                        <Stack spacing={3} px="10px">
                          <ReactSelect
                            // menuIsOpen={true}
                            placeholder="Select Country"
                            options={countryData.map((item) => {
                              return {
                                value: item,
                                label: `${item.code} - ${item.country}`,
                              };
                            })}
                            onChange={(e) => {
                              handleSelectedItemsChangeReceiverCountry(
                                e?.value
                              );
                            }}
                            isClearable
                            styles={{
                              control: (baseStyles, state) => ({
                                ...baseStyles,
                                borderColor: state.isFocused
                                  ? '#F5F5F5'
                                  : '#F5F5F5',
                                fontSize: '14px',
                                fontWeight: 600,
                              }),
                              option: (
                                styles,
                                {
                                  data,
                                  isDisabled,
                                  isFocused,
                                  isSelected,
                                }
                              ) => {
                                return {
                                  ...styles,
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  backgroundColor: isFocused
                                    ? 'rgba(253,228,217, .6)'
                                    : '#FFFFFF',
                                };
                              },
                            }}
                          />
                        </Stack>
                      </FormControl>
                    </Box>

                    {/* Received City */}
                    {isCity && (
                      <Box w={'50%'} my={'5px'} px={'10px'}>
                        {cityData && cityData.length > 0 ? (
                          <Box>
                            <Stack direction="row" spacing={0}>
                              <FormLabel ml={'10px'} mb={'10px'}>
                                City
                              </FormLabel>
                              <Text color="red">*</Text>
                            </Stack>

                            <ReactSelect
                              options={filteredReceiverCity.map(
                                (item) => {
                                  return {
                                    value: item,
                                    label: item.city,
                                  };
                                }
                              )}
                              placeholder="Select City"
                              onInputChange={(e) =>
                                setSearchReceiverCity(e)
                              }
                              onChange={(e) =>
                                handleSelectedItemsChangeReceiverCity(
                                  e?.value
                                )
                              }
                              isClearable
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  borderColor: state.isFocused
                                    ? '#F5F5F5'
                                    : '#F5F5F5',
                                  fontSize: '14px',
                                  fontWeight: 600,
                                }),
                                option: (
                                  styles,
                                  {
                                    data,
                                    isDisabled,
                                    isFocused,
                                    isSelected,
                                  }
                                ) => {
                                  return {
                                    ...styles,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    backgroundColor: isFocused
                                      ? 'rgba(253,228,217, .6)'
                                      : '#FFFFFF',
                                  };
                                },
                              }}
                            />
                          </Box>
                        ) : (
                          <Box>
                            <Stack spacing={3} px={'10px'}>
                              <FormLabel mb={0}>City</FormLabel>
                              <InputGroup>
                                <InputRightElement
                                  pointerEvents="none"
                                  children={
                                    <FaCity color="rgba(162, 162, 162, 1)" />
                                  }
                                />
                                <Input
                                  borderColor={'#F5F5F5'}
                                  _placeholder={{
                                    opacity: 1,
                                    color: 'gray.500',
                                  }}
                                  _focus={{ outline: 'none' }}
                                  placeholder="Fill City"
                                  fontSize="12px"
                                  onChange={(e: any) => {
                                    setReceiverCity(e.target.value);
                                  }}
                                />
                              </InputGroup>
                            </Stack>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Received Zip Code */}
                    {isZipCodeCountry && (
                      <Box w={'50%'} my={'5px'}>
                        <FormControl isRequired>
                          <FormLabel
                            fontWeight={600}
                            ml={'10px'}
                            mb={'10px'}
                          >
                            Postal Code
                          </FormLabel>
                          <Stack spacing={3} px={'10px'}>
                            <InputGroup>
                              <InputRightElement
                                pointerEvents="none"
                                children={
                                  <BsSignpost color="rgba(162, 162, 162, 1)" />
                                }
                              />
                              <Input
                                borderColor={'#F5F5F5'}
                                _placeholder={{
                                  opacity: 1,
                                  color: 'gray.500',
                                }}
                                _focus={{ outline: 'none' }}
                                placeholder="Fill Zip Code"
                                fontSize="14px"
                                onChange={(e: any) => {
                                  setReceiverZipCode(e.target.value);
                                }}
                              />
                            </InputGroup>
                          </Stack>
                        </FormControl>
                      </Box>
                    )}
                  </Center>
                </Box>

                {/* Loader */}
                {boxIsLoading && (
                  <Box
                    left={'0'}
                    top={'0'}
                    position={'absolute'}
                    w={'100%'}
                    h={'100%'}
                    backgroundColor={'rgba(255,255,255,.7)'}
                  >
                    <LoaderBox />
                  </Box>
                )}
              </Box>
            </SlideFade>

            {isErrorFedex &&
              msgErrorFedex.length > 0 &&
              msgErrorFedex.map((el: any, index: number) => {
                return (
                  <SlideFade
                    key={index}
                    in={animateErrorsBox.isOpen}
                    offsetY="20px"
                  >
                    <Alert
                      my={'20px'}
                      boxShadow={'lg'}
                      position={'relative'}
                      p={'20px'}
                      status="error"
                    >
                      <AlertIcon />
                      <AlertTitle>
                        Oops, Something is Wrong!
                      </AlertTitle>
                      <AlertDescription>
                        {el.message}
                      </AlertDescription>
                    </Alert>
                  </SlideFade>
                );
              })}

            {/* New Package UI */}
            {showRateButton && (
              <Box
                my={'20px'}
                boxShadow={'lg'}
                position={'relative'}
                p={'20px'}
                backgroundColor={'white'}
              >
                {/* Title */}
                <Flex
                  color={'rgb(23, 23, 23)'}
                  w={'100%'}
                  justifyContent={'space-between'}
                  pb={'20px'}
                >
                  <Box fontSize={'18px'} fontWeight={600}>
                    Package Details
                  </Box>
                </Flex>

                {/* Information */}
                <Box
                  borderRadius={'lg'}
                  background={'#f5f5f5'}
                  p={'20px'}
                >
                  <HStack spacing={5}>
                    <Center pl={'10px'}>
                      <Icon
                        color={'#5C5C5C'}
                        fontSize={'40px'}
                        as={BiSolidPackage}
                      ></Icon>
                    </Center>
                    <Box fontWeight={600}>
                      <Box>
                        Shipping rate are calculated based on
                        packaging type, weight, dimensions, insured
                        value, and signature requirement.
                      </Box>
                      <Box>
                        It's nignly recommended to provide the correct
                        and accurate information. Ir not, vou may
                        receive adjustment cnarges
                      </Box>
                    </Box>
                  </HStack>
                </Box>

                {/* Select Package Type */}
                <Box my={'10px'}>
                  <HStack spacing={'20px'}>
                    {/* Package Type */}
                    <Box w={'30%'}>
                      <FormControl isRequired>
                        <FormLabel fontSize={'14px'} fontWeight={600}>
                          {' '}
                          Package{' '}
                        </FormLabel>
                        <ReactSelect
                          placeholder="Select Packing Type"
                          options={[
                            {
                              value: 'Your Packaging',
                              label: 'Your Packaging',
                            },
                            { value: 'Pak', label: 'Pak' },
                          ]}
                          onChange={(e) => {
                            setPackageType(e!.value);
                          }}
                          isClearable
                          defaultValue={{
                            value: 'YOUR_PACKAGING',
                            label: 'Your Packaging',
                          }}
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              borderColor: state.isFocused
                                ? '#F5F5F5'
                                : '#F5F5F5',
                              fontSize: '14px',
                              fontWeight: 600,
                            }),
                            option: (
                              styles,
                              {
                                data,
                                isDisabled,
                                isFocused,
                                isSelected,
                              }
                            ) => {
                              return {
                                ...styles,
                                fontSize: '14px',
                                fontWeight: 600,
                                backgroundColor: isFocused
                                  ? 'rgba(253,228,217, .6)'
                                  : '#FFFFFF',
                              };
                            },
                          }}
                        />
                      </FormControl>
                    </Box>

                    {/* <Box w={"25%"}></Box> */}

                    {/* Insurance & Signature */}
                    <Stack pt={'25px'} spacing={0} direction="column">
                      <Checkbox
                        onChange={(e: any) => {
                          if (e.target.checked) {
                            setIsDeclareValue('Yes');
                          } else {
                            setIsDeclareValue('No');
                          }
                        }}
                        isChecked={
                          isDeclareValue === 'Yes' ? true : false
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
                            handleSelectChange({
                              is_declare_value: 'Direct Signature',
                            });
                          } else {
                            handleSelectChange({
                              is_declare_value: 'None',
                            });
                          }
                        }}
                        isChecked={
                          signature === 'Direct Signature'
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
                </Box>

                {/* Currency */}
                <Box my={'10px'}>
                  {isDeclareValue &&
                    currencyData &&
                    currencyData.length > 0 && (
                      <Box w={'30%'}>
                        <FormControl isRequired>
                          <FormLabel
                            fontSize={'14px'}
                            fontWeight={600}
                          >
                            {' '}
                            Currency{' '}
                          </FormLabel>
                          <ReactSelect
                            placeholder="Select Currency"
                            options={currencyData.map((item) => {
                              return {
                                value: item,
                                label: `${item.code} - ${item.currency}`,
                              };
                            })}
                            onChange={(e) => {
                              handleSelectedItemsChangeCurrency(
                                e?.value
                              );
                            }}
                            isClearable
                            defaultValue={{
                              label: 'USD - United States Dollar',
                              value: {
                                code: 'USD',
                                currency: 'United States Dollar',
                              },
                            }}
                            styles={{
                              control: (baseStyles, state) => ({
                                ...baseStyles,
                                borderColor: state.isFocused
                                  ? '#F5F5F5'
                                  : '#F5F5F5',
                                fontSize: '14px',
                                fontWeight: 600,
                              }),
                              option: (
                                styles,
                                {
                                  data,
                                  isDisabled,
                                  isFocused,
                                  isSelected,
                                }
                              ) => {
                                return {
                                  ...styles,
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  backgroundColor: isFocused
                                    ? 'rgba(253,228,217, .6)'
                                    : '#FFFFFF',
                                };
                              },
                            }}
                          />
                        </FormControl>
                      </Box>
                    )}
                </Box>

                <Box my={'30px'}>
                  {animateCoverBox.isOpen && (
                    <SlideFade
                      in={animateContainerBox.isOpen}
                      offsetY="20px"
                    >
                      {allPackage &&
                        allPackage.length > 0 &&
                        allPackage.map(
                          (el: any, indexAllPackage: number) => {
                            return (
                              <Box
                                key={indexAllPackage}
                                my={'20px'}
                                position={'relative'}
                                p={'20px'}
                                backgroundColor={'white'}
                                border={'2px'}
                                borderRadius={'10px'}
                                borderColor="#d9d9d9"
                                boxShadow={'lg'}
                              >
                                <YourPackagingData
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
                                  setAllPackage={setAllPackage}
                                  allPackage={allPackage}
                                  packageData={el}
                                  index={indexAllPackage}
                                  currency={currencyCode}
                                  cover={isDeclareValue}
                                  setValidationActualTotalWeight={
                                    setValidationActualTotalWeight
                                  }
                                  packageType={packageType}
                                />
                              </Box>
                            );
                          }
                        )}
                      <Box px={'5px'}>
                        <Flex justifyContent={'end'}>
                          <Box my={'10px'} fontWeight={600}>
                            <Button
                              fontSize={'14px'}
                              color={'#FF4C02'}
                              backgroundColor={'#ffffff'}
                              _focus={{ outline: 'none' }}
                              _hover={{
                                backgroundColor: '#f7e9e9',
                              }}
                              onClick={newYourPackaging}
                              border={'1px'}
                              borderColor={'FF4C02'}
                              m={0}
                              h={'14px'}
                              py={'14px'}
                              px={'10px'}
                              leftIcon={
                                <BiPlus
                                  fontSize={'20px'}
                                  color={'#FF4C02'}
                                />
                              }
                            >
                              Add Package
                            </Button>
                          </Box>
                        </Flex>
                      </Box>
                    </SlideFade>
                  )}
                </Box>

                <Box my={'10px'}>
                  {/* Total Packages & Weight */}
                  {animateCoverBox.isOpen &&
                  validationNumberOfPackage &&
                  validationNumberOfPackage !== 0 ? (
                    <Box
                      backgroundColor={'#fff'}
                      my={'20px'}
                      w={'100%'}
                    >
                      <Divider
                        backgroundColor={'##d9d9d9ff'}
                        size={'2px'}
                      />
                      <Box
                        fontSize={'16px'}
                        mt={'12px'}
                        mb={'24px'}
                        fontWeight={600}
                      >
                        Package Summary:{' '}
                      </Box>
                      <HStack
                        w={'100%'}
                        spacing="20px"
                        justifyContent={'start'}
                        alignItems={'start'}
                      >
                        {/* Quantity */}
                        <HStack>
                          <Box>Total Packages: </Box>
                          <Box fontWeight={600}>
                            {validationNumberOfPackage} pcs
                          </Box>
                        </HStack>

                        {/* Gross Weight */}
                        {packageType !== 'Pak' && (
                          <HStack>
                            <Box>Gross Weight: </Box>
                            <Box fontWeight={600}>
                              {validationActualTotalWeight.toFixed(2)}{' '}
                              kg
                            </Box>
                          </HStack>
                        )}

                        {/* Chargeable Weight */}
                        <HStack>
                          <Box>Chargeable Weight: </Box>
                          <Box fontWeight={600}>
                            {validationTotalWeight.toFixed(2)} kg
                          </Box>
                        </HStack>

                        {/* Insured Value */}
                        {isDeclareValue === 'Yes' && (
                          <HStack>
                            <Box>Insured Value: </Box>
                            <Box fontWeight={600}>
                              {validationTotalDeclareValue}{' '}
                              {currencyCode}
                            </Box>
                          </HStack>
                        )}
                      </HStack>
                    </Box>
                  ) : (
                    <Box></Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Show Rate Error */}
            {showRateError && showRateError.length > 0 && (
              <Box>
                <VStack>
                  {showRateError.map((el: any) => {
                    return (
                      <Box>
                        <Text fontSize={'20px'} color={'red.300'}>
                          {el?.message}
                        </Text>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>
            )}

            {/* Rate Results */}
            {
              <Box>
                {!boxIsLoading &&
                  receiverCountryCode &&
                  membershipPlan.length > 0 && (
                    <AllRateTab
                      showRateButton={showRateButton}
                      userMembership={userMembership}
                      membershipPlan={membershipPlan}
                      action={jumpToPage}
                      loading={showRateLoading}
                      getRate={getRate}
                      urshipperRate={urshipperRate}
                    />
                  )}
              </Box>
            }
          </Box>
        )}
      </Center>
    );
  },
});
export default ShippingRate;
