import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Button, Flex, Heading, Input, Text, Stack, VStack,
  HStack, SimpleGrid, Image, Center
} from '@chakra-ui/react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
}

interface Inventory {
  id: string;
  title: string;
  description: string;
  categoryId?: number;
  isPublic: boolean;
  imageUrl?: string;
  createdAt?: string;
  creatorId?: string;
  creatorName?: string;
}

interface CurrentUser {
  id: string;
  userName: string;
  email: string;
}

type SortKey = 'title' | 'createdAt' | 'category' | 'visibility';
type PageMode = 'home' | 'profile';

const API = 'https://custom-inventory.onrender.com';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getAuthHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Декодирование токена на клиенте без внешних библиотек
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn("Не удалось декодировать JWT локально:", e);
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // UI state
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [page, setPage] = useState<PageMode>('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Data state
const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const decoded = parseJwt(savedToken);
      if (decoded) {
        const email = decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "";
        const userName = decoded.userName || decoded.username || decoded.name || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || email.split('@')[0] || "User";
        const id = decoded.id || decoded.sub || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || "";
        return { id, userName, email };
      }
    }
    return null;
  });  const [categories, setCategories] = useState<Category[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [myInventories, setMyInventories] = useState<Inventory[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('');

  // Form state (Shared for Create & Edit)
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formCreating, setFormCreating] = useState(false);

  // Theme toggle
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  // 1. ПЕРЕХВАТ ТОКЕНА ИЗ URL (ПОСЛЕ REDIRECT С OAUTH)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let tokenFromUrl = params.get('token');

    // На случай, если бэкенд возвращает токен через хэш (#token=...)
    if (!tokenFromUrl && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      tokenFromUrl = hashParams.get('token');
    }

    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      // Очищаем адресную строку браузера от токена для безопасности
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload(); 
    }
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 2. ЗАГРУЗКА И СИНХРОНИЗАЦИЯ ПРОФИЛЯ С ЗАЩИТОЙ ОТ 404
   useEffect(() => {
    if (!token) return;

    fetch(`${API}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => {
        if (r.ok) return r.json();
        if (r.status === 404) {
          return fetch(`${API}/api/users/me`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.ok ? res.json() : null);
        }
        return null;
      })
      .then(data => {
        if (data) setCurrentUser(data);
      })
      .catch((err) => {
        console.warn("Не удалось синхронизировать профиль с сервером:", err);
      });
  }, [token]);

  // Load categories
  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then(r => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Fetch lists helpers
   const fetchInventories = useCallback(() => {
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    fetch(`${API}/api/inventory`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(setInventories)
      .catch(() => {});
  }, [token]);

  const fetchMyInventories = useCallback(() => {
    if (!token || !currentUser) return;
    fetch(`${API}/api/inventory/my`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => {
        // Если токен устарел или недействителен, бэкенд вернет 401 [3]
        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.reload();
        }
        return r.ok ? r.json() : [];
      })
      .then(setMyInventories)
      .catch(() => {});
  }, [token, currentUser]);

  // Load public/all inventories
  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  useEffect(() => {
    fetchMyInventories();
  }, [fetchMyInventories]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUserMenuOpen(false);
    window.location.reload();
  };

  // Opens Create modal
  const handleOpenCreate = () => {
    setEditingInventory(null);
    setFormTitle('');
    setFormDesc('');
    setFormCategoryId('');
    setFormImageUrl('');
    setFormIsPublic(true);
    setIsCreateOpen(true);
  };

  // Opens Edit modal
  const handleOpenEdit = (e: React.MouseEvent, inv: Inventory) => {
    e.preventDefault(); 
    setEditingInventory(inv);
    setFormTitle(inv.title || '');
    setFormDesc(inv.description || '');
    setFormCategoryId(inv.categoryId ? String(inv.categoryId) : '');
    setFormImageUrl(inv.imageUrl || '');
    setFormIsPublic(inv.isPublic);
    setIsCreateOpen(true);
  };

  // Delete inventory
  const handleDeleteInventory = async (e: React.MouseEvent, invId: string) => {
    e.preventDefault();
    if (!token) return;
    if (!window.confirm("Вы уверены, что хотите удалить этот каталог?")) return;

    try {
      const res = await fetch(`${API}/api/inventory/${invId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      fetchInventories();
      fetchMyInventories();
    } catch {
      alert('Не удалось удалить инвентарь.');
    }
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Ошибка: Не настроены переменные окружения Cloudinary в .env");
      setIsUploadingImage(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Не удалось загрузить изображение в облако.");
      }

      const data = await response.json();
      setFormImageUrl(data.secure_url); 
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      alert("Произошла ошибка при загрузке изображения на сервер.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Handler (Create & Update)
  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormCreating(true);

    const payload = {
      title: formTitle,
      description: formDesc,
      categoryId: formCategoryId ? Number(formCategoryId) : null,
      isPublic: formIsPublic,
      imageUrl: formImageUrl || undefined,
      tags: []
    };

    try {
      const url = editingInventory 
        ? `${API}/api/inventory/${editingInventory.id}`
        : `${API}/api/inventory`;
        
      const method = editingInventory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      const saved = await res.json();
      
      setIsCreateOpen(false);
      setFormTitle(''); setFormDesc(''); setFormCategoryId(''); setFormImageUrl(''); setFormIsPublic(true);
      
      fetchInventories();
      fetchMyInventories();

      if (!editingInventory && saved?.id) {
        navigate(`/inventory/${saved.id}`);
      }
    } catch {
      alert('Не удалось сохранить изменения.');
    } finally {
      setFormCreating(false);
    }
  };

  // ─── Filtering & sorting ───────────────────────────────────────────────────

  const sourceList = page === 'profile' ? myInventories : inventories;

  const visibleInventories = sourceList
    .filter(inv => {
      // На главной: только публичные + собственные приватные
      if (page === 'home' && !inv.isPublic && inv.creatorId !== currentUser?.id) return false;
      // Поиск
      const q = searchQuery.toLowerCase();
      if (q && !inv.title?.toLowerCase().includes(q) && !inv.description?.toLowerCase().includes(q)) return false;
      // Фильтр по категории
      if (filterCategory && String(inv.categoryId) !== filterCategory) return false;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'title') cmp = (a.title || '').localeCompare(b.title || '');
      else if (sortKey === 'createdAt') cmp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      else if (sortKey === 'category') cmp = (a.categoryId || 0) - (b.categoryId || 0);
      else if (sortKey === 'visibility') cmp = Number(b.isPublic) - Number(a.isPublic);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const handleSortChange = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ─── Theme tokens ──────────────────────────────────────────────────────────

  const bg        = isDark ? '#0f1117' : '#f4f6f9';
  const surface   = isDark ? '#1a1d27' : '#ffffff';
  const border    = isDark ? '#2a2d3a' : '#e2e8f0';
  const text      = isDark ? '#e8eaf0' : '#1a202c';
  const muted     = isDark ? '#6b7280' : '#718096';
  const accent    = '#4f7eff';
  const accentHov = '#3a63d4';

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: '8px',
    border: `1px solid ${border}`, background: isDark ? '#252836' : '#f7fafc',
    color: text, fontSize: '14px', outline: 'none',
  } as React.CSSProperties;

  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Box minH="100vh" bg={bg} color={text} style={{ transition: 'background 0.2s, color 0.2s' }}>

      {/* ── HEADER ── */}
      <Box
        as="header"
        position="sticky" top={0} zIndex={100}
        bg={surface} borderBottom={`1px solid ${border}`}
        px={{ base: 4, md: 8 }} py={3}
        style={{ backdropFilter: 'blur(12px)', boxShadow: '0 1px 12px rgba(0,0,0,0.08)' }}
      >
        <Flex align="center" justify="space-between" gap={4} maxW="1400px" mx="auto" wrap="wrap">

          {/* Logo + nav */}
          <HStack gap={6}>
            <Heading
              size="sm"
              style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px', cursor: 'pointer', color: accent }}
              onClick={() => setPage('home')}
            >
              CustomInventory
            </Heading>
          </HStack>

          {/* Search */}
          <Input
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxW="320px"
            size="sm"
            bg={isDark ? '#252836' : '#f7fafc'}
            border={`1px solid ${border}`}
            color={text}
            _placeholder={{ color: muted }}
            borderRadius="8px"
          />

          {/* Right side */}
          <HStack gap={3}>
            {/* Theme toggle */}
            <Button onClick={toggleTheme} size="sm" variant="ghost" color={muted} px={2}>
              {isDark ? '☀️' : '🌙'}
            </Button>

            {currentUser ? (
              /* ── User menu dropdown ── */
              <Box position="relative" ref={userMenuRef}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 12px', borderRadius: '8px',
                    border: `1px solid ${border}`,
                    background: userMenuOpen ? (isDark ? '#252836' : '#f0f4ff') : 'transparent',
                    color: text, cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                  }}
                >
                  <Box
                    w="28px" h="28px" borderRadius="full"
                    bg={accent} color="white"
                    display="flex" alignItems="center" justifyContent="center"
                    fontSize="12px" fontWeight="bold" flexShrink={0}
                  >
                    {(currentUser.userName || currentUser.email || '?')[0].toUpperCase()}
                  </Box>
                  <Text maxW="140px" overflow="hidden" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {currentUser.email || currentUser.userName}
                  </Text>
                  <Text color={muted} fontSize="10px">{userMenuOpen ? '▲' : '▼'}</Text>
                </Button>

                {userMenuOpen && (
                  <Box
                    position="absolute" top="calc(100% + 8px)" right={0}
                    w="220px" bg={surface} border={`1px solid ${border}`}
                    borderRadius="12px" overflow="hidden"
                    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 200 }}
                  >
                    <Box px={4} py={3} borderBottom={`1px solid ${border}`}>
                      <Text fontSize="xs" color={muted} mb={1}>Вы вошли как</Text>
                      <Text fontSize="sm" fontWeight="bold" style={{ wordBreak: 'break-all' }}>
                        {currentUser.email}
                      </Text>
                    </Box>
                    <Box
                      px={4} py={3}
                      style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
                      _hover={{ bg: isDark ? '#252836' : '#f7fafc' }}
                      onClick={() => { setPage('profile'); setUserMenuOpen(false); }}
                    >
                      👤 Мои инвентари
                    </Box>
                    <Box
                      px={4} py={3}
                      style={{ cursor: 'pointer', fontSize: '14px', color: '#e53e3e', fontWeight: 500 }}
                      _hover={{ bg: isDark ? '#2a1a1a' : '#fff5f5' }}
                      onClick={handleLogout}
                    >
                      🚪 Выйти
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsLoginOpen(true)}
                style={{ background: accent, color: 'white', borderRadius: '8px', fontWeight: 600, padding: '6px 16px' }}
                _hover={{ background: accentHov }}
              >
                Войти
              </Button>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* ── MAIN CONTENT ── */}
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 8 }} py={8}>

        {/* Page title */}
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" mb={1}>
              {page === 'profile' ? '📦 Мои инвентари' : '🗂 Все каталоги'}
            </Heading>
            <Text fontSize="sm" color={muted}>
              {visibleInventories.length} {visibleInventories.length === 1 ? 'запись' : 'записей'}
            </Text>
          </Box>

          {/* Filters & sort bar */}
          <HStack gap={3} wrap="wrap">
            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ ...selectStyle, width: '160px' }}
            >
              <option value="">Все категории</option>
              {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>

            {/* Sort */}
            <HStack gap={1}>
              {(['title', 'createdAt', 'category', 'visibility'] as SortKey[]).map(key => {
                const labels: Record<SortKey, string> = {
                  title: 'A–Z', createdAt: 'Дата', category: 'Категория', visibility: 'Доступ'
                };
                const active = sortKey === key;
                return (
                  <Button
                    key={key}
                    size="xs"
                    onClick={() => handleSortChange(key)}
                    style={{
                      background: active ? accent : 'transparent',
                      color: active ? 'white' : muted,
                      border: `1px solid ${active ? accent : border}`,
                      borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                    }}
                  >
                    {labels[key]}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                  </Button>
                );
              })}
            </HStack>

            {currentUser && (
              <Button
                size="sm"
                onClick={handleOpenCreate}
                style={{ background: '#38a169', color: 'white', borderRadius: '8px', fontWeight: 600 }}
              >
                + Создать
              </Button>
            )}
          </HStack>
        </Flex>

        {/* ── INVENTORY GRID ── */}
        {visibleInventories.length === 0 ? (
          <Center py={20}>
            <VStack gap={3}>
              <Text fontSize="4xl">📭</Text>
              <Text color={muted} fontSize="lg">
                {page === 'profile' ? 'У вас пока нет инвентарей.' : 'Ничего не найдено.'}
              </Text>
              {page === 'profile' && currentUser && (
                <Button
                  size="sm"
                  onClick={handleOpenCreate}
                  style={{ background: accent, color: 'white', borderRadius: '8px', marginTop: '8px' }}
                >
                  Создать первый инвентарь
                </Button>
              )}
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} gap={5}>
            {visibleInventories.map((inv) => {
              const catName = categories.find(c => c.id === inv.categoryId)?.name;
              const isOwn = inv.creatorId === currentUser?.id;

              return (
                <Link key={inv.id} to={`/inventory/${inv.id}`} style={{ textDecoration: 'none' }}>
                  <Box
                    bg={surface}
                    border={`1px solid ${border}`}
                    borderRadius="16px"
                    overflow="hidden"
                    style={{
                      transition: 'transform 0.18s, box-shadow 0.18s',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                    _hover={{
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    }}
                  >
                    {/* Cover image */}
                    <Box h="140px" bg={isDark ? '#252836' : '#edf2f7'} position="relative" overflow="hidden">
                      {inv.imageUrl ? (
                        <Image
                          src={inv.imageUrl}
                          alt={inv.title}
                          w="100%" h="100%"
                          objectFit="cover"
                          style={{ transition: 'transform 0.3s' }}
                        />
                      ) : (
                        <Center h="100%" color={muted} fontSize="40px">
                          📦
                        </Center>
                      )}
                      {/* Badges overlay */}
                      <Flex position="absolute" top={2} left={2} right={2} justify="space-between" align="flex-start">
                        {catName && (
                          <Box
                            px={2} py={1} borderRadius="6px" fontSize="11px" fontWeight={700}
                            style={{ background: 'rgba(0,0,0,0.55)', color: 'white', backdropFilter: 'blur(4px)' }}
                          >
                            {catName}
                          </Box>
                        )}
                        <Box
                          px={2} py={1} borderRadius="6px" fontSize="11px" fontWeight={700}
                          style={{
                            background: inv.isPublic ? 'rgba(56,161,105,0.85)' : 'rgba(229,62,62,0.85)',
                            color: 'white', backdropFilter: 'blur(4px)', marginLeft: 'auto'
                          }}
                        >
                          {inv.isPublic ? '🌐' : '🔒'}
                        </Box>
                      </Flex>
                    </Box>

                    {/* Card body */}
                    <Box p={4} flex={1} display="flex" flexDirection="column" gap="6px">
                      
                      {/* Ограничиваем контейнер заголовка до 2 строк */}
                      <Box minH="44px">
                        <Text 
                          fontWeight={700} 
                          fontSize="15px" 
                          color={text}
                          style={{ 
                            overflow: 'hidden', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 2, 
                            WebkitBoxOrient: 'vertical' 
                          }}
                        >
                          {inv.title}
                        </Text>
                      </Box>

                      {/* Ограничиваем контейнер описания до 2 строк */}
                      <Box minH="36px">
                        <Text 
                          fontSize="12px" 
                          color={muted}
                          style={{ 
                            overflow: 'hidden', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 2, 
                            WebkitBoxOrient: 'vertical' 
                          }}
                        >
                          {inv.description || '—'}
                        </Text>
                      </Box>

                      {/* Footer meta */}
                      <Flex justify="space-between" align="center" mt="auto" pt={2}
                        borderTop={`1px solid ${border}`} fontSize="11px" color={muted}>
                        <Text>{formatDate(inv.createdAt)}</Text>
                        <Text style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {isOwn ? '👤 Вы' : (inv.creatorName || inv.creatorId?.slice(0, 8) || '—')}
                        </Text>
                      </Flex>

                      {/* Управление для владельца в режиме Профиля */}
                      {page === 'profile' && isOwn && (
                        <HStack justify="stretch" mt={3} pt={2} borderTop={`1px dashed ${border}`} gap={2}>
                          <Button 
                            size="xs" 
                            colorScheme="orange" 
                            variant="outline" 
                            flex={1}
                            onClick={(e) => handleOpenEdit(e, inv)}
                          >
                            Изменить
                          </Button>
                          <Button 
                            size="xs" 
                            colorScheme="red" 
                            variant="outline" 
                            flex={1}
                            onClick={(e) => handleDeleteInventory(e, inv.id)}
                          >
                            Удалить
                          </Button>
                        </HStack>
                      )}
                    </Box>
                  </Box>
                </Link>
              );
            })}
          </SimpleGrid>
        )}
      </Box>

      {/* ── MODAL: LOGIN ── */}
      {isLoginOpen && (
        <ModalOverlay onClose={() => setIsLoginOpen(false)}>
          <Box bg={surface} color={text} p={8} borderRadius="20px" w="380px"
            border={`1px solid ${border}`} position="relative"
            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <CloseBtn onClick={() => setIsLoginOpen(false)} />
            <Heading size="md" mb={2} textAlign="center">Вход в систему</Heading>
            <Text fontSize="sm" color={muted} mb={6} textAlign="center">Выберите способ авторизации</Text>
            <VStack gap={3}>
              <a
                href={`${API}/api/auth/signin-github`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: '44px', background: isDark ? '#2d3748' : '#1a202c',
                  color: 'white', borderRadius: '10px', fontWeight: 600, textDecoration: 'none', fontSize: '14px', gap: '8px'
                }}
              >
                🐙 Войти через GitHub
              </a>
              <a
                href={`${API}/api/auth/signin-google`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: '44px', background: '#e53e3e',
                  color: 'white', borderRadius: '10px', fontWeight: 600, textDecoration: 'none', fontSize: '14px', gap: '8px'
                }}
              >
                🔴 Войти через Google
              </a>
              <Button variant="ghost" size="sm" color={muted} mt={2} onClick={() => setIsLoginOpen(false)}>
                Отмена
              </Button>
            </VStack>
          </Box>
        </ModalOverlay>
      )}

      {/* ── MODAL: CREATE / EDIT INVENTORY ── */}
      {isCreateOpen && (
        <ModalOverlay onClose={() => setIsCreateOpen(false)}>
          <Box bg={surface} color={text} p={6} borderRadius="20px" w="460px" maxH="92vh"
            overflowY="auto" border={`1px solid ${border}`} position="relative"
            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <CloseBtn onClick={() => setIsCreateOpen(false)} />
            <Heading size="md" mb={6}>
              {editingInventory ? 'Редактирование каталога' : 'Создание инвентаря'}
            </Heading>

            <form onSubmit={handleSaveInventory}>
              <Stack gap={4}>
                <FieldBlock label="Название *">
                  <input required style={inputStyle} value={formTitle} placeholder="Например: Склад БГУИР"
                    onChange={(e) => setFormTitle(e.target.value)} />
                </FieldBlock>

                <FieldBlock label="Описание">
                  <textarea
                    rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                    value={formDesc} placeholder="Краткое описание..."
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </FieldBlock>

                <FieldBlock label="Категория *">
                  <select 
                    required 
                    style={selectStyle} 
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                  >
                    <option value="" disabled hidden>Выберите категорию...</option>
                    {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                  </select>
                </FieldBlock>

                <FieldBlock label="Изображение обложки">
                  <label style={{ display: 'block', width: '100%' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      disabled={isUploadingImage} // Блокируем выбор нового файла во время загрузки
                      onChange={handleFileChange} // Вызываем функцию отправки в Cloudinary [1]
                    />
                    <Button 
                      as="span" 
                      colorScheme={isUploadingImage ? "gray" : "blue"} 
                      bg={isUploadingImage ? "gray.500" : "blue.600"} 
                      color="white" 
                      _hover={{ bg: isUploadingImage ? "gray.500" : "blue.700" }}
                      w="full" 
                      cursor={isUploadingImage ? "not-allowed" : "pointer"} 
                      h="40px" 
                      borderRadius="md" 
                      boxShadow="sm"
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center" 
                      fontSize="14px" 
                      fontWeight="600"
                    >
                      {isUploadingImage ? "Загрузка в облако..." : "Выбрать файл обложки"}
                    </Button>
                  </label>
                  {formImageUrl && (
                    <Center mt={3}>
                      <Image src={formImageUrl} alt="Preview" maxH="120px" borderRadius="md" objectFit="cover" />
                    </Center>
                  )}
                </FieldBlock>

                {/* Privacy */}
                <Box border={`1px solid ${border}`} p={4} borderRadius="12px">
                  <Text fontSize="13px" fontWeight={700} mb={3} color={muted} textTransform="uppercase" letterSpacing="0.05em">
                    Доступ
                  </Text>
                  <VStack align="start" gap={3}>
                    {[
                      { val: true, icon: '🌐', label: 'Публичный', sub: 'Виден всем пользователям' },
                      { val: false, icon: '🔒', label: 'Приватный', sub: 'Только для вас' },
                    ].map(opt => (
                      <label key={String(opt.val)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', width: '100%' }}>
                        <input type="radio" name="privacy" checked={formIsPublic === opt.val}
                          onChange={() => setFormIsPublic(opt.val)} />
                        <Box>
                          <Text fontSize="14px" fontWeight={600}>{opt.icon} {opt.label}</Text>
                          <Text fontSize="12px" color={muted}>{opt.sub}</Text>
                        </Box>
                      </label>
                    ))}
                  </VStack>
                </Box>

                <Flex justify="flex-end" gap={3} pt={2}>
                  <Button variant="ghost" size="sm" color={muted} type="button"
                    onClick={() => setIsCreateOpen(false)}>
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={formCreating}
                    style={{ background: '#38a169', color: 'white', borderRadius: '8px', fontWeight: 600, padding: '8px 20px' }}
                  >
                    {formCreating ? 'Сохранение...' : (editingInventory ? 'Сохранить изменения' : 'Создать')}
                  </Button>
                </Flex>
              </Stack>
            </form>
          </Box>
        </ModalOverlay>
      )}
    </Box>
  );
}

// ─── Small helper components ──────────────────────────────────────────────────

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <Box
      position="fixed" inset={0} zIndex={1000}
      bg="rgba(0,0,0,0.55)"
      display="flex" alignItems="center" justifyContent="center"
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </Box>
  );
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute', top: '14px', right: '14px',
        background: 'none', border: 'none', fontSize: '18px',
        cursor: 'pointer', color: '#718096', lineHeight: 1,
        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '6px',
      }}
    >×</button>
  );
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text fontSize="13px" fontWeight={700} mb={1} style={{ letterSpacing: '0.02em' }}>{label}</Text>
      {children}
    </Box>
  );
}
