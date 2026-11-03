import React, { useState } from "react";
import { Box, Flex, Text, HStack, Button, Badge } from "@chakra-ui/react";
import { FaChevronDown, FaWhatsapp } from "react-icons/fa";
import { FadeContent, SplitText } from "@repo/ui-components";

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "ما هو هاتف أثر الصوتي؟",
      a: "أثر هو هاتف عتيق فاخر وتجربة سجل زوار تفاعلية مبتكرة. يرفع ضيوفكم سماعة الهاتف الكلاسيكي، ليستمعوا إلى رسالة ترحيبية مسجلة مسبقاً بأصوات العروسين، ثم يسجلون كلماتهم ودعواتهم وضحكاتهم العفوية بعد سماع نغمة الرنين.",
    },
    {
      q: "كم عدد الرسائل التي يمكن للضيوف تسجيلها؟",
      a: "لا يوجد أي حد أقصى للتسجيل! يوفر نظام أثر سعة رقمية غير محدودة لتسجيل وحفظ كافة أصوات وكلمات ضيوفكم طوال فترة التغطية المقررة.",
    },
    {
      q: "كم من الوقت يستغرق تجهيز الركن في القاعة؟",
      a: "يصل فريقنا المحترف إلى القاعة قبل موعد وصول الضيوف بحوالي ساعة ونصف إلى ساعتين، لتركيب وتنسيق الهاتف العتيق، الزهور، الإضاءة الدافئة، وإجراء اختبارات المعايرة الصوتية.",
    },
    {
      q: "ما هي المناطق والمحافظات المشمولة بالتغطية؟",
      a: "نغطي حالياً الإسكندرية، الساحل الشمالي، العجمي، القاهرة، الجيزة، كما نوفر تغطية خاصة للأفراح في مختلف وجهات ومحافظات جمهورية مصر العربية.",
    },
    {
      q: "متى وكيف نستلم التسجيلات الصوتية بعد الفرح؟",
      a: "يتم تسليم الألبوم الصوتي كاملاً عبر رابط خاص مشفر خلال ١٠ إلى ١٤ يوماً بعد إتمام هندسة الصوت والفلترة. وفي حال اختيار باقة التسليم السريع، تستلمونها خلال ٤٨ ساعة فقط.",
    },
    {
      q: "هل يمكن تخصيص تصميم الهاتف واللافتات الترحيبية؟",
      a: "نعم بالتأكيد! نوفر خيارات لهواتف بألوان عتيقة متعددة، ولافتات ترحيبية أنيقة بخط يدوي مخصص بأسماء العروسين، وتنسيق ديكور ينسجم تماماً مع ديكور ومنظم حفل زفافكم.",
    },
    {
      q: "هل خصوصية التسجيلات الصوتية محمية ومضمونة؟",
      a: "بنسبة ١٠٠٪. خصوصيتكم خط أحمر؛ تحفظ جميع الملفات في خزانة سحابية مشفرة وخاصة بكم وحدكم، ولا نقوم بنشر أو مشاركة أي تسجيل صوتي نهائياً إلا بعد موافقة كتابية مسبقة من العروسين.",
    },
  ];

  return (
    <Box
      as="section"
      id="faq"
      py={{ base: 20, md: 28 }}
      px={{ base: 5, md: 10, lg: 16 }}
      bg="var(--athar-bg-primary)"
      position="relative"
      scrollMarginTop="120px"
      dir="rtl"
    >
      <Box maxW="920px" mx="auto">
        <Flex direction="column" align="center" textAlign="center" mb={{ base: 12, md: 16 }}>
          <Badge
            variant="outline"
            borderColor="rgba(212, 175, 55, 0.45)"
            bg="rgba(255, 255, 255, 0.85)"
            color="var(--athar-maroon)"
            px={4}
            py={1.5}
            borderRadius="full"
            fontSize="0.82rem"
            fontWeight="700"
            letterSpacing="0.08em"
            mb={2}
          >
            إِجَابَـــات شَامِلَـــة
          </Badge>
          <SplitText
            text="الأسئلة الأكثر شيوعاً"
            delay={50}
            splitType="words"
            animation="fadeUp"
            once={false}
            className="font-arabic-display"
            style={{
              fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
              fontWeight: 800,
              color: "var(--athar-text-title)",
              marginBottom: "0.5rem",
            }}
          />
          <SplitText
            text="كل ما تودون معرفته عن تجربة هاتف أثر وكيفية توثيق ليلتكم الكبرى."
            delay={25}
            splitType="words"
            animation="fadeUp"
            once={false}
            style={{
              fontSize: "1.08rem",
              color: "var(--athar-text-muted)",
              marginTop: "4px",
              justifyContent: "center",
            }}
          />
        </Flex>

        {/* FAQs wrapped in FadeContent */}
        <FadeContent blur={true} duration={1800} threshold={0.1} once={false}>
          <Flex direction="column" gap={4} mb={12}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Box
                key={idx}
                p={{ base: 5, md: 6 }}
                bg="rgba(255, 255, 255, 0.94)"
                borderRadius="20px"
                border="1px solid"
                borderColor={isOpen ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.08)"}
                boxShadow={isOpen ? "0 10px 25px -8px rgba(107, 29, 40, 0.12)" : "0 2px 8px rgba(0, 0, 0, 0.02)"}
                transition="all 0.3s ease"
              >
                <HStack
                  as="button"
                  w="100%"
                  justify="space-between"
                  align="center"
                  textAlign="right"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  bg="transparent"
                  border="none"
                  cursor="pointer"
                  outline="none"
                  gap={4}
                >
                  <Text
                    fontFamily="var(--font-arabic-display)"
                    fontSize={{ base: "1.15rem", md: "1.28rem" }}
                    fontWeight="700"
                    color="var(--athar-text-title)"
                  >
                    {faq.q}
                  </Text>
                  <Box
                    color="var(--athar-maroon)"
                    transform={isOpen ? "rotate(180deg)" : "rotate(0)"}
                    transition="transform 0.3s ease"
                    fontSize="0.95rem"
                    flexShrink={0}
                  >
                    <FaChevronDown />
                  </Box>
                </HStack>

                {isOpen && (
                  <Box
                    pt={4}
                    mt={3}
                    borderTop="1px solid rgba(107, 29, 40, 0.08)"
                    fontSize="0.98rem"
                    color="var(--athar-text-body)"
                    lineHeight="1.8"
                  >
                    {faq.a}
                  </Box>
                )}
              </Box>
            );
          })}
        </Flex>

        {/* Help WhatsApp Card from Screen 09 */}
        <Box
          p={6}
          borderRadius="24px"
          bg="var(--athar-bg-secondary)"
          border="1px solid rgba(212, 175, 55, 0.35)"
          display="flex"
          flexDirection={{ base: "column", sm: "row" }}
          alignItems="center"
          justifyContent="space-between"
          gap={4}
          textAlign={{ base: "center", sm: "right" }}
        >
          <Box>
            <Text
              fontFamily="var(--font-arabic-display)"
              fontSize="1.3rem"
              fontWeight="700"
              color="var(--athar-text-title)"
            >
              هل لا يزال لديكم أي استفسار آخر؟
            </Text>
            <Text fontSize="0.92rem" color="var(--athar-text-muted)" mt={0.5}>
              فريق خدمة عملاء أثر مستعد دائماً للإجابة وتنسيق أفضل تفاصيل لفرحكم.
            </Text>
          </Box>

          <a
            href="https://wa.me/201000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%B9%D9%86%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D9%87%D8%A7%D8%AA%D9%81%20%D8%A3%D8%AB%D8%B1."
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <Button
              className="btn-athar-primary"
              size="md"
              px={7}
              flexShrink={0}
            >
              <FaWhatsapp style={{ marginLeft: "8px", fontSize: "1.1rem" }} />
              تحدث معنا على واتساب
            </Button>
          </a>
        </Box>
      </FadeContent>
    </Box>
  </Box>
);
};
