import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  SimpleGrid,
  Text,
  Stack,
  VStack,
  HStack,
  Textarea
} from '@chakra-ui/react';

interface Category {
  id: number;
  name: string;
}

interface InventoryMock {
  id: string;
  title: string;
  description: string;
  categoryId?: number;
  isPublic: boolean;
}

export default function Home() {  
  const navigate = useNavigate();

  // Управление темами
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Управление модальными окнами
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Состояния данных
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [categories, setCategories] = useState<Category[]>([]);
  const [inventories, setInventories] = useState<InventoryMock[]>([]); 
  const [searchQuery, setSearchQuery] = useState('');

  // Состояния формы создания инвентаря
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);

  // Загружаем реальные данные с бэкенда Render
  useEffect(() => {
    // 1. Тянем категории
    fetch('https://custom-inventory.onrender.com/api/categories')
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка категорий');
        return res.json();
      })
      .then((data) => setCategories(data))
      .catch((err) => console.error("Критическая ошибка сети (категории):", err));

    // 2. Тянем инвентари
    fetch('https://custom-inventory.onrender.com/api/inventory')
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка инвентарей');
        return res.json();
      })
      .then((data) => setInventories(data))
      .catch((err) => console.error("Инвентари не подгрузились:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.reload();
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();

    const newInventory = {
      title: title,
      description: description,
      categoryId: Number(categoryId),
      isPublic: isPublic
    };

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://custom-inventory.onrender.com/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newInventory)
      });

      if (!response.ok) {
        throw new Error(`Сервер ответил со статусом: ${response.status}`);
      }

      // Парсим созданный объект, чтобы забрать его id
      const createdData = await response.json();

      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setCategoryId('');
      setIsPublic(true);

      // Если бэкенд успешно вернул объект с id, перенаправляем на страницу инвентаря
      if (createdData && createdData.id) {
        navigate(`/inventory/${createdData.id}`);
      } else {
        // Запасной вариант, если бэкенд возвращает пустой JSON
        window.location.reload();
      }

    } catch (err) {
      console.error("Ошибка при создании инвентаря:", err);
      alert("Не удалось сохранить инвентарь. Проверь авторизацию.");
    }
  };

  const filteredInventories = inventories.filter(inv =>
    inv.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Цветовая палитра на основе стейта темы (для Chakra v3)
  const bgColor = isDarkMode ? 'gray.900' : 'gray.50';
  const cardBg = isDarkMode ? 'gray.800' : 'white';
  const textColor = isDarkMode ? 'white' : 'gray.800';
  const borderColor = isDarkMode ? 'gray.700' : 'gray.200';

  return (
    <Box bg={bgColor} color={textColor} minH="100vh" p={6} style={{ transition: 'all 0.2s' }}>
      
      {/* ШАПКА САЙТА */}
      <Flex justify="space-between" align="center" bg={cardBg} p={4} borderRadius="xl" boxShadow="sm" mb={8} gap={4} wrap="wrap" border="1px solid" borderColor={borderColor}>
        <Heading size="md" color="blue.500">CustomInventory</Heading>
        
        <Input
          placeholder="Поиск по инвентарям..."
          maxW="400px"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg={isDarkMode ? 'gray.700' : 'gray.50'}
          color={isDarkMode ? 'white' : 'black'}
          border="1px solid"
          borderColor={isDarkMode ? 'gray.600' : 'gray.300'}
        />

        <HStack gap={4}>
          <Button onClick={() => setIsDarkMode(!isDarkMode)} size="sm" variant="outline">
            {isDarkMode ? '☀️ Светлая' : '🌙 Тёмная'}
          </Button>

          {isAuthenticated ? (
            <>
              <Link to="/profile" style={{ display: 'inline-flex', alignItems: 'center', height: '40px', padding: '0 16px', borderRadius: '6px', border: '1px solid #3182CE', color: '#3182CE', fontWeight: '600', textDecoration: 'none' }}>
                Профиль
              </Link>
              <Button onClick={handleLogout} colorScheme="red" bg="red.500" color="white">Выйти</Button>
            </>
          ) : (
            <Button onClick={() => setIsLoginOpen(true)} colorScheme="blue" bg="blue.500" color="white">Войти</Button>
          )}
        </HStack>
      </Flex>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <Box as="main">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Каталоги инвентаря</Heading>
          {isAuthenticated && (
            <Button colorScheme="green" bg="green.500" color="white" onClick={() => setIsCreateOpen(true)}>
              + Создать инвентарь
            </Button>
          )}
        </Flex>

        {/* СЕТКА ИНВЕНТАРЕЙ */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {filteredInventories.map((inv) => (
            <Box key={inv.id} p={5} bg={cardBg} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor={borderColor}>
              <Heading size="sm" mb={2}>
                <Link to={`/inventory/${inv.id}`} style={{ color: '#3182CE', textDecoration: 'none' }}>
                  {inv.title}
                </Link>
              </Heading>
              <Text fontSize="sm" color="gray.500" mb={4}>{inv.description}</Text>
              <Flex justify="space-between" align="center" fontSize="xs">
                <Box px={2} py={1} bg={isDarkMode ? 'gray.700' : 'gray.100'} color={isDarkMode ? 'gray.200' : 'gray.700'} borderRadius="md">
                  Категория: {categories.find(c => c.id === inv.categoryId)?.name || 'Общая'}
                </Box>
                <Text color="gray.400">{inv.isPublic ? '🌐 Public' : '🔒 Private'}</Text>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* --- МОДАЛКА: ВХОД --- */}
      {isLoginOpen && (
        <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="rgba(0,0,0,0.6)" display="flex" justifyContent="center" alignItems="center" zIndex={1000}>
          <Box bg={cardBg} color={textColor} p={8} borderRadius="xl" w="400px" boxShadow="xl" border="1px solid" borderColor={borderColor} position="relative">
            <Heading size="md" mb={4} textAlign="center">Вход в систему</Heading>
            <Text fontSize="sm" color="gray.500" mb={6} textAlign="center">Выберите способ авторизации:</Text>
            
            <VStack gap={4}>
              <a href="https://custom-inventory.onrender.com/api/auth/signin-github" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '40px', background: '#2D3748', color: 'white', borderRadius: '6px', fontWeight: '600', textDecoration: 'none' }}>
                Войти через GitHub
              </a>
              <a href="https://custom-inventory.onrender.com/api/auth/signin-google" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '40px', background: '#E53E3E', color: 'white', borderRadius: '6px', fontWeight: '600', textDecoration: 'none' }}>
                Войти через Google
              </a>
              <Button variant="ghost" mt={2} onClick={() => setIsLoginOpen(false)}>Закрыть</Button>
            </VStack>
          </Box>
        </Box>
      )}

      {/* --- МОДАЛКА: СОЗДАТЬ ИНВЕНТАРЬ --- */}
      {isCreateOpen && (
        <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="rgba(0,0,0,0.6)" display="flex" justifyContent="center" alignItems="center" zIndex={1000}>
          <Box bg={cardBg} color={textColor} p={6} borderRadius="xl" w="460px" maxH="90vh" overflowY="auto" boxShadow="xl" border="1px solid" borderColor={borderColor} position="relative">
            
            {/* Кнопка-крестик закрытия */}
            <Button 
              onClick={() => setIsCreateOpen(false)} 
              position="absolute" 
              top="12px" 
              right="12px" 
              variant="ghost" 
              size="sm"
              color={isDarkMode ? 'white' : 'black'}
            >
              ✕
            </Button>

            <Heading size="md" mb={4}>Создание нового инвентаря</Heading>
            
            <form onSubmit={handleCreateInventory}>
              <Stack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>Название *</Text>
                  <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, Основной склад БГУИР" bg={isDarkMode ? 'gray.700' : 'white'} color={isDarkMode ? 'white' : 'black'} />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>Описание</Text>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Краткое описание... " bg={isDarkMode ? 'gray.700' : 'white'} color={isDarkMode ? 'white' : 'black'} />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>Категория *</Text>
                  <select 
                    required 
                    value={categoryId} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value)} 
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      borderRadius: '6px', 
                      border: '1px solid #CBD5E0', 
                      backgroundColor: isDarkMode ? '#4A5568' : 'white',
                      color: isDarkMode ? 'white' : 'black'
                    }}
                  >
                    <option value="" disabled style={{ color: 'gray' }}>Выберите категорию</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} style={{ color: isDarkMode ? 'white' : 'black' }}>{cat.name}</option>
                    ))}
                  </select>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>Изображение каталога</Text>
                  <input type="file" accept="image/*" style={{ fontSize: '14px' }} />
                </Box>

                {/* Выбор приватности */}
                <Box border="1px solid" borderColor={borderColor} p={3} borderRadius="lg">
                  <Text fontSize="sm" fontWeight="bold" mb={3}>Уровень доступа</Text>
                  <VStack align="flex-start" gap={3}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', width: '100%' }}>
                      <input type="radio" name="privacy" checked={isPublic === true} onChange={() => setIsPublic(true)} style={{ cursor: 'pointer' }} />
                      <Box>
                        <Text fontSize="sm" fontWeight="bold">🌐 Public (Публичный)</Text>
                        <Text fontSize="xs" color="gray.500">Виден всем пользователям в режиме чтения.</Text>
                      </Box>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', width: '100%' }}>
                      <input type="radio" name="privacy" checked={isPublic === false} onChange={() => setIsPublic(false)} style={{ cursor: 'pointer' }} />
                      <Box>
                        <Text fontSize="sm" fontWeight="bold">🔒 Private (Приватный)</Text>
                        <Text fontSize="xs" color="gray.500">Доступ только для создателя каталога.</Text>
                      </Box>
                    </label>
                  </VStack>
                </Box>

                <Flex justify="flex-end" gap={3} mt={2}>
                  <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Отмена</Button>
                  <Button bg="green.500" color="white" _hover={{ bg: 'green.600' }} type="submit">Создать</Button>
                </Flex>
              </Stack>
            </form>
          </Box>
        </Box>
      )}

    </Box>
  );
}