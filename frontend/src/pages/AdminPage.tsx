import { useEffect, useState } from 'react';
import {
  Box, Heading, Table, Badge, HStack, IconButton, Spinner, Center, Text
} from '@chakra-ui/react';
import { FaLock, FaLockOpen, FaTrash, FaUserShield, FaUserMinus } from 'react-icons/fa';
import { getUsers, blockUser, unblockUser, deleteUser, makeAdmin, removeAdmin, type UserDto } from '../api/admin';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const load = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

// eslint-disable-next-line react-hooks/set-state-in-effect
useEffect(() => { load(); }, []);

  const handle = async (action: () => Promise<unknown>) => {
    await action();
    await load();
  };

  if (loading) return <Center h="100vh"><Spinner size="xl" /></Center>;

  return (
    <Box maxW="6xl" mx="auto" p={8}>
      <Heading mb={6}>Управление пользователями</Heading>

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Пользователь</Table.ColumnHeader>
            <Table.ColumnHeader>Email</Table.ColumnHeader>
            <Table.ColumnHeader>Роли</Table.ColumnHeader>
            <Table.ColumnHeader>Статус</Table.ColumnHeader>
            <Table.ColumnHeader>Действия</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.map(u => (
            <Table.Row key={u.id}>
              <Table.Cell>{u.userName}</Table.Cell>
              <Table.Cell>{u.email}</Table.Cell>
              <Table.Cell>
                <HStack gap={1}>
                  {u.roles.map(r => (
                    <Badge key={r} colorPalette={r === 'Admin' ? 'red' : 'blue'}>{r}</Badge>
                  ))}
                </HStack>
              </Table.Cell>
              <Table.Cell>
                <Badge colorPalette={u.isBlocked ? 'red' : 'green'}>
                  {u.isBlocked ? 'Заблокирован' : 'Активен'}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <HStack gap={2}>
                  {u.isBlocked
                    ? <IconButton aria-label="Разблокировать" size="sm" variant="ghost" colorPalette="green" onClick={() => handle(() => unblockUser(u.id))}><FaLockOpen /></IconButton>
                    : <IconButton aria-label="Заблокировать" size="sm" variant="ghost" colorPalette="orange" onClick={() => handle(() => blockUser(u.id))}><FaLock /></IconButton>
                  }
                  {u.roles.includes('Admin')
                    ? <IconButton aria-label="Снять админа" size="sm" variant="ghost" colorPalette="yellow" onClick={() => handle(() => removeAdmin(u.id))} disabled={u.id === currentUser?.id}><FaUserMinus /></IconButton>
                    : <IconButton aria-label="Сделать админом" size="sm" variant="ghost" colorPalette="purple" onClick={() => handle(() => makeAdmin(u.id))}><FaUserShield /></IconButton>
                  }
                  <IconButton aria-label="Удалить" size="sm" variant="ghost" colorPalette="red" onClick={() => handle(() => deleteUser(u.id))} disabled={u.id === currentUser?.id}><FaTrash /></IconButton>
                </HStack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {users.length === 0 && <Text textAlign="center" mt={8} color="gray.500">Пользователей нет</Text>}
    </Box>
  );
}