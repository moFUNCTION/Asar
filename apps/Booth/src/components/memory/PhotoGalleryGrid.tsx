import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Flex, SimpleGrid, Text, HStack, Button, Image } from "@chakra-ui/react";
import {
  FaTimes,
  FaDownload,
  FaExpand,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import {
  type MediaPhoto,
  type PhotoGalleryGridProps,
  extractCategories,
  filterPhotosByCategory,
  getNextLightboxIndex,
  getPrevLightboxIndex,
} from "./types";

export type { PhotoGalleryGridProps };

export const PhotoGalleryGrid: React.FC<PhotoGalleryGridProps> = ({
  photos = [],
  categories: explicitCategories,
  title = "Moments Around The Phone",
  subtitle = "Candid snapshots of loved ones sharing their heartfelt voices and smiles.",
  onPhotoClick,
}) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  // Derive dynamic categories from photo collection and optional prop
  const categories = useMemo(
    () => extractCategories(photos, explicitCategories),
    [photos, explicitCategories]
  );

  // Filter photos by currently selected category pill
  const filteredPhotos = useMemo(
    () => filterPhotosByCategory(photos, activeFilter),
    [photos, activeFilter]
  );

  // Keep selected photo synced with index in filtered list
  const selectedPhoto =
    selectedPhotoIndex !== null && filteredPhotos[selectedPhotoIndex]
      ? filteredPhotos[selectedPhotoIndex]
      : null;

  // Keyboard navigation for Fullscreen Lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;

      if (e.key === "Escape") {
        setSelectedPhotoIndex(null);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedPhotoIndex((prev) =>
          prev !== null ? getPrevLightboxIndex(prev, filteredPhotos.length) : null
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedPhotoIndex((prev) =>
          prev !== null ? getNextLightboxIndex(prev, filteredPhotos.length) : null
        );
      }
    },
    [selectedPhotoIndex, filteredPhotos.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleOpenPhoto = (photo: MediaPhoto, index: number) => {
    setSelectedPhotoIndex(index);
    if (onPhotoClick) {
      onPhotoClick(photo, index);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(getPrevLightboxIndex(selectedPhotoIndex, filteredPhotos.length));
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(getNextLightboxIndex(selectedPhotoIndex, filteredPhotos.length));
    }
  };

  return (
    <Box w="100%" maxW="1100px" mx="auto" px={{ base: 3, sm: 6 }} py={4}>
      {/* Gallery Header */}
      <Flex direction="column" align="center" textAlign="center" mb={6}>
        <Text
          fontSize={{ base: "1.4rem", sm: "1.8rem" }}
          fontFamily="'Playfair Display', 'Amiri', serif"
          fontWeight="700"
          color="var(--athar-text-title, #231F20)"
          mb={1}
        >
          {title}
        </Text>
        <Text fontSize="0.9rem" color="var(--athar-text-muted, #7A6F6D)">
          {subtitle}
        </Text>

        {/* Dynamic Category Filter Pills */}
        <HStack gap={2} mt={4} flexWrap="wrap" justify="center">
          {categories.map((cat) => {
            const isSelected = activeFilter === cat;
            return (
              <Button
                key={cat}
                size="sm"
                borderRadius="full"
                px={4}
                py={2}
                fontSize="0.82rem"
                fontWeight="600"
                bg={isSelected ? "var(--athar-maroon, #6B1D28)" : "#F4EFEA"}
                color={isSelected ? "white" : "var(--athar-text-body, #4A4240)"}
                border="1px solid"
                borderColor={
                  isSelected
                    ? "var(--athar-maroon, #6B1D28)"
                    : "rgba(107, 29, 40, 0.08)"
                }
                onClick={() => {
                  setActiveFilter(cat);
                  setSelectedPhotoIndex(null);
                }}
                _hover={{
                  bg: isSelected ? "var(--athar-maroon, #6B1D28)" : "#EDE6DC",
                }}
                transition="all 0.2s ease"
              >
                {cat}
              </Button>
            );
          })}
        </HStack>
      </Flex>

      {/* Empty State */}
      {filteredPhotos.length === 0 && (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={12}
          px={4}
          borderRadius="20px"
          bg="rgba(107, 29, 40, 0.02)"
          border="1px dashed rgba(107, 29, 40, 0.15)"
        >
          <Text fontSize="1rem" fontWeight="600" color="var(--athar-text-title, #231F20)">
            No photos found in category "{activeFilter}"
          </Text>
          <Text fontSize="0.85rem" color="var(--athar-text-muted, #7A6F6D)" mt={1}>
            Switch to "All" to browse all shared memories.
          </Text>
          <Button
            size="sm"
            mt={3}
            borderRadius="full"
            variant="outline"
            borderColor="var(--athar-maroon, #6B1D28)"
            color="var(--athar-maroon, #6B1D28)"
            onClick={() => setActiveFilter("All")}
          >
            Show All Photos
          </Button>
        </Flex>
      )}

      {/* Responsive Masonry-like Grid */}
      {filteredPhotos.length > 0 && (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={5}>
          {filteredPhotos.map((photo, index) => (
            <Box
              key={photo.id}
              position="relative"
              borderRadius="20px"
              overflow="hidden"
              bg="white"
              border="1px solid rgba(107, 29, 40, 0.08)"
              boxShadow="0 4px 14px rgba(107, 29, 40, 0.04)"
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: "0 12px 28px -6px rgba(107, 29, 40, 0.15)",
                borderColor: "rgba(212, 175, 55, 0.5)",
              }}
              onClick={() => handleOpenPhoto(photo, index)}
            >
              <Box position="relative" h="280px" w="100%">
                <Image
                  src={photo.url || photo.imageUrl}
                  alt={photo.caption || photo.alt || "Memory photo"}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  transition="transform 0.4s ease"
                  _hover={{ transform: "scale(1.03)" }}
                />

                {/* Category Pill Tag */}
                {photo.category && (
                  <Box
                    position="absolute"
                    top={3}
                    left={3}
                    bg="rgba(15, 10, 12, 0.65)"
                    backdropFilter="blur(6px)"
                    color="#D4AF37"
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    fontSize="0.7rem"
                    fontWeight="600"
                    letterSpacing="0.04em"
                    border="1px solid rgba(212, 175, 55, 0.3)"
                  >
                    {photo.category}
                  </Box>
                )}

                {/* Hover Overlay with Expand Icon */}
                <Flex
                  position="absolute"
                  inset="0"
                  bg="linear-gradient(180deg, transparent 40%, rgba(35, 31, 32, 0.8) 100%)"
                  align="flex-end"
                  p={4}
                  opacity={0.9}
                >
                  <Flex justify="space-between" align="center" w="100%">
                    <Text fontSize="0.82rem" color="white" fontWeight="600" lineClamp={1}>
                      {photo.caption || photo.alt || "Athar Memory"}
                    </Text>
                    <Box color="#D4AF37" ml={2}>
                      <FaExpand size={13} />
                    </Box>
                  </Flex>
                </Flex>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Enhanced Fullscreen Lightbox Modal */}
      {selectedPhoto && selectedPhotoIndex !== null && (
        <Box
          position="fixed"
          inset="0"
          zIndex="1000"
          bg="rgba(15, 10, 12, 0.92)"
          backdropFilter="blur(16px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={{ base: 3, md: 6 }}
          onClick={() => setSelectedPhotoIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo Lightbox"
        >
          <Box
            maxW="880px"
            w="100%"
            bg="#161214"
            borderRadius="24px"
            overflow="hidden"
            border="1px solid rgba(212, 175, 55, 0.25)"
            boxShadow="0 25px 65px rgba(0,0,0,0.6)"
            onClick={(e) => e.stopPropagation()}
            position="relative"
          >
            {/* Lightbox Top Header: Counter & Close Action */}
            <Flex
              justify="space-between"
              align="center"
              px={5}
              py={3.5}
              bg="rgba(25, 20, 22, 0.95)"
              borderBottom="1px solid rgba(212, 175, 55, 0.15)"
            >
              <HStack gap={3}>
                <Text
                  fontSize="0.84rem"
                  fontWeight="600"
                  color="#D4AF37"
                  letterSpacing="0.05em"
                >
                  Photo {selectedPhotoIndex + 1} of {filteredPhotos.length}
                </Text>
                {selectedPhoto.category && (
                  <Box
                    bg="rgba(212, 175, 55, 0.12)"
                    color="#F2DEC2"
                    px={2.5}
                    py={0.5}
                    borderRadius="full"
                    fontSize="0.72rem"
                    fontWeight="500"
                  >
                    {selectedPhoto.category}
                  </Box>
                )}
              </HStack>

              <Button
                variant="plain"
                bg="rgba(255, 255, 255, 0.08)"
                color="#FBF7F2"
                borderRadius="full"
                p={2}
                minW="34px"
                h="34px"
                onClick={() => setSelectedPhotoIndex(null)}
                aria-label="Close Lightbox (Esc)"
                _hover={{ bg: "rgba(212, 175, 55, 0.2)", color: "#D4AF37" }}
              >
                <FaTimes size={14} />
              </Button>
            </Flex>

            {/* Lightbox Main Stage & Stepper Arrows */}
            <Box position="relative" maxH="68vh" w="100%" bg="#0B090A">
              <Image
                src={selectedPhoto.url || selectedPhoto.imageUrl}
                alt={selectedPhoto.caption || "Fullscreen memory"}
                w="100%"
                h="100%"
                maxH="68vh"
                objectFit="contain"
                display="block"
                mx="auto"
              />

              {/* Prev Arrow Button */}
              {filteredPhotos.length > 1 && (
                <Button
                  position="absolute"
                  left={3}
                  top="50%"
                  transform="translateY(-50%)"
                  variant="plain"
                  bg="rgba(15, 10, 12, 0.65)"
                  color="#FBF7F2"
                  borderRadius="full"
                  p={2}
                  minW="40px"
                  h="40px"
                  onClick={handlePrevPhoto}
                  aria-label="Previous Photo (Left Arrow)"
                  border="1px solid rgba(212, 175, 55, 0.3)"
                  _hover={{ bg: "rgba(212, 175, 55, 0.25)", color: "#D4AF37" }}
                >
                  <FaChevronLeft size={16} />
                </Button>
              )}

              {/* Next Arrow Button */}
              {filteredPhotos.length > 1 && (
                <Button
                  position="absolute"
                  right={3}
                  top="50%"
                  transform="translateY(-50%)"
                  variant="plain"
                  bg="rgba(15, 10, 12, 0.65)"
                  color="#FBF7F2"
                  borderRadius="full"
                  p={2}
                  minW="40px"
                  h="40px"
                  onClick={handleNextPhoto}
                  aria-label="Next Photo (Right Arrow)"
                  border="1px solid rgba(212, 175, 55, 0.3)"
                  _hover={{ bg: "rgba(212, 175, 55, 0.25)", color: "#D4AF37" }}
                >
                  <FaChevronRight size={16} />
                </Button>
              )}
            </Box>

            {/* Lightbox Footer with Caption & Download Action */}
            <Flex
              justify="space-between"
              align="center"
              p={4}
              bg="#1B1618"
              borderTop="1px solid rgba(212, 175, 55, 0.12)"
              flexWrap="wrap"
              gap={3}
            >
              <Text
                fontSize="0.92rem"
                fontWeight="500"
                color="#FBF7F2"
                maxW={{ base: "100%", sm: "70%" }}
              >
                {selectedPhoto.caption || selectedPhoto.alt || "Athar Heirloom Memory"}
              </Text>

              <a
                href={selectedPhoto.url || selectedPhoto.imageUrl}
                download={`athar-memory-${selectedPhoto.id}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  borderRadius="full"
                  borderColor="rgba(212, 175, 55, 0.4)"
                  color="#D4AF37"
                  bg="rgba(212, 175, 55, 0.08)"
                  _hover={{ bg: "#D4AF37", color: "#161214" }}
                  transition="all 0.2s ease"
                >
                  <FaDownload style={{ marginRight: "6px" }} />
                  Save Photo
                </Button>
              </a>
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
};
