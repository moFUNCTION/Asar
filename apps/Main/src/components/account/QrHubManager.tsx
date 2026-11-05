import React, { useState } from "react";
import { Box, Flex, SimpleGrid, Text, Button, Badge } from "@chakra-ui/react";
import { useAvatars, buildMemoryUrls } from "@repo/react-appwrite";

export interface QrHubManagerProps {
  orderId: string;
  serviceType: "booth" | "invitation";
  clientNames: string;
  slug?: string;
  eventDate?: string;
  eventLocation?: string;
}

export const QrHubManager: React.FC<QrHubManagerProps> = ({
  orderId,
  serviceType,
  clientNames,
  slug = serviceType === "booth" ? "mina-and-maryam" : "omar-and-layla",
  eventDate = "12 يوليو 2026",
  eventLocation = "الإسكندرية، مصر",
}) => {
  const { getQR } = useAvatars();
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "table_stand">("card");

  // Construct canonical and dev URLs using monorepo storefront builder
  const memoryUrls = buildMemoryUrls({
    slug,
    type: serviceType,
    rendererPort: 3004,
  });
  const targetUrl = memoryUrls.canonicalUrl;

  // High resolution QR code URL via Appwrite Avatars or public fallback
  const qrImageUrl =
    getQR?.(targetUrl, 600, 2) ||
    `https://api.qrserver.com/v1/create-qr-code/?size=600x600&color=6B1D28&bgcolor=FBF7F2&data=${encodeURIComponent(
      targetUrl
    )}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQrPng = () => {
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = `Athar_QR_${slug}.png`;
    a.target = "_blank";
    a.click();
  };

  const handlePrintTableCard = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text =
      serviceType === "booth"
        ? `يسعدنا مشاركتكم ذكريات وأصوات حفل زفافنا (${clientNames}) عبر موقع أثر:\n${targetUrl}`
        : `نتشرف بدعوتكم لحضور حفل (${clientNames})، يرجى تأكيد حضوركم عبر الرابط التالي:\n${targetUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <Box>
      {/* Header Banner */}
      <Box className="card-luxury" p={{ base: 5, md: 7 }} mb={8}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
          <Box>
            <Flex align="center" gap={2} mb={1}>
              <Badge className="badge-gold">مركز رموز الاستجابة السريعة (QR Hub)</Badge>
              <Badge className="badge-maroon">طلب #{orderId}</Badge>
            </Flex>
            <Text
              fontSize={{ base: "1.4rem", md: "1.8rem" }}
              fontWeight="900"
              color="var(--athar-maroon)"
              className="font-arabic-display"
            >
              كود QR الخاص بموقعك وبطاقات الطاولات المطبوعة
            </Text>
            <Text fontSize="0.88rem" color="var(--athar-text-muted)">
              شارك الرابط أو حمّل بطاقة الطاولات الفاخرة للطباعة ووضعها على طاولات الحفل ليتمكن الضيوف من المسح فوراً
            </Text>
          </Box>

          <Flex gap={2}>
            <Button
              className="btn-athar-secondary"
              onClick={() => setViewMode(viewMode === "card" ? "table_stand" : "card")}
              fontSize="0.85rem"
              px={4}
              py={2}
            >
              {viewMode === "card" ? "🖨️ معاينة بطاقة الطاولة التذكارية (5x7)" : "📱 العودة لعرض الكود البسيط"}
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Main Grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8} mb={8}>
        {/* Left: The Keepsake QR Card Preview */}
        <Box
          className={viewMode === "table_stand" ? "card-luxury-noir" : "card-luxury"}
          p={{ base: 6, md: 8 }}
          textAlign="center"
          position="relative"
          border={viewMode === "table_stand" ? "2px solid var(--athar-gold)" : "1px solid var(--athar-gold-border)"}
        >
          {viewMode === "table_stand" ? (
            /* Luxury 5x7" Table Stand Card Layout */
            <Box>
              <Text fontSize="0.82rem" color="var(--athar-gold)" letterSpacing="0.12em" textTransform="uppercase" mb={2}>
                ATHAR AUDIO MEMORIES
              </Text>
              <Text
                fontSize="1.8rem"
                fontWeight="900"
                color="#FFFFFF"
                className="font-arabic-display"
                mb={1}
              >
                {clientNames}
              </Text>
              <Text fontSize="0.88rem" color="rgba(255, 255, 255, 0.75)" mb={4}>
                {eventDate} • {eventLocation}
              </Text>

              {/* Acoustic Waveform Ornament Divider */}
              <Flex align="center" justify="center" gap={3} my={3} opacity={0.85}>
                <Box h="1px" w="50px" bg="linear-gradient(90deg, transparent, #D4AF37)" />
                <svg width="32" height="16" viewBox="0 0 36 18" fill="none">
                  <path
                    d="M1 9H7L10 3L14 15L18 1L22 17L26 5L29 9H35"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <Box h="1px" w="50px" bg="linear-gradient(90deg, #D4AF37, transparent)" />
              </Flex>

              <Text fontSize="0.85rem" color="#E5C158" mb={4} fontWeight="600">
                امسح الكود للاستماع ومشاركتنا ذكريات هذا اليوم الجميل
              </Text>

              {/* QR Image */}
              <Box
                w="200px"
                h="200px"
                mx="auto"
                p={3}
                bg="#FFFFFF"
                borderRadius="16px"
                boxShadow="0 8px 30px rgba(0, 0, 0, 0.4)"
                mb={4}
              >
                <img
                  src={qrImageUrl}
                  alt="Athar QR Code"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>

              <Text fontSize="0.75rem" color="rgba(255, 255, 255, 0.6)">
                Scan to Hear Our Wedding Memories • Made with Love by Athar
              </Text>
            </Box>
          ) : (
            /* Standard Keepsake Card Layout */
            <Box>
              <Badge className="badge-gold" mb={4} px={4} py={1}>
                ✦ رمز الاستجابة السريعة المعتمد
              </Badge>

              <Text
                fontSize="1.5rem"
                fontWeight="900"
                color="var(--athar-maroon)"
                className="font-arabic-display"
                mb={1}
              >
                {clientNames}
              </Text>
              <Text fontSize="0.88rem" color="var(--athar-text-muted)" mb={5}>
                {serviceType === "booth" ? "صفحة الذكريات الصوتية الخاصة" : "موقع الدعوة المخصص"}
              </Text>

              {/* QR Image */}
              <Box
                w="220px"
                h="220px"
                mx="auto"
                p={3.5}
                bg="white"
                borderRadius="20px"
                border="2px solid var(--athar-gold-border)"
                boxShadow="var(--athar-shadow-soft)"
                mb={5}
              >
                <img
                  src={qrImageUrl}
                  alt="Athar QR Code"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>

              <Text fontSize="0.85rem" color="var(--athar-text-title)" fontWeight="700">
                الرابط المباشر للوجهة:
              </Text>
              <Box
                bg="rgba(107, 29, 40, 0.05)"
                p={2.5}
                borderRadius="10px"
                mt={1.5}
                fontFamily="monospace"
                fontSize="0.82rem"
                color="var(--athar-maroon)"
                wordBreak="break-all"
              >
                {targetUrl}
              </Box>
              <Text fontSize="0.75rem" color="var(--athar-text-muted)" mt={1.5}>
                معاينة المطور (Storefront Renderer):{" "}
                <a
                  href={memoryUrls.devRendererUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "underline", color: "var(--athar-maroon)", fontWeight: 700 }}
                >
                  {memoryUrls.devRendererUrl}
                </a>
              </Text>
            </Box>
          )}
        </Box>

        {/* Right: Sharing Actions and Tools */}
        <Box className="card-luxury" p={{ base: 6, md: 8 }} display="flex" flexDirection="column" justifyContent="space-between">
          <Box>
            <Text fontSize="1.25rem" fontWeight="800" color="var(--athar-maroon)" mb={3} className="font-arabic-display">
              أدوات التنزيل والمشاركة
            </Text>
            <Text fontSize="0.88rem" color="var(--athar-text-body)" mb={6} lineHeight="1.7">
              يمكنكم استخدام هذا الرمز بعدة طرق: طباعته على كروت الدعوة الورقية، تجهيز بطاقات الطاولات الأنيقة للمدعوين في القاعة، أو إرساله مباشرة لأقاربكم وأصدقائكم عبر واتساب.
            </Text>

            <Flex direction="column" gap={3} mb={6}>
              <Button
                className="btn-athar-primary"
                onClick={handleDownloadQrPng}
                w="100%"
                py={3}
                fontSize="0.95rem"
              >
                📥 تحميل صورة QR عالية الدقة (PNG)
              </Button>

              <Button
                className="btn-athar-gold"
                onClick={handlePrintTableCard}
                w="100%"
                py={3}
                fontSize="0.95rem"
              >
                🖨️ طباعة بطاقة الطاولة التذكارية (Print Stand Card)
              </Button>

              <Button
                className="btn-athar-secondary"
                onClick={handleCopy}
                w="100%"
                py={3}
                fontSize="0.95rem"
              >
                {copied ? "✓ تم نسخ الرابط إلى الحافظة!" : "📋 نسخ الرابط المباشر"}
              </Button>

              <Button
                onClick={handleWhatsAppShare}
                w="100%"
                py={3}
                borderRadius="full"
                border="none"
                cursor="pointer"
                fontWeight="700"
                fontSize="0.95rem"
                bg="#25D366"
                color="white"
                _hover={{ bg: "#1EBE5D" }}
              >
                💬 مشاركة سريعة عبر واتساب (WhatsApp)
              </Button>
            </Flex>
          </Box>

          <Box
            p={4}
            borderRadius="14px"
            bg="rgba(251, 247, 242, 0.9)"
            border="1px solid rgba(107, 29, 40, 0.08)"
          >
            <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-maroon)" mb={1}>
              💡 نصيحة أثر لفريق التنسيق:
            </Text>
            <Text fontSize="0.78rem" color="var(--athar-text-muted)" lineHeight="1.6">
              يُفضل طباعة بطاقات الطاولات على ورق مقوى (Cotton Linen Rag 300g) بحجم 5x7 بوصة ليمنح طاولات القاعة مظهراً ملكياً دافئاً يتطابق مع هوية كشك أثر.
            </Text>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default QrHubManager;
