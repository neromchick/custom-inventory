import { Box, HStack, Heading, Button, Spacer } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ColorModeButton } from './ui/color-mode';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box px={6} py={3} borderBottomWidth="1px" borderColor="gray.200">
      <HStack>
        <Heading size="md" cursor="pointer" onClick={() => navigate('/')}>
          CustomInventory
        </Heading>
        <Spacer />
        <ColorModeButton />
        {isAdmin && (
          <Button size="sm" variant="ghost" colorPalette="red" onClick={() => navigate('/admin')}>
            Админка
          </Button>
        )}
        {isAuthenticated
          ? <Button size="sm" variant="ghost" onClick={logout}>Выйти</Button>
          : <Button size="sm" colorPalette="blue" onClick={() => navigate('/login')}>Войти</Button>
        }
      </HStack>
    </Box>
  );
}