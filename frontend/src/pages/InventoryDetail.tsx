import { useEffect, useState, startTransition } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Heading, Text, Button, VStack, HStack, SimpleGrid,
  Badge, Spinner, Center, Tabs, Table, IconButton, Stack, Input, Textarea, Image
} from '@chakra-ui/react';
import { FaTrash, FaPlus, FaArrowLeft, FaBars, FaCloudUploadAlt, FaEye, FaEdit } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';

type FieldType = 'integer' | 'string' | 'text' | 'boolean' | 'date';

interface CustomField {
  id: string; // Будет иметь вид customString1, customText3 и т.д.
  name: string;
  type: FieldType;
}

interface Item {
  id: string;
  values: Record<string, string | number | boolean>;
}

interface InventoryData {
  id: string;
  title: string;
  description: string;
  categoryId?: number;
  isPublic: boolean;
  imageUrl?: string;
  [key: string]: unknown; // Разрешаем динамические ключи конфигурации полей
}

function fieldTypeToPrefix(type: FieldType): string {
  switch (type) {
    case 'string':  return 'customString';
    case 'text':    return 'customText';
    case 'integer': return 'customInt';
    case 'boolean': return 'customBool';
    case 'date':    return 'customLink';
    default: return 'customString';
  }
}

export default function InventoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Общие состояния
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Данные инвентаря
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [fields, setFields] = useState<CustomField[]>([]);
  
  // Состояния для чекбоксов (выбранные предметы)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  
  // Состояние формы предмета
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});

  // Состояния для настроек самого каталога
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Поля ввода для добавления нового кастомного поля
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('string');

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. ЗАГРУЗКА ДАННЫХ ИЗ БАЗЫ (ПОСЛЕДОВАТЕЛЬНО)
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;

    const loadData = async () => {
      try {
        // Шаг A: Загружаем конфигурацию инвентаря
        const inventoryRes = await fetch(`https://custom-inventory.onrender.com/api/inventory/${id}`, { headers });
        if (!inventoryRes.ok) throw new Error("Ошибка при загрузке инвентаря");
        const inventoryData: InventoryData = await inventoryRes.json();

        if (!isMounted) return;

        setInventory(inventoryData);
        setTitle(inventoryData.title || '');
        setDescription(inventoryData.description || '');
        setIsPublic(inventoryData.isPublic !== undefined ? inventoryData.isPublic : true);
        setPreviewUrl(inventoryData.imageUrl || '');
        
        // Маппинг кастомных полей из реальных настроек бэкенда
        const loadedFields: CustomField[] = [];
        const typeMap: Array<{ type: FieldType; prefix: string }> = [
          { type: 'string', prefix: 'customString' },
          { type: 'text',   prefix: 'customText' },
          { type: 'integer', prefix: 'customInt' },
          { type: 'boolean', prefix: 'customBool' },
          { type: 'date',   prefix: 'customLink' },
        ];

        typeMap.forEach(({ type, prefix }) => {
          for (let i = 1; i <= 3; i++) {
            const stateKey = `${prefix}${i}State`;
            const nameKey  = `${prefix}${i}Name`;
            if (inventoryData[stateKey] === true && inventoryData[nameKey]) {
              loadedFields.push({
                id: `${prefix}${i}`, // Фиксированный ID вида "customString1"
                name: inventoryData[nameKey] as string,
                type,
              });
            }
          }
        });
        setFields(loadedFields);

        // Шаг B: Загружаем предметы только ПОСЛЕ того, как определили структуру полей
        const itemsRes = await fetch(`https://custom-inventory.onrender.com/api/inventories/${id}/items`, { headers });
        const itemsData = itemsRes.ok ? await itemsRes.json() : [];

        if (!isMounted) return;

        // Шаг C: Маппинг значений каждого предмета из плоской структуры в values
        const mappedItems = (itemsData as Record<string, unknown>[]).map(raw => {
          const itemValues: Record<string, string | number | boolean> = {};
          loadedFields.forEach(f => {
            const val = raw[`${f.id}Value`];
            if (val !== undefined && val !== null) {
              itemValues[f.id] = val as string | number | boolean;
            }
          });
          return {
            id: raw.id as string,
            values: itemValues
          };
        });

        setItems(mappedItems);
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;

        // Локальный режим на случай недоступности бэкенда
        setInventory({ 
          id: id || '1', title: `Инвентарь #${id}`, description: 'Локальный режим отладки', isPublic: true,
          imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400' 
        });
        setPreviewUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400');
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDynamicFormChange = (fieldId: string, value: string | number | boolean) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  // 2. СОХРАНЕНИЕ / ОБНОВЛЕНИЕ ПРЕДМЕТА
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Преобразуем плоские значения в формат `{ customString1Value: "..." }`
    const itemPayload: Record<string, unknown> = {};
    for (const [fieldId, value] of Object.entries(formValues)) {
      itemPayload[`${fieldId}Value`] = value;
    }

    try {
      if (editingItemId) {
        const res = await fetch(`https://custom-inventory.onrender.com/api/inventories/${id}/items/${editingItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(itemPayload) 
        });
        if (!res.ok) throw new Error();

        setItems(items.map(item => item.id === editingItemId ? { ...item, values: formValues } : item));
        showNotification("Запись успешно обновлена в БД!");
      } else {
        const res = await fetch(`https://custom-inventory.onrender.com/api/inventories/${id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(itemPayload) 
        });
        if (!res.ok) throw new Error();
        
        const rawCreatedItem = await res.json();

        // Сразу маппим ответ бэкенда при добавлении в стейт
        const createdValues: Record<string, string | number | boolean> = {};
        fields.forEach(f => {
          const val = rawCreatedItem[`${f.id}Value`];
          if (val !== undefined && val !== null) {
            createdValues[f.id] = val as string | number | boolean;
          }
        });

        const createdItem: Item = {
          id: rawCreatedItem.id as string,
          values: createdValues
        };

        setItems([...items, createdItem]);
        showNotification("Предмет добавлен в базу данных!");
      }
    } catch {
      if (editingItemId) {
        setItems(items.map(item => item.id === editingItemId ? { ...item, values: formValues } : item));
        showNotification("Изменено локально (ошибка сети)", "success");
      } else {
        const fakeItem: Item = { id: `item-${Date.now()}`, values: { ...formValues } };
        setItems([...items, fakeItem]);
        showNotification("Добавлено локально (ошибка сети)", "success");
      }
    }

    setFormValues({});
    setEditingItemId(null);
    setIsFormOpen(false);
    setSelectedItemIds([]);
  };

  const handleEditClick = () => {
    if (selectedItemIds.length !== 1) return;
    const targetId = selectedItemIds[0];
    const targetItem = items.find(item => item.id === targetId);
    if (targetItem) {
      setFormValues(targetItem.values || {});
      setEditingItemId(targetId);
      setIsFormOpen(true);
    }
  };

  // 3. МАССОВОЕ УДАЛЕНИЕ ПРЕДМЕТОВ ИЗ БД
  const handleDeleteSelectedItems = async () => {
  if (!window.confirm(`Вы уверены, что хотите удалить выбранные предметы (${selectedItemIds.length} шт.)?`)) return;
  const token = localStorage.getItem('token');

  try {
    await Promise.all(
      selectedItemIds.map(itemId =>
        fetch(`https://custom-inventory.onrender.com/api/inventories/${id}/items/${itemId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        })
      )
    );
    setItems(items.filter(item => !selectedItemIds.includes(item.id)));
    setSelectedItemIds([]);
    showNotification("Выбранные элементы удалены.");
  } catch {
    showNotification("Ошибка при удалении.", "error");
  }
};

  const handleSelectAll = (checked: boolean) => {
    setSelectedItemIds(checked ? items.map(item => item.id) : []);
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItemIds(prev => checked ? [...prev, itemId] : prev.filter(id => id !== itemId));
  };

  // 4. СОХРАНЕНИЕ СТРУКТУРЫ КАСТОМНЫХ ПОЛЕЙ
  const saveFieldsStructure = async (updatedFields: CustomField[]) => {
    const token = localStorage.getItem('token');

    // Собираем тело запроса в формат, который понимает бэкенд
    const body: Record<string, unknown> = {
      title, description, isPublic, imageUrl: previewUrl,
      // Сначала всё выключаем
      customString1State: false, customString1Name: null,
      customString2State: false, customString2Name: null,
      customString3State: false, customString3Name: null,
      customText1State: false, customText1Name: null,
      customText2State: false, customText2Name: null,
      customText3State: false, customText3Name: null,
      customInt1State: false, customInt1Name: null,
      customInt2State: false, customInt2Name: null,
      customInt3State: false, customInt3Name: null,
      customBool1State: false, customBool1Name: null,
      customBool2State: false, customBool2Name: null,
      customBool3State: false, customBool3Name: null,
      customLink1State: false, customLink1Name: null,
      customLink2State: false, customLink2Name: null,
      customLink3State: false, customLink3Name: null,
    };

    // Включаем только те, что есть в updatedFields
    const counters: Record<string, number> = {};
    for (const field of updatedFields) {
      const prefix = fieldTypeToPrefix(field.type);
      counters[prefix] = (counters[prefix] || 0) + 1;
      const n = counters[prefix];
      body[`${prefix}${n}State`] = true;
      body[`${prefix}${n}Name`]  = field.name;
    }

    try {
      await fetch(`https://custom-inventory.onrender.com/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error(err);
      showNotification("Не удалось обновить структуру на сервере.", "error");
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reorderedFields = Array.from(fields);
    const [removed] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, removed);
    setFields(reorderedFields);
    saveFieldsStructure(reorderedFields);
  };

  const handleAddField = () => {
    if (!newFieldName.trim()) return;

    // Считаем текущее количество полей выбранного типа
    const sameTypeFields = fields.filter(f => f.type === newFieldType);
    if (sameTypeFields.length >= 3) {
      showNotification(`Ошибка: Лимит! Нельзя добавить больше 3 полей типа "${newFieldType}"`, 'error');
      return;
    }

    // Определяем свободный индекс (от 1 до 3) для этого префикса
    const activeIndices = sameTypeFields.map(f => {
      const match = f.id.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    });

    let targetIndex = 1;
    for (let i = 1; i <= 3; i++) {
      if (!activeIndices.includes(i)) {
        targetIndex = i;
        break;
      }
    }

    const prefix = fieldTypeToPrefix(newFieldType);
    const newField: CustomField = { 
      id: `${prefix}${targetIndex}`, 
      name: newFieldName, 
      type: newFieldType 
    };

    const updated = [...fields, newField];
    setFields(updated);
    setNewFieldName('');
    saveFieldsStructure(updated);
    showNotification(`Поле "${newField.name}" добавлено.`);
  };

  const handleDeleteField = (fieldId: string) => {
    const updated = fields.filter(f => f.id !== fieldId);
    setFields(updated);
    saveFieldsStructure(updated);
    
    setItems(items.map(item => {
      const updatedValues = { ...item.values };
      delete updatedValues[fieldId];
      return { ...item, values: updatedValues };
    }));
    showNotification("Поле удалено.");
  };

  // 5. СОХРАНЕНИЕ ОБЩИХ НАСТРОЕК КАТАЛОГА
  const handleSaveSettings = async () => {
    const token = localStorage.getItem('token');
    showNotification("Сохранение...");
    try {
      const res = await fetch(`https://custom-inventory.onrender.com/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, description, isPublic, imageUrl: previewUrl })
      });
      if (!res.ok) throw new Error();
      if (inventory) setInventory({ ...inventory, title, description, isPublic, imageUrl: previewUrl });
      showNotification("Параметры каталога успешно обновлены в БД!", "success");
    } catch {
      showNotification("Ошибка сохранения настроек.", "error");
    }
  };

  const handleDeleteInventory = async () => {
    if (!window.confirm("Вы уверены, что хотите полностью удалить этот инвентарь?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://custom-inventory.onrender.com/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification("Инвентарь удален!", "success");
      setTimeout(() => startTransition(() => navigate('/')), 1000);
    } catch {
      showNotification("Ошибка при удалении инвентаря.", "error");
    }
  };

  // Новый handleFileChange — сразу загружает в Cloudinary
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Показываем локальный превью пока грузится
  setPreviewUrl(URL.createObjectURL(file));
  showNotification("Загружаем изображение...");

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'inventory_preset'); 
    formData.append('cloud_name', 'dvtkbe5h0');       

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dvtkbe5h0/image/upload`, 
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    
    setPreviewUrl(data.secure_url);
    showNotification("Изображение загружено! Нажмите 'Сохранить'.");
  } catch {
    showNotification("Ошибка загрузки изображения.", "error");
  }
};

  if (loading) return <Center h="100vh"><Spinner size="xl" /></Center>;

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto" position="relative">
      
      {/* ТОСТ-УВЕДОМЛЕНИЯ */}
      {notification && (
        <Box 
          position="fixed" top="20px" right="20px" zIndex={5000}
          bg={notification.type === 'success' ? 'green.500' : 'red.500'} 
          color="white" px={6} py={3} borderRadius="lg" boxShadow="xl" fontWeight="bold"
        >
          {notification.type === 'success' ? '✅ ' : '❌ '} {notification.message}
        </Box>
      )}

      {/* НАВИГАЦИЯ И КАРТОЧКА КАТАЛОГА */}
      <VStack align="start" mb={8} gap={4}>
        <RouterLink to="/">
          <Button variant="ghost" size="sm">
            <FaArrowLeft style={{ marginRight: '8px' }} /> Назад к спискам
          </Button>
        </RouterLink>
        
        <HStack w="100%" justify="space-between" align="center" wrap="wrap" gap={6} p={4} borderWidth="1px" borderRadius="xl" bg="white" borderColor="gray.200">
          <HStack gap={5} align="center">
            <Box w="100px" h="100px" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.300" bg="gray.50" flexShrink={0}>
              {previewUrl ? <Image src={previewUrl} alt="Inventory" w="100%" h="100%" objectFit="cover" /> : <Center h="100%" color="gray.400" fontSize="xs">Нет фото</Center>}
            </Box>
            <Box>
              <Heading size="xl" mb={1}>{inventory?.title || `Инвентарь #${id}`}</Heading>
              <Text color="gray.500" fontSize="sm" mb={2}>{inventory?.description || 'Без описания'}</Text>
              <Badge colorScheme={isPublic ? 'green' : 'red'}>
                {isPublic ? '🌐 Публичный' : '🔒 Приватный'}
              </Badge>
            </Box>
          </HStack>
          <Button colorScheme="red" variant="outline" onClick={handleDeleteInventory}>
            <FaTrash style={{ marginRight: '8px' }} />  Удалить инвентарь
          </Button>
        </HStack>
      </VStack>

      <Tabs.Root defaultValue="items" variant="enclosed">
        <Tabs.List borderBottom="1px solid" borderColor="gray.200">
          <Tabs.Trigger value="items" fontWeight="bold" py={3}>Предметы</Tabs.Trigger>
          <Tabs.Trigger value="fields" fontWeight="bold" py={3}>Поля (Конструктор)</Tabs.Trigger>
          <Tabs.Trigger value="settings" fontWeight="bold" py={3}>Настройки</Tabs.Trigger>
        </Tabs.List>

        {/* 1. ВКЛАДКА: ПРЕДМЕТЫ */}
        <Tabs.Content value="items" p={6} borderWidth="1px" borderRadius="md" mt={4} bg="white" borderColor="gray.200">
          
          <HStack justify="space-between" mb={6} wrap="wrap" gap={4}>
            <HStack gap={3}>
              <Button 
                colorScheme="blue" bg="blue.500" color="white"
                onClick={() => {
                  if (fields.length === 0) {
                    showNotification("Сначала настройте поля в конструкторе!", "error");
                    return;
                  }
                  setEditingItemId(null);
                  setFormValues({});
                  setIsFormOpen(!isFormOpen);
                }}
              >
                <FaPlus style={{ marginRight: '8px' }} /> 
                {isFormOpen && !editingItemId ? 'Закрыть форму' : 'Добавить предмет'}
              </Button>

              {/* УМНАЯ КНОПКА РЕДАКТИРОВАНИЯ */}
              {selectedItemIds.length === 1 && (
                <Button colorScheme="orange" variant="subtle" onClick={handleEditClick}>
                  <FaEdit style={{ marginRight: '8px' }} /> Редактировать
                </Button>
              )}

              {/* ГРУППОВОЕ УДАЛЕНИЕ */}
              {selectedItemIds.length > 0 && (
                <Button colorScheme="red" variant="subtle" onClick={handleDeleteSelectedItems}>
                  <FaTrash style={{ marginRight: '8px' }} /> Удалить выбранные ({selectedItemIds.length})
                </Button>
              )}
            </HStack>
            <Heading size="sm" color="gray.400">Всего записей: {items.length}</Heading>
          </HStack>

          {/* ДИНАМИЧЕСКАЯ ФОРМА */}
          {isFormOpen && (
            <Box mb={8} p={5} borderWidth="1px" borderRadius="lg" bg="gray.50" _dark={{ bg: 'gray.900' }}>
              <Heading size="xs" textTransform="uppercase" color="gray.500" mb={4}>
                {editingItemId ? 'Редактирование записи' : 'Новая запись'}
              </Heading>
              <form onSubmit={handleSaveItem}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} mb={4}>
                  {fields.map(field => (
                    <Box key={field.id}>
                      <Text fontSize="xs" fontWeight="bold" mb={2}>{field.name} <span style={{ color: '#A0AEC0' }}>({field.type})</span></Text>
                      
                      {field.type === 'text' ? (
                        <Textarea 
                          bg="white" _dark={{ bg: 'gray.800' }}
                          value={(formValues && (formValues[field.id] as string)) || ''}
                          onChange={(e) => handleDynamicFormChange(field.id, e.target.value)}
                        />
                      ) : field.type === 'boolean' ? (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '40px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            style={{ width: '18px', height: '18px' }}
                            checked={!!(formValues && formValues[field.id])}
                            onChange={(e) => handleDynamicFormChange(field.id, e.target.checked)} 
                          />
                          <Text fontSize="sm">Да / Активно</Text>
                        </label>
                      ) : field.type === 'date' ? (
                        <Input 
                          type="date" bg="white" _dark={{ bg: 'gray.800' }}
                          value={(formValues && (formValues[field.id] as string)) || ''}
                          onChange={(e) => handleDynamicFormChange(field.id, e.target.value)}
                        />
                      ) : field.type === 'integer' ? (
                        <Input 
                          type="number" step="1" bg="white" _dark={{ bg: 'gray.800' }}
                          value={(formValues && (formValues[field.id] as number)) || ''}
                          onChange={(e) => handleDynamicFormChange(field.id, parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        <Input 
                          type="text" bg="white" _dark={{ bg: 'gray.800' }}
                          value={(formValues && (formValues[field.id] as string)) || ''}
                          onChange={(e) => handleDynamicFormChange(field.id, e.target.value)}
                        />
                      )}
                    </Box>
                  ))}
                </SimpleGrid>
                <HStack justify="flex-end">
                  <Button size="sm" variant="ghost" onClick={() => { setIsFormOpen(false); setEditingItemId(null); }}>Отмена</Button>
                  <Button size="sm" type="submit" colorScheme="green" bg="green.500" color="white">
                    {editingItemId ? 'Сохранить изменения' : 'Создать запись'}
                  </Button>
                </HStack>
              </form>
            </Box>
          )}

          {/* ТАБЛИЦА */}
          {fields.length === 0 ? (
            <Box textStyle="sm" color="gray.500" py={8} textAlign="center" border="1px dashed" borderColor="gray.300" borderRadius="md">
              Конструктор полей пуст. Настройте структуру во второй вкладке.
            </Box>
          ) : items.length === 0 ? (
            <Box textStyle="sm" color="gray.500" py={8} textAlign="center" border="1px dashed" borderColor="gray.300" borderRadius="md">
              Каталог пуст. Создайте первый предмет.
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table.Root variant="line">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader width="40px">
                      <input 
                        type="checkbox" 
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        checked={selectedItemIds.length === items.length && items.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </Table.ColumnHeader>
                    {fields.map(f => <Table.ColumnHeader key={f.id}>{f.name}</Table.ColumnHeader>)}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {items.map(item => {
                    const isChecked = selectedItemIds.includes(item.id);
                    return (
                      <Table.Row key={item.id} bg={isChecked ? 'blue.50/50' : 'transparent'} _dark={{ bg: isChecked ? 'whiteAlpha.50' : 'transparent' }}>
                        <Table.Cell>
                          <input 
                            type="checkbox" 
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            checked={isChecked}
                            onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          />
                        </Table.Cell>
                        {fields.map(f => {
                          const val = item.values ? item.values[f.id] : undefined;
                          let renderedVal = val !== undefined ? String(val) : '—';
                          if (f.type === 'boolean') renderedVal = val ? '✅ Да' : '❌ Нет';
                          return <Table.Cell key={f.id}>{renderedVal}</Table.Cell>;
                        })}
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </Tabs.Content>

        {/* 2. ВКЛАДКА: КОНСТРУКТОР ПОЛЕЙ */}
        <Tabs.Content value="fields" p={6} borderWidth="1px" borderRadius="md" mt={4} bg="white" borderColor="gray.200">
          <Heading size="md" mb={2}>Кастомная структура ассетов</Heading>
          <Text mb={6} color="gray.500" fontSize="sm">Вы можете добавить до 3 полей каждого типа.</Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
            <Stack gap={4} p={4} borderWidth="1px" borderRadius="lg" h="fit-content">
              <Heading size="xs" textTransform="uppercase" color="gray.400">Новое поле</Heading>
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={2}>Название поля</Text>
                <Input placeholder="Например: Серийный номер" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={2}>Тип данных</Text>
                <select 
                  value={newFieldType} onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E0', background: 'transparent' }}
                >
                  <option value="string">Строка (String)</option>
                  <option value="integer">Целое число (Integer)</option>
                  <option value="text">Многострочный текст (Text)</option>
                  <option value="boolean">Логическое (Boolean)</option>
                  <option value="date">Дата (Date)</option>
                </select>
              </Box>
              <Button colorScheme="green" bg="green.500" color="white" onClick={handleAddField} mt={2}>
                <FaPlus style={{ marginRight: '8px' }} /> Добавить в структуру
              </Button>
            </Stack>

            <Box borderWidth="1px" p={4} borderRadius="lg">
              <Heading size="xs" mb={4} color="gray.400" textTransform="uppercase">Порядок вывода полей</Heading>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="dynamic-fields-zone">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {fields.length === 0 && <Text fontSize="sm" color="gray.400" textAlign="center" py={6}>Полей еще не добавлено.</Text>}
                      {fields.map((field, index) => (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided) => (
                            <HStack
                              ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                              justify="space-between" p={3} mb={2} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md" border="1px solid" borderColor="gray.200"
                            >
                              <HStack gap={3}>
                                <FaBars style={{ color: '#A0AEC0', cursor: 'grab' }} />
                                <Text fontWeight="bold" fontSize="sm">{field.name}</Text>
                                <Badge size="sm" variant="surface">{field.type}</Badge>
                              </HStack>
                              <IconButton aria-label="Delete field" size="xs" colorScheme="red" variant="ghost" onClick={() => handleDeleteField(field.id)}><FaTrash /></IconButton>
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

        {/* 3. ВКЛАДКА: НАСТРОЙКИ */}
        <Tabs.Content value="settings" p={6} borderWidth="1px" borderRadius="md" mt={4} bg="white" borderColor="gray.200">
          <Heading size="md" mb={6}>Редактирование параметров каталога</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
            <VStack gap={5} align="start" w="full">
              <Box w="full">
                <Text fontSize="sm" fontWeight="bold" mb={2}>Название инвентаря</Text>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Box>
              
              <Box w="full">
                <Text fontSize="sm" fontWeight="bold" mb={2}>Описание</Text>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </Box>

              <Box w="full">
                <Text fontSize="sm" fontWeight="bold" mb={2}>Изображение каталога (Cloudinary)</Text>
                <label style={{ display: 'block', width: '100%' }}>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  <Button 
                    as="span" colorScheme="blue" bg="blue.600" color="white" _hover={{ bg: 'blue.700' }}
                    w="full" cursor="pointer" h="44px" borderRadius="md" boxShadow="sm"
                  >
                    <FaCloudUploadAlt style={{ marginRight: '10px', fontSize: '18px' }} /> Выбрать файл изображения
                  </Button>
                </label>
              </Box>

              <Box border="1px solid" borderColor="gray.200" p={4} borderRadius="lg" w="full">
                <Text fontSize="sm" fontWeight="bold" mb={3}>Уровень доступа</Text>
                <VStack align="flex-start" gap={3}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', width: '100%' }}>
                    <input type="radio" name="detail-privacy" checked={isPublic === true} onChange={() => setIsPublic(true)} />
                    <Box><Text fontSize="sm" fontWeight="bold">🌐 Public (Публичный)</Text></Box>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', width: '100%' }}>
                    <input type="radio" name="detail-privacy" checked={isPublic === false} onChange={() => setIsPublic(false)} />
                    <Box><Text fontSize="sm" fontWeight="bold">🔒 Private (Приватный)</Text></Box>
                  </label>
                </VStack>
              </Box>

              <Button colorScheme="green" bg="green.500" color="white" size="lg" px={8} mt={2} onClick={handleSaveSettings}>
                Сохранить изменения
              </Button>
            </VStack>

            <VStack align="center" justify="center" p={4} borderWidth="1px" borderColor="gray.200" borderRadius="xl" bg="gray.50" _dark={{ bg: 'gray.900' }}>
              <Heading size="xs" color="gray.400" mb={2} textTransform="uppercase">Предпросмотр обложки</Heading>
              <Box w="240px" h="240px" borderRadius="xl" overflow="hidden" boxShadow="md" border="2px solid" borderColor="blue.500">
                {previewUrl ? <Image src={previewUrl} alt="Preview" w="100%" h="100%" objectFit="cover" /> : <Center h="100%" color="gray.400"><FaEye style={{ fontSize: '32px' }} /></Center>}
              </Box>
            </VStack>
          </SimpleGrid>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}