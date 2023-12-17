import { Box, HStack, Icon, useRadio } from '@chakra-ui/react';
import { FaCheck } from 'react-icons/fa';

export const CustomRadio = (props: any) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getCheckboxProps();

  const data = props.data;

  function currencyFormaterIDR(val: number) {
    const formatter = new Intl.NumberFormat('IDR').format(
      Math.floor(val)
    );
    return formatter;
  }

  return (
    <Box as="label" w={'100%'}>
      <input {...input} />
      <Box
        borderRadius={'4px'}
        p={'15px 20px'}
        bg={'#F7F7F7'}
        border={'1px solid #F7F7F7'}
        {...checkbox}
        _checked={{
          bg: '#FDE4D9',
          border: '1px solid #FF4C02',
        }}
      >
        <HStack justifyContent={'space-between'}>
          <Box color={'#171717'} fontWeight={'bold'} w={'220px'}>
            {/* FedEx Intl. Priority {JSON.stringify(data)} */}
            {data.label}
          </Box>
          <Box color={'#171717'} fontWeight={'bold'}>
            {data.delivTime}
          </Box>
          <HStack>
            <Box
              color={'#171717'}
              fontWeight={'bold'}
              textAlign={'right'}
            >
              {`${currencyFormaterIDR(data.totalPrice)}`}
            </Box>
            <Box
              width="14px"
              height="14px"
              borderRadius="3px"
              border={'1px solid #CCCCCC'}
              bg={'#FFF'}
              marginRight="2"
              display="flex"
              alignItems="center"
              justifyContent="center"
              padding="2px"
              {...checkbox}
              _checked={{ bg: '#FF4C02', borderColor: '#FF4C02' }}
            >
              <Icon
                as={FaCheck}
                {...checkbox}
                color={'#FFF'}
                _checked={{ color: '#FFF' }}
                w="10px"
              />
            </Box>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};
