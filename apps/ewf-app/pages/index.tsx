import App from './App';
import { ChakraProvider } from '@chakra-ui/react';

export default function Web() {
  return (
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
}
