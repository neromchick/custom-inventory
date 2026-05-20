import { Box, Button, Center, Heading, Link, Text, VStack } from '@chakra-ui/react';

export default function Login() {
  const API_BASE_URL = "https://custom-inventory.onrender.com/api/auth"; 

  return (
    <Center minH="100vh" bg="gray.50" px={4}>
      <Box 
        w="full" 
        maxW="md" 
        p={8} 
        bg="white" 
        borderRadius="xl" 
        boxShadow="md" 
        borderWidth="1px" 
        borderColor="gray.100"
      >
        <VStack spaceY={6} align="stretch">
          <Box textAlign="center">
            <Heading as="h2" size="xl" color="gray.900" mb={2}>
              Войти в CustomInventory
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Выберите удобный способ авторизации
            </Text>
          </Box>

          <VStack spaceY={3} align="stretch" mt={4}>
            <Link href={`${API_BASE_URL}/signin-github`} style={{ textDecoration: 'none' }}>
              <Button
                w="full"
                colorPalette="gray"
                variant="solid"
                size="lg"
                fontWeight="semibold"
              >
                Войти через GitHub
              </Button>
            </Link>

            <Link href={`${API_BASE_URL}/signin-google`} style={{ textDecoration: 'none' }}>
              <Button
                w="full"
                variant="outline"
                colorPalette="blue"
                size="lg"
                fontWeight="semibold"
              >
                Войти через Google
              </Button>
            </Link>
          </VStack>
        </VStack>
      </Box>
    </Center>
  );
}