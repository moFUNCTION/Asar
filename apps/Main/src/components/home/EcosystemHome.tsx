import React, { useState } from "react";
import { Box, Flex, SimpleGrid, Text, Button, Badge } from "@chakra-ui/react";

export interface EcosystemHomeProps {
  onOpenAccount: (defaultTab?: string) => void;
  onOpenAuth: () => void;
  currentUser?: { name?: string; email?: string } | null;
  onLogout?: () => void;
}

export const EcosystemHome: React.FC<EcosystemHomeProps> = ({
  onOpenAccount,
  onOpenAuth,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (tab?: string) => {
    setMobileMenuOpen(false);
    onOpenAccount(tab);
  };
  return (
    <Box minH="100vh" pb={16}>
      {/* Top Luxury Navigation */}
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={50}
        bg="rgba(251, 247, 242, 0.92)"
        backdropFilter="blur(16px)"
        borderBottom="1px solid rgba(107, 29, 40, 0.1)"
        py={3.5}
        px={{ base: 4, md: 8 }}
      >
        <Flex
          maxW="1320px"
          mx="auto"
          align="center"
          justify="space-between"
          gap={4}
          wrap="wrap"
        >
          {/* Brand Logo & Name */}
          <Flex align="center" gap={3}>
            <Box
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="var(--athar-maroon)"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="1.35rem"
              fontWeight="900"
              boxShadow="0 4px 14px rgba(107, 29, 40, 0.28)"
              className="font-arabic-display"
              border="1px solid var(--athar-gold-border)"
            >
              أثر
            </Box>
            <Box>
              <Text
                fontSize="1.25rem"
                fontWeight="800"
                color="var(--athar-text-title)"
                lineHeight="1.2"
                className="font-arabic-display"
              >
                أثر • ASAR
              </Text>
              <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                منظومة توثيق الذكريات والضيافة الرقمية الفاخرة
              </Text>
            </Box>
          </Flex>

          {/* Desktop Navigation Shortcuts */}
          <Flex align="center" gap={2} display={{ base: "none", md: "flex" }}>
            <Button
              className="btn-athar-secondary"
              onClick={() => onOpenAccount("orders")}
              fontSize="0.88rem"
              px={4}
              py={2}
            >
              👤 متابعة الطلبات
            </Button>
            <Button
              className="btn-athar-secondary"
              onClick={() => onOpenAccount("assets")}
              fontSize="0.88rem"
              px={4}
              py={2}
            >
              📦 تسليم المواد
            </Button>
            <Button
              className="btn-athar-secondary"
              onClick={() => onOpenAccount("mailbox")}
              fontSize="0.88rem"
              px={4}
              py={2}
            >
              ✉️ بريد الردود (RSVP)
            </Button>
            <Button
              className="btn-athar-secondary"
              onClick={() => onOpenAccount("qr_hub")}
              fontSize="0.88rem"
              px={4}
              py={2}
            >
              🖨️ مركز QR
            </Button>

            {/* Auth Button */}
            {currentUser ? (
              <Flex align="center" gap={2}>
                <Badge
                  className="badge-emerald"
                  px={3}
                  py={1.5}
                  fontSize="0.82rem"
                >
                  {currentUser.name || currentUser.email || "عميل أثر"}
                </Badge>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  fontSize="0.82rem"
                  color="var(--athar-text-muted)"
                  _hover={{ color: "var(--athar-maroon)" }}
                  cursor="pointer"
                  bg="transparent"
                  border="none"
                >
                  خروج
                </Button>
              </Flex>
            ) : (
              <Button
                className="btn-athar-primary"
                onClick={onOpenAuth}
                fontSize="0.88rem"
                px={5}
                py={2}
              >
                دخول العميل ✦
              </Button>
            )}
          </Flex>

          {/* Mobile Menu Button */}
          <Flex align="center" gap={2} display={{ base: "flex", md: "none" }}>
            {currentUser ? (
              <Badge className="badge-emerald" fontSize="0.75rem" px={2} py={1}>
                {currentUser.name ? currentUser.name.split(" ")[0] : "عميل أثر"}
              </Badge>
            ) : (
              <Button
                className="btn-athar-primary"
                onClick={onOpenAuth}
                size="xs"
                fontSize="0.75rem"
                px={3}
              >
                دخول ✦
              </Button>
            )}
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="sm"
              variant="outline"
              borderColor="rgba(107, 29, 40, 0.2)"
              fontSize="0.8rem"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </Button>
          </Flex>
        </Flex>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <Box
            display={{ base: "block", md: "none" }}
            mt={3}
            pt={3}
            borderTop="1px solid rgba(107, 29, 40, 0.08)"
            bg="rgba(255, 255, 255, 0.98)"
            borderRadius="16px"
            p={4}
            boxShadow="var(--athar-shadow-elevated)"
          >
            <Flex direction="column" gap={2.5}>
              <Button
                className="btn-athar-secondary"
                w="100%"
                justifyContent="start"
                onClick={() => handleMobileNav("orders")}
                fontSize="0.88rem"
              >
                👤 متابعة الطلبات (7 مراحل)
              </Button>
              <Button
                className="btn-athar-secondary"
                w="100%"
                justifyContent="start"
                onClick={() => handleMobileNav("assets")}
                fontSize="0.88rem"
              >
                📦 تسليم المواد وصور الحفل
              </Button>
              <Button
                className="btn-athar-secondary"
                w="100%"
                justifyContent="start"
                onClick={() => handleMobileNav("mailbox")}
                fontSize="0.88rem"
              >
                ✉️ بريد ردود الضيوف (RSVP Mailbox)
              </Button>
              <Button
                className="btn-athar-secondary"
                w="100%"
                justifyContent="start"
                onClick={() => handleMobileNav("qr_hub")}
                fontSize="0.88rem"
              >
                🖨️ مركز بطاقات وبوسترات QR
              </Button>

              {currentUser && onLogout && (
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  variant="ghost"
                  color="var(--athar-maroon)"
                  fontSize="0.85rem"
                  fontWeight="700"
                  mt={2}
                >
                  تسجيل الخروج من الحساب
                </Button>
              )}
            </Flex>
          </Box>
        )}
        </Flex>
      </Box>

      {/* Hero Section */}
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} pt={{ base: 10, md: 16 }} pb={12} textAlign="center">
        <Badge
          className="badge-gold"
          mb={4}
          px={5}
          py={1.5}
          fontSize="0.88rem"
        >
          ✦ المنظومة المتكاملة للذكريات والفعاليات الفاخرة
        </Badge>

        <Text
          as="h1"
          fontSize={{ base: "2.4rem", md: "3.6rem" }}
          fontWeight="900"
          color="var(--athar-maroon)"
          lineHeight="1.18"
          mb={5}
          className="font-arabic-display"
        >
          أثر — حيث تلتقي فخامة الورق بحداثة التجربة الرقمية
        </Text>

        <Text
          fontSize={{ base: "1rem", md: "1.2rem" }}
          color="var(--athar-text-body)"
          maxW="820px"
          mx="auto"
          lineHeight="1.8"
          mb={8}
        >
          منصة تجارب راقية توفر خدمتين رئيسيتين: **كشك الهاتف الكلاسيكي (Athar Booth)** لتسجيل أصوات وتهاني الأحبة،
          و**مواقع الدعوات التفاعلية (Athar Invitation)** مع صندوق بريد حي لإدارة الحضور وتوليد تذاكر الدخول بالـ QR.
        </Text>

        <Flex justify="center" gap={4} wrap="wrap">
          <Button
            className="btn-athar-primary"
            onClick={() => onOpenAccount("orders")}
            fontSize="1rem"
            px={8}
            py={4}
          >
            👤 الدخول لبوابة العميل ومتابعة الطلب
          </Button>
          <Button
            className="btn-athar-gold"
            onClick={onOpenAuth}
            fontSize="1rem"
            px={7}
            py={4}
          >
            ✨ تسجيل الدخول كعميل تجريبي (1-Click Demo)
          </Button>
        </Flex>
      </Box>

      {/* Flagship Services Grid */}
      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }} mb={16}>
        <Flex align="center" justify="center" gap={3} mb={8}>
          <Box h="1px" w="60px" bg="linear-gradient(90deg, transparent, #D4AF37)" />
          <Text
            fontSize="1.35rem"
            fontWeight="800"
            color="var(--athar-maroon)"
            className="font-arabic-display"
          >
            خدمات أثر الفاخرة ومحطات المنظومة
          </Text>
          <Box h="1px" w="60px" bg="linear-gradient(90deg, #D4AF37, transparent)" />
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
          {/* Card 1: Athar Booth */}
          <Box
            className="card-luxury"
            p={7}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              right={0}
              w="120px"
              h="4px"
              bg="linear-gradient(90deg, var(--athar-maroon), var(--athar-gold))"
            />
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Badge className="badge-maroon">
                  🎙️ كشك أثر الصوتي
                </Badge>
                <Badge
                  bg="rgba(107, 29, 40, 0.08)"
                  color="var(--athar-maroon)"
                  px={2.5}
                  py={1}
                  borderRadius="md"
                  fontSize="0.75rem"
                  fontFamily="monospace"
                >
                  منفذ :3002
                </Badge>
              </Flex>

              <Text
                fontSize="1.45rem"
                fontWeight="800"
                color="var(--athar-text-title)"
                mb={2}
                className="font-arabic-display"
              >
                Athar Booth — Audio Guestbook
              </Text>

              <Text fontSize="0.92rem" color="var(--athar-text-body)" mb={5} lineHeight="1.7">
                هاتف دوار كلاسيكي عتيق يسجل تهاني ومشاعر الضيوف في حفلتك، يتبعه إنتاج صفحة ذكريات رقمية متكاملة تضم المشغل الصوتي ومعرض الصور ورسائل الشكر.
              </Text>

              <Box
                bg="rgba(251, 247, 242, 0.85)"
                p={4}
                borderRadius="14px"
                border="1px solid rgba(107, 29, 40, 0.08)"
                mb={6}
              >
                <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-maroon)" mb={2}>
                  أبرز مزايا الخدمة:
                </Text>
                <Flex direction="column" gap={1.5} fontSize="0.84rem" color="var(--athar-text-body)">
                  <Text>• هواتف كلاسيكية فاخرة بتشطيبات رخامية وعاجية</Text>
                  <Text>• فلترة وهندسة صوت احترافية لكل تسجيل</Text>
                  <Text>• موقع الذكرى الخاص (5 تبويبات تفاعلية + موجات صوتية)</Text>
                  <Text>• بطاقات طاولات مزودة بـ QR عالي الدقة</Text>
                </Flex>
              </Box>
            </Box>

            <Flex direction="column" gap={2.5}>
              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-athar-primary"
                style={{ width: "100%", textAlign: "center" }}
              >
                فتح منصة الكشك والحجز (3002) ↗
              </a>
              <Button
                className="btn-athar-secondary"
                onClick={() => onOpenAccount("orders")}
                w="100%"
              >
                متابعة طلب الكشك الحالي
              </Button>
            </Flex>
          </Box>

          {/* Card 2: Athar Invitation */}
          <Box
            className="card-luxury"
            p={7}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              right={0}
              w="120px"
              h="4px"
              bg="linear-gradient(90deg, var(--athar-gold), var(--athar-maroon))"
            />
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Badge className="badge-gold">
                  ✉️ دعوات أثر التفاعلية
                </Badge>
                <Badge
                  bg="rgba(212, 175, 55, 0.15)"
                  color="#8A6D1B"
                  px={2.5}
                  py={1}
                  borderRadius="md"
                  fontSize="0.75rem"
                  fontFamily="monospace"
                >
                  منفذ :3003
                </Badge>
              </Flex>

              <Text
                fontSize="1.45rem"
                fontWeight="800"
                color="var(--athar-text-title)"
                mb={2}
                className="font-arabic-display"
              >
                Athar Invitation — Bespoke Event Websites
              </Text>

              <Text fontSize="0.92rem" color="var(--athar-text-body)" mb={5} lineHeight="1.7">
                مواقع دعوات مخصصة لأعراسكم وفعالياتكم الكبرى بنماذج RSVP ديناميكية وصندوق بريد حي للعميل لإدارة مقاعد القاعة وقبول المدعوين وإرسال كود QR.
              </Text>

              <Box
                bg="rgba(251, 247, 242, 0.85)"
                p={4}
                borderRadius="14px"
                border="1px solid rgba(212, 175, 55, 0.18)"
                mb={6}
              >
                <Text fontSize="0.82rem" fontWeight="700" color="#8A6D1B" mb={2}>
                  أبرز مزايا الخدمة:
                </Text>
                <Flex direction="column" gap={1.5} fontSize="0.84rem" color="var(--athar-text-body)">
                  <Text>• تصميم موقع متكامل ومخصص لمناسبتك</Text>
                  <Text>• نموذج RSVP ديناميكي مع بريد إلكتروني إلزامي</Text>
                  <Text>• صندوق بريد مباشر مع عداد سعة القاعة الذكي</Text>
                  <Text>• إرسال تذاكر QR تلقائياً للمقبولين عبر EmailJS</Text>
                </Flex>
              </Box>
            </Box>

            <Flex direction="column" gap={2.5}>
              <a
                href="http://localhost:3003"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-athar-gold"
                style={{ width: "100%", textAlign: "center" }}
              >
                فتح منصة الدعوات (3003) ↗
              </a>
              <Button
                className="btn-athar-secondary"
                onClick={() => onOpenAccount("mailbox")}
                w="100%"
              >
                فتح صندوق بريد الردود (RSVP Mailbox)
              </Button>
            </Flex>
          </Box>

          {/* Card 3: Athar Admin Studio */}
          <Box
            className="card-luxury"
            p={7}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              right={0}
              w="120px"
              h="4px"
              bg="linear-gradient(90deg, #1E6F50, var(--athar-gold))"
            />
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Badge className="badge-emerald">
                  ⚡ استوديو العمليات والإدارة
                </Badge>
                <Badge
                  bg="rgba(30, 111, 80, 0.1)"
                  color="#1E6F50"
                  px={2.5}
                  py={1}
                  borderRadius="md"
                  fontSize="0.75rem"
                  fontFamily="monospace"
                >
                  منفذ :3001
                </Badge>
              </Flex>

              <Text
                fontSize="1.45rem"
                fontWeight="800"
                color="var(--athar-text-title)"
                mb={2}
                className="font-arabic-display"
              >
                Athar Admin — Studio & Operations
              </Text>

              <Text fontSize="0.92rem" color="var(--athar-text-body)" mb={5} lineHeight="1.7">
                منصة التحكم الشاملة لفريق العمليات: مراجعة واعتماد إيصالات الدفع اليدوي، استوديو الرفع السريع لـ 100+ تسجيلاً صوتياً، وتخصيص الباقات والنماذج.
              </Text>

              <Box
                bg="rgba(251, 247, 242, 0.85)"
                p={4}
                borderRadius="14px"
                border="1px solid rgba(30, 111, 80, 0.18)"
                mb={6}
              >
                <Text fontSize="0.82rem" fontWeight="700" color="#1E6F50" mb={2}>
                  أدوات فريق العمل:
                </Text>
                <Flex direction="column" gap={1.5} fontSize="0.84rem" color="var(--athar-text-body)">
                  <Text>• فحص واعتماد / رفض إيصالات التحويل البنكي</Text>
                  <Text>• سحب تلقائي لمواد العميل بنقرة واحدة</Text>
                  <Text>• استوديو رفع ومعالجة جماعية للأصوات والموجات</Text>
                  <Text>• بناء وتعديل حقول نماذج الدعوات وتحديد السعة</Text>
                </Flex>
              </Box>
            </Box>

            <Flex direction="column" gap={2.5}>
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-athar-secondary"
                style={{ width: "100%", textAlign: "center", borderColor: "#1E6F50", color: "#1E6F50" }}
              >
                دخول استوديو الإدارة (3001) ↗
              </a>
              <Button
                className="btn-athar-secondary"
                onClick={() => onOpenAccount("orders")}
                w="100%"
              >
                استعراض جدول التدفق عبر 7 مراحل
              </Button>
            </Flex>
          </Box>
        </SimpleGrid>

        {/* Dedicated Storefront Renderer Runtime Strip */}
        <Box
          mt={6}
          p={4}
          borderRadius="16px"
          bg="rgba(255, 255, 255, 0.85)"
          border="1px solid rgba(212, 175, 55, 0.35)"
          boxShadow="var(--athar-shadow-soft)"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={3}
        >
          <Flex align="center" gap={3}>
            <Box
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="rgba(107, 29, 40, 0.08)"
              color="var(--athar-maroon)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="1.2rem"
            >
              🌐
            </Box>
            <Box>
              <Text fontSize="0.95rem" fontWeight="800" color="var(--athar-maroon)">
                Storefront Renderer — بوابة العرض المخصصة (Port 3004)
              </Text>
              <Text fontSize="0.8rem" color="var(--athar-text-muted)">
                المحرك المخصص لمعاينة وعرض ذكريات الكشك والدعوات الرقمية بالنطاقات الفرعية (*.localhost).
              </Text>
            </Box>
          </Flex>
          <a
            href="http://localhost:3004"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-athar-secondary"
            style={{ fontSize: "0.82rem", padding: "0.45rem 1rem", borderColor: "#D4AF37", color: "var(--athar-maroon)", fontWeight: 700 }}
          >
            فتح منصة العرض السحابية (:3004) ↗
          </a>
        </Box>
      </Box>

      {/* Concierge Portal Pillars Section */}
      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }} mb={12}>
        <Box
          className="card-luxury"
          p={{ base: 6, md: 10 }}
          borderRadius="28px"
          bg="rgba(255, 255, 255, 0.96)"
        >
          <Text
            fontSize="0.85rem"
            fontWeight="700"
            color="var(--athar-gold)"
            textTransform="uppercase"
            letterSpacing="0.08em"
            mb={2}
          >
            تجربة العميل الاستثنائية
          </Text>
          <Text
            fontSize={{ base: "1.6rem", md: "2.1rem" }}
            fontWeight="800"
            color="var(--athar-maroon)"
            mb={6}
            className="font-arabic-display"
          >
            بوابة العميل الرقمية — كل تفاصيل مناسبتك بين يديك
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
            <Box
              p={5}
              borderRadius="16px"
              bg="var(--athar-bg-primary)"
              border="1px solid rgba(107, 29, 40, 0.08)"
              cursor="pointer"
              onClick={() => onOpenAccount("orders")}
              _hover={{ borderColor: "var(--athar-maroon)", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <Text fontSize="1.8rem" mb={2}>⏱️</Text>
              <Text fontSize="1.05rem" fontWeight="700" color="var(--athar-text-title)" mb={1}>
                متابعة الطلب (7 مراحل)
              </Text>
              <Text fontSize="0.85rem" color="var(--athar-text-muted)" lineHeight="1.6">
                متابعة شفافة خطوة بخطوة من مراجعة الإيصال وحتى تسليم الرابط النهائي وكود QR.
              </Text>
            </Box>

            <Box
              p={5}
              borderRadius="16px"
              bg="var(--athar-bg-primary)"
              border="1px solid rgba(107, 29, 40, 0.08)"
              cursor="pointer"
              onClick={() => onOpenAccount("assets")}
              _hover={{ borderColor: "var(--athar-maroon)", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <Text fontSize="1.8rem" mb={2}>📦</Text>
              <Text fontSize="1.05rem" fontWeight="700" color="var(--athar-text-title)" mb={1}>
                صندوق تسليم المواد
              </Text>
              <Text fontSize="0.85rem" color="var(--athar-text-muted)" lineHeight="1.6">
                رفع صورة الغلاف، الاقتباس الخاص، وكلمة الشكر للضيوف ليتولى الاستوديو تنسيقها.
              </Text>
            </Box>

            <Box
              p={5}
              borderRadius="16px"
              bg="var(--athar-bg-primary)"
              border="1px solid rgba(107, 29, 40, 0.08)"
              cursor="pointer"
              onClick={() => onOpenAccount("audio")}
              _hover={{ borderColor: "var(--athar-maroon)", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <Text fontSize="1.8rem" mb={2}>🎧</Text>
              <Text fontSize="1.05rem" fontWeight="700" color="var(--athar-text-title)" mb={1}>
                مراجعة التسجيلات الصوتية
              </Text>
              <Text fontSize="0.85rem" color="var(--athar-text-muted)" lineHeight="1.6">
                استماع مسبق للأصوات بعد الهندسة مع إمكانية التحميل الفردي أو الجماعي الكامل (ZIP).
              </Text>
            </Box>

            <Box
              p={5}
              borderRadius="16px"
              bg="var(--athar-bg-primary)"
              border="1px solid rgba(107, 29, 40, 0.08)"
              cursor="pointer"
              onClick={() => onOpenAccount("qr_hub")}
              _hover={{ borderColor: "var(--athar-maroon)", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <Text fontSize="1.8rem" mb={2}>🖨️</Text>
              <Text fontSize="1.05rem" fontWeight="700" color="var(--athar-text-title)" mb={1}>
                مركز QR وبطاقات الطاولات
              </Text>
              <Text fontSize="0.85rem" color="var(--athar-text-muted)" lineHeight="1.6">
                تحميل كود QR عالي الدقة أو طباعة بطاقة الطاولات التذكارية الأنيقة للمدعوين.
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      </Box>

      {/* Footer */}
      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }} pt={6} borderTop="1px solid rgba(107, 29, 40, 0.08)">
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} fontSize="0.85rem" color="var(--athar-text-muted)">
          <Text>
            جميع الحقوق محفوظة © {new Date().getFullYear()} لمنظومة أثر (ASAR Audio Memories & Luxury Hospitality).
          </Text>
          <Flex gap={4}>
            <Text>بنية مايكرو فرونت إند عبر Turborepo v2</Text>
            <Text>•</Text>
            <Text>تكامل مع Appwrite Cloud v17 & EmailJS</Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default EcosystemHome;
