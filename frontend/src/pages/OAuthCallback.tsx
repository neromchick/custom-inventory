import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      navigate('/', { replace: true });
    } else {
      console.error('Токен авторизации не найден в URL');
      alert('Ошибка авторизации. Возвращаемся на главную.');
      navigate('/');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Пустой массив — эффект срабатывает один раз при маунте.
  // searchParams и navigate стабильны, повторный запуск не нужен.

  return (
    <Center h="100vh" bg="gray.50">
      <VStack gap={4}>
        <Spinner size="xl" color="blue.500" borderWidth="4px" />
        <Text fontSize="lg" fontWeight="semibold">Завершаем авторизацию...</Text>
      </VStack>
    </Center>
  );
}