import React, { useState } from "react";
import { Box, Flex, SimpleGrid, Text, HStack, Button, Image } from "@chakra-ui/react";
import { FaTimes, FaDownload, FaExpand } from "react-icons/fa";
import type { MediaPhoto } from "./types";

interface PhotoGalleryGridProps {
  photos: MediaPhoto[];
}

export const PhotoGalleryGrid: React.FC<PhotoGalleryGridProps> = ({ photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<MediaPhoto | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = ["All", "Around The Phone", "Couple", "Celebration"];

  const filteredPhotos =
    activeFilter === "All"
      ? photos
      : photos.filter((p) => p.category === activeFilter);

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
          Moments Around The Phone
        </Text>
        <Text fontSize="0.9rem" color="var(--athar-text-muted, #7A6F6D)">
          Candid snapshots of loved ones sharing their heartfelt voices and smiles.
        </Text>

        {/* Filter Pills */}
        <HStack gap={2} mt={4} flexWrap="wrap" justify="center">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              borderRadius="full"
              px={4}
              py={2}
              fontSize="0.82rem"
              fontWeight="600"
              bg={activeFilter === cat ? "var(--athar-maroon, #6B1D28)" : "#F4EFEA"}
              color={activeFilter === cat ? "white" : "var(--athar-text-body, #4A4240)"}
              border="1px solid"
              borderColor={
                activeFilter === cat
                  ? "var(--athar-maroon, #6B1D28)"
                  : "rgba(107, 29, 40, 0.08)"
              }
              onClick={() => setActiveFilter(cat)}
              _hover={{
                bg: activeFilter === cat ? "var(--athar-maroon, #6B1D28)" : "#EDE6DC",
              }}
            >
              {cat}
            </Button>
          ))}
        </HStack>
      </Flex>

      {/* Responsive Masonry-like Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={5}>
        {filteredPhotos.map((photo) => (
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
            onClick={() => setSelectedPhoto(photo)}
          >
            <Box position="relative" h="280px" w="100%">
              <Image
                src={photo.url}
                alt={photo.caption}
                w="100%"
                h="100%"
                objectFit="cover"
                transition="transform 0.4s ease"
                _hover={{ transform: "scale(1.03)" }}
              />

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
                    {photo.caption}
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

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <Box
          position="fixed"
          inset="0"
          zIndex="100"
          bg="rgba(15, 10, 12, 0.88)"
          backdropFilter="blur(14px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={{ base: 4, md: 8 }}
          onClick={() => setSelectedPhoto(null)}
        >
          <Box
            maxW="800px"
            w="100%"
            bg="white"
            borderRadius="24px"
            overflow="hidden"
            boxShadow="0 25px 60px rgba(0,0,0,0.4)"
            onClick={(e) => e.stopPropagation()}
          >
            <Box position="relative" maxH="70vh" w="100%" bg="#000">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                w="100%"
                h="100%"
                maxH="70vh"
                objectFit="contain"
                display="block"
                mx="auto"
              />
              <Button
                position="absolute"
                top={4}
                right={4}
                variant="plain"
                bg="rgba(0,0,0,0.6)"
                color="white"
                borderRadius="full"
                p={2}
                minW="36px"
                h="36px"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Close Lightbox"
                _hover={{ bg: "rgba(0,0,0,0.8)" }}
              >
                <FaTimes size={15} />
              </Button>
            </Box>

            <Flex justify="space-between" align="center" p={4} bg="#FBF7F2">
              <Text fontSize="0.95rem" fontWeight="600" color="var(--athar-text-title, #231F20)">
                {selectedPhoto.caption}
              </Text>
              <a
                href={selectedPhoto.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  borderRadius="full"
                  borderColor="rgba(107, 29, 40, 0.2)"
                  color="var(--athar-maroon, #6B1D28)"
                  _hover={{ bg: "white" }}
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
