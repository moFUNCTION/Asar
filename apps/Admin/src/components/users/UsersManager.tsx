import React, { useState, useEffect } from "react";
import { Box, Flex, HStack, VStack, Text, Button, Badge, SimpleGrid } from "@chakra-ui/react";
import { useAppwrite, ASAR_DATABASE_ID, ASAR_COLLECTIONS, type AsarUserProfile, parseUserProfile } from "@repo/react-appwrite";

export interface UsersManagerProps {
  onRefresh?: () => void;
}

const DEMO_USERS: AsarUserProfile[] = [
  {
    $id: "usr-doc-1",
    userId: "usr-admin-primary",
    name: "مدير النظام الرئيسي",
    email: "admin@asar.audio",
    role: "admin",
    phone: "+20 100 000 0001",
    organization: "إدارة منصة أثر",
    locale: "ar",
    $createdAt: "2026-06-01T10:00:00Z",
  },
  {
    $id: "usr-doc-2",
    userId: "usr-mina-maryam",
    name: "مينا ومريم (Mina & Maryam)",
    email: "mina.maryam@wedding.example.com",
    role: "client",
    phone: "+20 100 248 9912",
    organization: "حفل زفاف الإسكندرية",
    locale: "ar",
    $createdAt: "2026-07-01T10:15:00Z",
  },
  {
    $id: "usr-doc-3",
    userId: "usr-omar-layla",
    name: "عمر وليلى (Omar & Layla)",
    email: "omar.layla@example.com",
    role: "client",
    phone: "+20 122 345 6789",
    organization: "عقد قران فور سيزونز",
    locale: "ar",
    $createdAt: "2026-06-25T09:00:00Z",
  },
  {
    $id: "usr-doc-4",
    userId: "usr-sherif-hania",
    name: "شريف وهانيا (Sherif & Hania)",
    email: "sherif.hania@example.com",
    role: "client",
    phone: "+20 111 872 3410",
    organization: "زفاف فندق ماريوت مينا هاوس",
    locale: "ar",
    $createdAt: "2026-07-02T14:30:00Z",
  },
];

export const UsersManager: React.FC<UsersManagerProps> = () => {
  const { databases } = useAppwrite();
  const [users, setUsers] = useState<AsarUserProfile[]>(DEMO_USERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "client">("all");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Fetch users from Appwrite Database
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      if (databases) {
        const response = await databases.listDocuments(ASAR_DATABASE_ID, ASAR_COLLECTIONS.USERS);
        if (response.documents.length > 0) {
          const parsed = response.documents.map((d) => parseUserProfile(d)).filter((p): p is AsarUserProfile => p !== null);
          setUsers(parsed);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Using fallback demo users:", e);
    }
    setUsers(DEMO_USERS);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (user: AsarUserProfile) => {
    const newRole = user.role === "admin" ? "client" : "admin";
    try {
      if (databases && user.$id) {
        await databases.updateDocument(ASAR_DATABASE_ID, ASAR_COLLECTIONS.USERS, user.$id, {
          role: newRole,
        });
      }
      setUsers((prev) =>
        prev.map((u) => (u.userId === user.userId ? { ...u, role: newRole } : u))
      );
      showNotice(
        newRole === "admin"
          ? `✦ تم ترقية "${user.name}" إلى مسؤول في النظام بنجاح.`
          : `✓ تم تعديل رتبة "${user.name}" إلى عميل.`
      );
    } catch (e: any) {
      showNotice(`تعذر تحديث الصلاحية: ${e?.message || "خطأ غير معروف"}`);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchOrg = u.organization?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchOrg) return false;
    }
    return true;
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const clientCount = users.filter((u) => u.role === "client").length;

  return (
    <Box className="animate-fade-in" dir="rtl">
      {/* Toast Notification */}
      {actionNotice && (
        <Box
          position="fixed"
          top={20}
          left={6}
          zIndex={9999}
          bg="var(--athar-maroon)"
          color="#ffffff"
          px={5}
          py={3}
          borderRadius="14px"
          boxShadow="var(--athar-shadow-elevated)"
          border="1px solid var(--athar-gold)"
        >
          <Text fontWeight="800" fontSize="0.92rem">
            {actionNotice}
          </Text>
        </Box>
      )}

      {/* Header & Stats Banner */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={6}>
        <Box>
          <HStack gap={2} mb={1}>
            <Text fontSize="1.6rem" fontWeight="900" color="var(--athar-maroon)" fontFamily="var(--font-arabic-display)">
              دليل المستخدمين والحسابات
            </Text>
            <Badge
              bg="rgba(107, 29, 40, 0.08)"
              color="var(--athar-maroon)"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="0.82rem"
              fontWeight="800"
            >
              {users.length} مستخدم مسجل
            </Badge>
          </HStack>
          <Text fontSize="0.88rem" color="var(--athar-text-muted)">
            إدارة حسابات أصحاب الحفلات، الصلاحيات، وسجلات الدخول المرتبطة بقاعدة بيانات أثر (Appwrite Users).
          </Text>
        </Box>

        <HStack gap={3}>
          <Box px={4} py={2} bg="#ffffff" borderRadius="12px" border="1px solid var(--athar-card-border)">
            <Text fontSize="0.75rem" color="var(--athar-text-muted)">المدراء</Text>
            <Text fontSize="1.1rem" fontWeight="800" color="var(--athar-maroon)">{adminCount}</Text>
          </Box>
          <Box px={4} py={2} bg="#ffffff" borderRadius="12px" border="1px solid var(--athar-card-border)">
            <Text fontSize="0.75rem" color="var(--athar-text-muted)">العملاء</Text>
            <Text fontSize="1.1rem" fontWeight="800" color="#8C6F12">{clientCount}</Text>
          </Box>
          <Button
            onClick={fetchUsers}
            disabled={isLoading}
            className="btn-athar-secondary"
            fontSize="0.85rem"
            px={4}
            py={2}
          >
            {isLoading ? "جاري التحديث..." : "تحديث القائمة ⟳"}
          </Button>
        </HStack>
      </Flex>

      {/* Filters and Search Bar */}
      <Box className="athar-card" bg="#ffffff" p={4} mb={6}>
        <Flex gap={3} wrap="wrap" align="center" justify="space-between">
          <Box flex="1" minW="260px">
            <input
              type="text"
              placeholder="ابحث بالاسم، البريد الإلكتروني، رقم الهاتف، أو اسم الحفل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 1rem",
                borderRadius: "10px",
                border: "1px solid rgba(107, 29, 40, 0.16)",
                fontSize: "0.88rem",
                fontFamily: "inherit",
                backgroundColor: "var(--athar-bg-primary)",
                color: "var(--athar-text-title)",
                outline: "none",
              }}
            />
          </Box>

          <HStack gap={2}>
            {(
              [
                { id: "all", label: "جميع الحسابات" },
                { id: "client", label: "العملاء فقط" },
                { id: "admin", label: "المدراء فقط" },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setRoleFilter(filter.id)}
                style={{
                  padding: "0.55rem 1rem",
                  borderRadius: "9999px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.2s ease",
                  backgroundColor:
                    roleFilter === filter.id ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.05)",
                  color: roleFilter === filter.id ? "#ffffff" : "var(--athar-text-body)",
                }}
              >
                {filter.label}
              </button>
            ))}
          </HStack>
        </Flex>
      </Box>

      {/* User Cards Grid */}
      {filteredUsers.length === 0 ? (
        <Box textAlign="center" py={16} className="athar-card" bg="#ffffff">
          <Text fontSize="2.5rem" mb={2}>🔍</Text>
          <Text fontSize="1.1rem" fontWeight="800" color="var(--athar-maroon)" mb={1}>
            لم يتم العثور على مستخدمين
          </Text>
          <Text fontSize="0.88rem" color="var(--athar-text-muted)">
            جرب تعديل كلمات البحث أو الفلاتر لعرض الحسابات.
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
          {filteredUsers.map((user) => {
            const isAdmin = user.role === "admin";
            const initials = user.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("");

            return (
              <Box
                key={user.userId || user.$id}
                className="athar-card"
                bg="#ffffff"
                p={5}
                position="relative"
                border="1px solid"
                borderColor={isAdmin ? "rgba(212, 175, 55, 0.4)" : "var(--athar-card-border)"}
                boxShadow={isAdmin ? "0 4px 18px rgba(212, 175, 55, 0.12)" : "var(--athar-shadow-soft)"}
              >
                <Flex justify="space-between" align="start" mb={4}>
                  <HStack gap={3}>
                    <Box
                      w="44px"
                      h="44px"
                      borderRadius="full"
                      bg={isAdmin ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.08)"}
                      color={isAdmin ? "#ffffff" : "var(--athar-maroon)"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="900"
                      fontSize="0.95rem"
                      fontFamily="var(--font-arabic-display)"
                      border="1px solid"
                      borderColor={isAdmin ? "var(--athar-gold)" : "transparent"}
                    >
                      {initials || "أ"}
                    </Box>
                    <Box>
                      <Text fontWeight="800" fontSize="1rem" color="var(--athar-text-title)">
                        {user.name}
                      </Text>
                      <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                        {user.email}
                      </Text>
                    </Box>
                  </HStack>

                  <Badge
                    bg={isAdmin ? "rgba(212, 175, 55, 0.16)" : "rgba(107, 29, 40, 0.06)"}
                    color={isAdmin ? "#8C6F12" : "var(--athar-maroon)"}
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    fontSize="0.72rem"
                    fontWeight="800"
                    border="1px solid"
                    borderColor={isAdmin ? "rgba(212, 175, 55, 0.4)" : "rgba(107, 29, 40, 0.1)"}
                  >
                    {isAdmin ? "✦ مسؤول نظام" : "عميل أثر"}
                  </Badge>
                </Flex>

                <VStack align="stretch" gap={2} fontSize="0.82rem" color="var(--athar-text-body)" mb={4}>
                  {user.phone && (
                    <HStack justify="space-between">
                      <Text color="var(--athar-text-muted)">الهاتف / واتساب:</Text>
                      <Text fontWeight="700" dir="ltr">{user.phone}</Text>
                    </HStack>
                  )}
                  {user.organization && (
                    <HStack justify="space-between">
                      <Text color="var(--athar-text-muted)">الجهة / الحفل:</Text>
                      <Text fontWeight="700">{user.organization}</Text>
                    </HStack>
                  )}
                  <HStack justify="space-between">
                    <Text color="var(--athar-text-muted)">تاريخ التسجيل:</Text>
                    <Text fontWeight="600">
                      {user.$createdAt ? new Date(user.$createdAt).toLocaleDateString("ar-EG") : "حساب معتمد"}
                    </Text>
                  </HStack>
                </VStack>

                <Box pt={3} borderTop="1px solid rgba(107, 29, 40, 0.06)">
                  <Button
                    onClick={() => handleToggleRole(user)}
                    variant="ghost"
                    size="sm"
                    width="100%"
                    fontSize="0.78rem"
                    fontWeight="800"
                    color={isAdmin ? "var(--athar-text-muted)" : "var(--athar-maroon)"}
                    _hover={{ bg: "rgba(107, 29, 40, 0.05)" }}
                  >
                    {isAdmin ? "تحويل إلى عميل عادي ↓" : "ترقية إلى مسؤول نظام ✦"}
                  </Button>
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
};

