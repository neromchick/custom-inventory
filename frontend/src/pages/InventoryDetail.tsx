import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Heading, Text, Button, VStack, HStack, SimpleGrid,
  Badge, Spinner, Center, Tabs, Table, IconButton, Stack, Input, Textarea
} from '@chakra-ui/react';
import { FaTrash, FaEdit, FaPlus, FaArrowLeft, FaBars } from 'react-icons/fa';
// Импорт компонентов и типов отдельно для strict verbatimModuleSyntax
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';

type FieldType = 'integer' | 'string' | 'text' | 'boolean' | 'date';

interface CustomField {
  id: string; // dnd требует строковые ID
  name: string;
  type: FieldType;
}

interface Item {
  id: string | number;
  name: string;
  customValues: Record<string, string | number | boolean>;
}

export default function InventoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [fields, setFields] = useState<CustomField[]>([]);
  
  // Поля ввода для создания нового кастомного поля
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('string');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    fetch(`https://custom-inventory.onrender.com/api/inventories/${id}/items`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Функция для обработки перетаскивания полей (Drag & Drop)
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedFields = Array.from(fields);
    const [removed] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, removed);

    setFields(reorderedFields);
  };

  // Локальное добавление нового поля
  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    
    const newField: CustomField = {
      id: Math.random().toString(),
      name: newFieldName,
      type: newFieldType
    };

    setFields([...fields, newField]);
    setNewFieldName('');
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleDeleteInventory = async () => {
    if (!window.confirm("Вы уверены, что хотите полностью удалить этот инвентарь?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://custom-inventory.onrender.com/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      navigate('/');
    } catch {
      alert("Ошибка при удалении");
    }
  };

  if (loading) return <Center h="100vh"><Spinner size="xl" /></Center>;

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
      {/* Шапка страницы */}
      <VStack align="start" mb={8} gap={4}>
        <RouterLink to="/">
          <Button variant="ghost" size="sm">
            <FaArrowLeft style={{ marginRight: '8px' }} /> Назад к спискам
          </Button>
        </RouterLink>
        <HStack w="100%" justify="space-between">
          <Box>
            <Heading size="xl" mb={2}>{title || `Инвентарь #${id}`}</Heading>
            <Badge colorScheme={isPublic ? 'green' : 'red'}>
              {isPublic ? 'Публичный' : 'Приватный'}
            </Badge>
          </Box>
          <Button colorScheme="red" variant="outline" onClick={handleDeleteInventory}>
            <FaTrash style={{ marginRight: '8px' }} /> Удалить инвентарь
          </Button>
        </HStack>
      </VStack>

      {/* Вкладки: Синтаксис Chakra UI v3 */}
      <Tabs.Root defaultValue="items" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value="items" fontWeight="bold">Предметы</Tabs.Trigger>
          <Tabs.Trigger value="fields" fontWeight="bold">Поля (Конструктор)</Tabs.Trigger>
          <Tabs.Trigger value="settings" fontWeight="bold">Настройки</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="items" p={6} borderWidth="1px" borderRadius="md" mt={2}>
          <HStack justify="space-between" mb={6}>
            <Heading size="md">Содержимое</Heading>
            <Button colorScheme="blue">
              <FaPlus style={{ marginRight: '8px' }} /> Добавить предмет
            </Button>
          </HStack>
          
          {items.length === 0 ? (
            <Text color="gray.500">Предметов пока нет. Настройте поля и добавьте первый ассет.</Text>
          ) : (
            <Table.Root variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Название</Table.ColumnHeader>
                  {fields.map(f => <Table.ColumnHeader key={f.id}>{f.name}</Table.ColumnHeader>)}
                  <Table.ColumnHeader textAlign="right">Действия</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {items.map(item => (
                  <Table.Row key={item.id}>
                    <Table.Cell fontWeight="medium">{item.name}</Table.Cell>
                    {fields.map(f => <Table.Cell key={f.id}>—</Table.Cell>)}
                    <Table.Cell textAlign="right">
                      <IconButton aria-label="Edit" size="sm" mr={2}><FaEdit /></IconButton>
                      <IconButton aria-label="Delete" size="sm" colorScheme="red"><FaTrash /></IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Tabs.Content>

        {/* Вкладка 2: ПОЛЯ С DRAG & DROP */}
        <Tabs.Content value="fields" p={6} borderWidth="1px" borderRadius="md" mt={2}>
          <Heading size="md" mb={2}>Конструктор кастомных полей</Heading>
          <Text mb={6} color="gray.500">
            Перетаскивайте поля мышкой, чтобы изменить порядок их отображения в таблице предметов.
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={10}>
            {/* Форма добавления */}
            <Box>
              <Stack gap={4}>
                <Box>
                  <Text fontWeight="medium" mb={2}>Название нового поля</Text>
                  <Input 
                    placeholder="Например: Цена или Производитель" 
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                  />
                </Box>
                <Box>
                  <Text fontWeight="medium" mb={2}>Тип данных</Text>
                  <select 
                    value={newFieldType} 
                    onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'transparent' }}
                  >
                    <option value="string">Строка (String)</option>
                    <option value="integer">Число (Integer)</option>
                    <option value="text">Многострочный текст (Text)</option>
                    <option value="boolean">Логическое (Boolean)</option>
                    <option value="date">Дата (Date)</option>
                  </select>
                </Box>
                <Button colorScheme="green" onClick={handleAddField}>
                  <FaPlus style={{ marginRight: '8px' }} /> Добавить field
                </Button>
              </Stack>
            </Box>

            {/* Зона перетаскивания (Drag & Drop context) */}
            <Box borderWidth="1px" p={4} borderRadius="lg">
              <Heading size="xs" mb={4} color="gray.400" textTransform="uppercase">Сортировка полей</Heading>
              
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="fields-list">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {fields.length === 0 && <Text fontSize="sm" color="gray.400">Поля еще не созданы</Text>}
                      
                      {fields.map((field, index) => (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided) => (
                            <HStack
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              justify="space-between"
                              p={3}
                              mb={2}
                              bg="gray.50"
                              _dark={{ bg: 'gray.700' }}
                              borderRadius="md"
                              border="1px solid #E2E8F0"
                            >
                              <HStack gap={3}>
                                <FaBars style={{ color: '#A0AEC0', cursor: 'grab' }} />
                                <Text fontWeight="bold">{field.name}</Text>
                                <Badge>{field.type}</Badge>
                              </HStack>
                              <IconButton 
                                aria-label="Delete field" 
                                size="xs" 
                                colorScheme="red" 
                                variant="ghost"
                                onClick={() => handleDeleteField(field.id)}
                              >
                                <FaTrash />
                              </IconButton>
                            </HStack>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Box>
          </SimpleGrid>
        </Tabs.Content>

        {/* Вкладка 3: НАСТРОЙКИ */}
        <Tabs.Content value="settings" p={6} borderWidth="1px" borderRadius="md" mt={2}>
          <Heading size="md" mb={6}>Общие настройки инвентаря</Heading>
          <VStack gap={5} align="start" maxW="600px">
            <Box w="full">
              <Text fontWeight="medium" mb={2}>Название</Text>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Box>
            
            <Box w="full">
              <Text fontWeight="medium" mb={2}>Описание</Text>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </Box>

            <Box w="full">
              <Text fontWeight="medium" mb={2}>Изображение инвентаря (Cloudinary)</Text>
              <Input type="file" p={1} />
            </Box>

            <Box w="full" display="flex" alignItems="center" gap={3} mt={2}>
              <Text fontWeight="medium">Публичный доступ:</Text>
              <input 
                type="checkbox" 
                checked={isPublic} 
                onChange={(e) => setIsPublic(e.target.checked)} 
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </Box>

            <Button colorScheme="blue" size="lg" px={10}>
              Сохранить изменения
            </Button>
          </VStack>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}