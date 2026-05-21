import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Вытаскиваем токен из URL (например: ?token=XXXXX)
    const token = searchParams.get('token');

    if (token) {
      // Сохраняем в localStorage, чтобы фронтенд знал, что мы вошли
      localStorage.setItem('token', token);
      
      // Перенаправляем на главную
      navigate('/');
      // Мягко обновляем страницу, чтобы пересчитался стейт isAuthenticated в Home.tsx
      window.location.reload();
    } else {
      console.error('Токен авторизации не найден в URL');
      alert('Ошибка авторизации. Возвращаемся на главную.');
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <Center h="100vh" bg="gray.50">
      <VStack gap={4}>
        <Spinner size="xl" color="blue.500" borderWidth="4px" />
        <Text fontSize="lg" fontWeight="semibold">Завершаем авторизацию...</Text>
      </VStack>
    </Center>
  );
}