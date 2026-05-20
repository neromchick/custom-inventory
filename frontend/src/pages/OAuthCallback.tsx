import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Вытаскиваем JWT токен, который бэкенд зашил в URL
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('token', token); // Сохраняем в браузере
      navigate('/dashboard'); // Переходим на главную
    } else {
      navigate('/login'); // Если токена нет — возвращаем на логин
    }
  }, [searchParams, navigate]);

  return (
    <Center minH="100vh" bg="gray.50">
      <VStack spaceY={4}>
        <Spinner 
          color="blue.500" 
          size="xl" 
        />
        <Text fontSize="xl" fontWeight="semibold" color="gray.700">
          Авторизация в системе...
        </Text>
        <Text fontSize="sm" color="gray.500">
          Пожалуйста, подождите
        </Text>
      </VStack>
    </Center>
  );
}