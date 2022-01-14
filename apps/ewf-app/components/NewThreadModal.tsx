import { User } from 'interfaces';
import { FunctionComponent, useState } from 'react';
import {
  Modal,
  Box,
  VStack,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Flex,
  Text,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

interface NewThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  emitSelectedUsers: (users: User[]) => void;
  users: User[];
}

const NewThreadModal: FunctionComponent<NewThreadModalProps> = ({
  isOpen,
  onClose,
  users,
  emitSelectedUsers,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Recipients</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              {!users ||
                (users?.length === 0 && (
                  <Text>{`You're the only one online! :(`}</Text>
                ))}
              {users?.length > 0 &&
                users.map((user, index) => (
                  <Box
                    h="40px"
                    w="100%"
                    _hover={{
                      background: 'rgba(0,0,0,0.08)',
                      color: 'purple.500',
                      cursor: 'pointer',
                    }}
                    key={`user${index}`}
                    onClick={() =>
                      setSelectedUsers((selectedUsers) => {
                        const idx = selectedUsers.findIndex(
                          ({ id }) => id === user.id
                        );
                        if (idx === -1) {
                          console.log('Adding user');
                          return [...selectedUsers, user];
                        } else {
                          console.log('Removing user');
                          return selectedUsers.filter(
                            ({ id }) => id !== user.id
                          );
                        }
                      })
                    }
                  >
                    <Flex
                      h="100%"
                      px="2"
                      fontSize="md"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Text>{user.name}</Text>
                      <CheckIcon
                        sx={
                          selectedUsers.some(({ id }) => id === user.id)
                            ? {
                                opacity: 1,
                                color: 'green',
                              }
                            : {
                                opacity: 0.3,
                              }
                        }
                      />
                    </Flex>
                  </Box>
                ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              disabled={selectedUsers?.length === 0}
              onClick={() => {
                emitSelectedUsers(selectedUsers);
                onClose();
                setSelectedUsers([]);
              }}
            >
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NewThreadModal;
