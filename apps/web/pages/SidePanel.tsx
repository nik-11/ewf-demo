import { FunctionComponent, ReactElement } from 'react';
import {
  Box,
  Flex,
  Center,
  Spacer,
  Button,
  VStack,
  Text,
} from '@chakra-ui/react';

interface SidePanelProps {
  heading: string;
  headingButton?: ReactElement;
  listItems?: ReactElement[];
  emptyListMessage: string;
}

const SidePanel: FunctionComponent<SidePanelProps> = ({
  heading,
  headingButton,
  listItems,
  emptyListMessage,
}) => {
  return (
    <Box>
      <Box>
        <Flex
          bg="white"
          px="4"
          py="2"
          borderBottom="1px"
          borderBottomColor="gray.300"
          h="50px"
        >
          <Center>
            <Text fontSize="xl">{heading}</Text>
          </Center>
          <Spacer />
          {headingButton && <Center>{headingButton}</Center>}
        </Flex>
      </Box>
      <VStack h="calc(100% - 50px)">
        {(!listItems || listItems.length === 0) && emptyListMessage && (
          <Text p="4">{emptyListMessage}</Text>
        )}
        {listItems?.length > 0 && listItems}
      </VStack>
    </Box>
  );
};

export default SidePanel;
