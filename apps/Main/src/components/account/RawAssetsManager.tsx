import React, { useState } from "react";
import { Box, Flex, SimpleGrid, Text, Button, Badge } from "@chakra-ui/react";
import { useUpload } from "@repo/react-appwrite";

export interface RawAssetItem {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  uploadedAt: string;
  fileId?: string;
}

export interface ClientSubmittedAssetsData {
  eventHeaderTag: string;
  coupleTitle: string;
  eventDateDisplay: string;
  eventLocationDisplay: string;
  highlightBadge: string;
  coupleQuote: string;
  thankYouMessage: string;
  heroImageFileId?: string;
  heroImagePreviewUrl?: string;
  customCategories: string[];
}

export interface RawAssetsManagerProps {
  orderId: string;
  initialAssets?: Partial<ClientSubmittedAssetsData>;
  isLocked?: boolean;
  onSave?: (assets: ClientSubmittedAssetsData) => void;
}

export const RawAssetsManager: React.FC<RawAssetsManagerProps> = ({
  orderId,
  initialAssets,
  isLocked = false,
  onSave,
}) => {
  // Personalization State
  const [headerTag, setHeaderTag] = useState(initialAssets?.eventHeaderTag || "THE WEDDING OF");
  const [coupleTitle, setCoupleTitle] = useState(initialAssets?.coupleTitle || "Mina & Maryam (مينا ومريم)");
  const [eventDate, setEventDate] = useState(initialAssets?.eventDateDisplay || "12 July 2026");
  const [eventLocation, setEventLocation] = useState(initialAssets?.eventLocationDisplay || "Alexandria, Egypt");
  const [highlightBadge, setHighlightBadge] = useState(initialAssets?.highlightBadge || "Together Always");
  const [coupleQuote, setCoupleQuote] = useState(
    initialAssets?.coupleQuote || "Every voice here is a piece of our forever ... / كل صوت هنا هو قطعة من حكايتنا الأبدية"
  );
  const [thankYouMessage, setThankYouMessage] = useState(
    initialAssets?.thankYouMessage ||
      "نشكركم من أعماق قلوبنا على حضوركم ومشاركتنا أثمن لحظاتنا، وترك كلماتكم الطيبة التي سترافقنا طوال العمر."
  );

  // Hero Cover Photo
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string>(
    initialAssets?.heroImagePreviewUrl ||
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop"
  );
  const [heroFileId, setHeroFileId] = useState<string | undefined>(initialAssets?.heroImageFileId);

  // Category tags
  const [categories, setCategories] = useState<string[]>(
    initialAssets?.customCategories && initialAssets.customCategories.length > 0
      ? initialAssets.customCategories
      : ["العائلة (Family)", "الأصدقاء (Friends)", "الزملاء (Colleagues)", "ضيوف مميزون (VIP Guests)"]
  );
  const [newCatInput, setNewCatInput] = useState("");

  // Uploaded Raw Files List
  const [rawFiles, setRawFiles] = useState<RawAssetItem[]>([
    {
      id: "raw-1",
      name: "wedding-entrance-music-cue.mp3",
      sizeBytes: 4200000,
      type: "audio/mpeg",
      uploadedAt: "اليوم 10:30 ص",
    },
    {
      id: "raw-2",
      name: "couple-first-look-portrait.jpg",
      sizeBytes: 2800000,
      type: "image/jpeg",
      uploadedAt: "اليوم 10:32 ص",
    },
  ]);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Appwrite Storage Hook
  const { uploadFile } = useUpload({
    bucketId: "client_raw_assets",
  });

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    if (!categories.includes(newCatInput.trim())) {
      setCategories([...categories, newCatInput.trim()]);
    }
    setNewCatInput("");
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setCategories(categories.filter((c) => c !== catToRemove));
  };

  const handleHeroDrop = async (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    let file: File | undefined;
    if ("dataTransfer" in e && e.dataTransfer.files.length > 0) {
      e.preventDefault();
      file = e.dataTransfer.files[0];
    } else {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        file = target.files[0];
      }
    }

    if (!file) return;

    try {
      const uploaded = await uploadFile(file);
      if (uploaded?.$id) {
        setHeroFileId(uploaded.$id);
      }
      setHeroPreviewUrl(URL.createObjectURL(file));
    } catch (err) {
      // Local fallback
      setHeroPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRawFilesDrop = async (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    let files: FileList | null = null;
    if ("dataTransfer" in e && e.dataTransfer.files.length > 0) {
      e.preventDefault();
      files = e.dataTransfer.files;
    } else {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        files = target.files;
      }
    }

    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const uploaded = await uploadFile(file);
        const newItem: RawAssetItem = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          sizeBytes: file.size,
          type: file.type || "application/octet-stream",
          uploadedAt: "الآن",
          fileId: uploaded?.$id,
        };
        setRawFiles((prev) => [newItem, ...prev]);
      } catch (err) {
        // Local fallback item
        const newItem: RawAssetItem = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          sizeBytes: file.size,
          type: file.type || "application/octet-stream",
          uploadedAt: "الآن",
        };
        setRawFiles((prev) => [newItem, ...prev]);
      }
    }
  };

  const handleDeleteRawFile = (id: string) => {
    setRawFiles(rawFiles.filter((f) => f.id !== id));
  };

  const handleSubmitAll = () => {
    setIsSubmitting(true);
    setSaveSuccess(false);

    const payload: ClientSubmittedAssetsData = {
      eventHeaderTag: headerTag,
      coupleTitle,
      eventDateDisplay: eventDate,
      eventLocationDisplay: eventLocation,
      highlightBadge,
      coupleQuote,
      thankYouMessage,
      heroImageFileId: heroFileId,
      heroImagePreviewUrl: heroPreviewUrl,
      customCategories: categories,
    };

    try {
      // Sync to localStorage cache for cross-page persistence
      const cachedOrders = localStorage.getItem("asar_orders_cache") || "{}";
      const parsed = JSON.parse(cachedOrders);
      parsed[orderId] = {
        ...(parsed[orderId] || {}),
        clientSubmittedAssetsJson: JSON.stringify(payload),
        hasSubmittedAssets: true,
      };
      localStorage.setItem("asar_orders_cache", JSON.stringify(parsed));
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      onSave?.(payload);
      setIsSubmitting(false);
      setSaveSuccess(true);
    }, 600);
  };

  if (isLocked) {
    return (
      <Box className="card-luxury" p={8} textAlign="center">
        <Text fontSize="2.5rem" mb={3}>🔒</Text>
        <Text fontSize="1.35rem" fontWeight="800" color="var(--athar-maroon)" mb={2} className="font-arabic-display">
          صندوق تسليم المواد بانتظار اعتماد الدفع
        </Text>
        <Text fontSize="0.95rem" color="var(--athar-text-muted)" maxW="600px" mx="auto" lineHeight="1.8">
          يُفتح هذا التبويب تلقائياً بمجرد تأكيد واعتماد إيصال الدفع من قبل فريق أثر المالي، ليتاح لكم رفع صورة الغلاف والكلمات الخاصة لتنسيق موقع الذكرى.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Banner */}
      <Box className="card-luxury" p={{ base: 5, md: 7 }} mb={8}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
          <Box>
            <Flex align="center" gap={2} mb={1}>
              <Badge className="badge-gold">صندوق المواد الخاص بالطلب #{orderId}</Badge>
            </Flex>
            <Text
              fontSize={{ base: "1.4rem", md: "1.8rem" }}
              fontWeight="900"
              color="var(--athar-maroon)"
              className="font-arabic-display"
            >
              تسليم مواد وصور الذكرى لاستوديو أثر
            </Text>
            <Text fontSize="0.88rem" color="var(--athar-text-muted)">
              املأ البيانات التالية ليتولى فريق الاستوديو تنسيق موقع الذكرى وصفحة الاستماع الخاصة بكم
            </Text>
          </Box>

          <Button
            className="btn-athar-primary"
            onClick={handleSubmitAll}
            disabled={isSubmitting}
            px={6}
            py={3}
          >
            {isSubmitting ? "جاري الحفظ..." : "حفظ وإرسال المواد للإدارة ←"}
          </Button>
        </Flex>

        {saveSuccess && (
          <Box
            bg="var(--athar-status-success-bg)"
            border="1px solid var(--athar-status-success)"
            color="var(--athar-status-success)"
            p={3.5}
            borderRadius="12px"
            mt={4}
            fontSize="0.88rem"
            fontWeight="700"
          >
            ✓ تم حفظ وإرسال المواد بنجاح! أصبحت متاحة الآن في استوديو الإدارة (One-Click Pull Client Assets).
          </Box>
        )}
      </Box>

      {/* Grid: Left = Hero & Personal Texts, Right = Categories & Raw Files */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8} mb={8}>
        {/* Section 1: Hero Cover Photo & Names */}
        <Box className="card-luxury" p={{ base: 5, md: 7 }}>
          <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-maroon)" mb={4} className="font-arabic-display">
            1. صورة الغلاف وعناوين المناسبة (Hero & Titles)
          </Text>

          {/* Hero Image Drag & Drop */}
          <Box mb={5}>
            <label className="athar-label">صورة الغلاف الرئيسية (Hero Cover Photo)</label>
            <Box
              position="relative"
              borderRadius="16px"
              overflow="hidden"
              border="2px dashed var(--athar-gold-border)"
              p={3}
              textAlign="center"
              bg="rgba(251, 247, 242, 0.6)"
              cursor="pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleHeroDrop}
              _hover={{ borderColor: "var(--athar-maroon)" }}
              transition="all 0.2s"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroDrop}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
              />
              {heroPreviewUrl ? (
                <Box position="relative">
                  <img
                    src={heroPreviewUrl}
                    alt="Hero Preview"
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px" }}
                  />
                  <Box
                    position="absolute"
                    bottom={2}
                    right={2}
                    bg="rgba(0,0,0,0.7)"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="0.75rem"
                  >
                    تغيير الصورة ✎
                  </Box>
                </Box>
              ) : (
                <Box py={8}>
                  <Text fontSize="2.5rem" mb={2}>🖼️</Text>
                  <Text fontSize="0.9rem" fontWeight="700">اسحب وأفلت صورة العروسين هنا</Text>
                  <Text fontSize="0.75rem" color="var(--athar-text-muted)">JPG, PNG, WEBP (حجم عالي الدقة يفضل)</Text>
                </Box>
              )}
            </Box>
          </Box>

          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} mb={4}>
            <Box>
              <label className="athar-label">الوسم العلوي (Overline)</label>
              <input
                type="text"
                className="athar-input"
                value={headerTag}
                onChange={(e) => setHeaderTag(e.target.value)}
                placeholder="THE WEDDING OF"
              />
            </Box>
            <Box>
              <label className="athar-label">أسماء العروسين / المناسبة</label>
              <input
                type="text"
                className="athar-input"
                value={coupleTitle}
                onChange={(e) => setCoupleTitle(e.target.value)}
                placeholder="Mina & Maryam"
              />
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, sm: 3 }} gap={3} mb={4}>
            <Box>
              <label className="athar-label">تاريخ الحفل</label>
              <input
                type="text"
                className="athar-input"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="12 July 2026"
              />
            </Box>
            <Box>
              <label className="athar-label">المدينة / القاعة</label>
              <input
                type="text"
                className="athar-input"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Alexandria, Egypt"
              />
            </Box>
            <Box>
              <label className="athar-label">الشعار التذكاري</label>
              <input
                type="text"
                className="athar-input"
                value={highlightBadge}
                onChange={(e) => setHighlightBadge(e.target.value)}
                placeholder="Together Always"
              />
            </Box>
          </SimpleGrid>

          <Box mb={4}>
            <label className="athar-label">الاقتباس الشخصي (Couple Quote)</label>
            <textarea
              className="athar-input"
              rows={2}
              value={coupleQuote}
              onChange={(e) => setCoupleQuote(e.target.value)}
              placeholder="اكتب عبارة تعبر عنكما لتظهر في واجهة موقع الذكرى..."
            />
          </Box>

          <Box>
            <label className="athar-label">رسالة الشكر للضيوف (Thank You Message)</label>
            <textarea
              className="athar-input"
              rows={3}
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              placeholder="رسالة تظهر في تبويب 'شكراً لكم' لكل من زار واستمع للتسجيلات..."
            />
          </Box>
        </Box>

        {/* Section 2: Custom Categories & Raw Audio/Photo Uploads */}
        <Box className="card-luxury" p={{ base: 5, md: 7 }}>
          <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-maroon)" mb={4} className="font-arabic-display">
            2. فئات تصنيف التسجيلات الصوتية (Voice Categories)
          </Text>

          <Text fontSize="0.82rem" color="var(--athar-text-muted)" mb={3}>
            حدد فئات التصنيف التي ترغب بتوزيع تسجيلات الضيوف عليها في موقع الذكرى (مثل: العائلة، الأصدقاء، إلخ):
          </Text>

          {/* Tag Chips */}
          <Flex wrap="wrap" gap={2} mb={4}>
            {categories.map((cat) => (
              <Badge
                key={cat}
                className="badge-maroon"
                px={3}
                py={1.5}
                fontSize="0.82rem"
                display="inline-flex"
                alignItems="center"
                gap={2}
              >
                <span>{cat}</span>
                <span
                  style={{ cursor: "pointer", fontWeight: "bold" }}
                  onClick={() => handleRemoveCategory(cat)}
                >
                  ×
                </span>
              </Badge>
            ))}
          </Flex>

          <Flex gap={2} mb={6}>
            <input
              type="text"
              className="athar-input"
              placeholder="أضف تصنيف جديد (مثال: أصدقاء العريس)"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <Button className="btn-athar-secondary" onClick={handleAddCategory} px={4}>
              + إضافة
            </Button>
          </Flex>

          {/* Multi-File Drag & Drop Area */}
          <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-maroon)" mb={3} className="font-arabic-display">
            3. رفع مواد إضافية أو تسجيلات خاصة (Raw Assets)
          </Text>

          <Box
            border="2px dashed var(--athar-gold)"
            borderRadius="16px"
            p={5}
            textAlign="center"
            bg="rgba(251, 247, 242, 0.7)"
            cursor="pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleRawFilesDrop}
            position="relative"
            mb={4}
            _hover={{ borderColor: "var(--athar-maroon)", bg: "white" }}
            transition="all 0.2s"
          >
            <input
              type="file"
              multiple
              accept="audio/*,image/*"
              onChange={handleRawFilesDrop}
              style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
            />
            <Text fontSize="2rem" mb={1}>📁</Text>
            <Text fontSize="0.88rem" fontWeight="700">اسحب وأفلت الملفات الصوتية أو الصور الإضافية هنا</Text>
            <Text fontSize="0.75rem" color="var(--athar-text-muted)">
              يمكنك رفع تسجيلات صوتية خاصة، مقاطع صوتية لمدخل الحفل، أو صور إضافية للمعرض
            </Text>
          </Box>

          {/* Raw Files List */}
          <Box>
            <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-text-title)" mb={2}>
              الملفات المرفوعة حالياً ({rawFiles.length}):
            </Text>
            <Flex direction="column" gap={2} maxH="220px" overflowY="auto">
              {rawFiles.map((file) => (
                <Flex
                  key={file.id}
                  justify="space-between"
                  align="center"
                  p={2.5}
                  bg="white"
                  borderRadius="10px"
                  border="1px solid rgba(107, 29, 40, 0.08)"
                  fontSize="0.82rem"
                >
                  <Flex align="center" gap={2}>
                    <Text>{file.type.startsWith("audio") ? "🎵" : "🖼️"}</Text>
                    <Box>
                      <Text fontWeight="700" color="var(--athar-text-title)">{file.name}</Text>
                      <Text fontSize="0.72rem" color="var(--athar-text-muted)">
                        {(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB • {file.uploadedAt}
                      </Text>
                    </Box>
                  </Flex>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="var(--athar-status-danger)"
                    onClick={() => handleDeleteRawFile(file.id)}
                  >
                    حذف 🗑️
                  </Button>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default RawAssetsManager;
