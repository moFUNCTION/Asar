import React, { useState } from "react";
import { Box, Flex, HStack, Text, Button, Image } from "@chakra-ui/react";
import { FaPlay, FaPause, FaChevronRight, FaRedo } from "react-icons/fa";

interface VideoHighlightCardProps {
  mode?: "banner" | "full";
  thumbnailUrl?: string;
  videoTitle?: string;
  videoSubtitle?: string;
  coupleTitle?: string;
  onClickBanner?: () => void;
}

export const VideoHighlightCard: React.FC<VideoHighlightCardProps> = ({
  mode = "banner",
  thumbnailUrl = "/assets/booth-hero-photo.webp",
  videoTitle = "VIDEO HIGHLIGHT",
  videoSubtitle = "30 Seconds of Your Day",
  coupleTitle = "Mina & Maryam",
  onClickBanner,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // If in banner mode matching Image #1 directly below voice cards:
  if (mode === "banner") {
    return (
      <Box
        as="div"
        w="100%"
        maxW="1100px"
        mx="auto"
        mt={4}
        p={3}
        bg="rgba(255, 255, 255, 0.94)"
        borderRadius="22px"
        border="1px solid rgba(107, 29, 40, 0.08)"
        boxShadow="0 4px 16px -4px rgba(107, 29, 40, 0.04)"
        cursor="pointer"
        onClick={onClickBanner}
        transition="all 0.25s ease"
        _hover={{
          borderColor: "rgba(212, 175, 55, 0.5)",
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px -6px rgba(107, 29, 40, 0.12)",
        }}
      >
        <Flex align="center" justify="space-between" gap={4}>
          {/* Left Thumbnail with centered play button & overlay */}
          <Flex align="center" gap={4}>
            <Box
              position="relative"
              w={{ base: "110px", sm: "140px" }}
              h={{ base: "72px", sm: "84px" }}
              borderRadius="16px"
              overflow="hidden"
              flexShrink={0}
            >
              <Image
                src={thumbnailUrl}
                alt="Video highlight thumbnail"
                w="100%"
                h="100%"
                objectFit="cover"
              />
              <Box
                position="absolute"
                inset="0"
                bg="rgba(35, 31, 32, 0.35)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {/* Centered White Circular Play Button */}
                <Box
                  w="36px"
                  h="36px"
                  borderRadius="full"
                  bg="white"
                  color="var(--athar-maroon, #6B1D28)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 4px 12px rgba(0,0,0,0.25)"
                >
                  <FaPlay size={12} style={{ marginLeft: "2px" }} />
                </Box>
              </Box>
            </Box>

            {/* Middle: Video Highlight Labels */}
            <Box>
              <Text
                fontSize={{ base: "0.82rem", sm: "0.92rem" }}
                fontWeight="800"
                color="var(--athar-maroon-dark, #5B1621)"
                letterSpacing="0.1em"
                textTransform="uppercase"
              >
                {videoTitle}
              </Text>
              <Text
                fontSize={{ base: "0.82rem", sm: "0.9rem" }}
                color="var(--athar-text-body, #4A4240)"
                fontWeight="500"
              >
                {videoSubtitle}
              </Text>
            </Box>
          </Flex>

          {/* Right: Chevron Arrow */}
          <Box pr={2} color="#7A6F6D">
            <FaChevronRight size={16} />
          </Box>
        </Flex>
      </Box>
    );
  }

  // Full Player Mode (for the Video Highlights Tab)
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // Simulate 30s playback
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 300);
    }
  };

  return (
    <Box w="100%" maxW="900px" mx="auto" px={{ base: 3, sm: 6 }} py={4}>
      <Box
        borderRadius="28px"
        overflow="hidden"
        bg="#1F1A1C"
        boxShadow="0 20px 48px -12px rgba(0, 0, 0, 0.45)"
        border="1px solid rgba(212, 175, 55, 0.4)"
      >
        {/* Video Player Display Container */}
        <Box position="relative" minH={{ base: "360px", sm: "440px", md: "500px" }} w="100%">
          <Image
            src={thumbnailUrl}
            alt="Cinematic Video Highlight"
            w="100%"
            h="100%"
            position="absolute"
            inset="0"
            objectFit="cover"
            filter={isPlaying ? "none" : "brightness(0.85)"}
            transition="filter 0.3s ease"
          />

          {/* Cinematic Overlay */}
          <Box
            position="absolute"
            inset="0"
            bg="linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)"
          />

          {/* Centered Play Trigger Button */}
          {!isPlaying && (
            <Flex
              position="absolute"
              inset="0"
              align="center"
              justify="center"
              zIndex="3"
            >
              <Button
                onClick={handleTogglePlay}
                w="72px"
                h="72px"
                minW="0"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.95)"
                color="var(--athar-maroon, #6B1D28)"
                boxShadow="0 10px 30px rgba(0,0,0,0.5)"
                _hover={{ transform: "scale(1.1)", bg: "#FFFFFF" }}
                transition="all 0.25s ease"
              >
                <FaPlay size={24} style={{ marginLeft: "4px" }} />
              </Button>
            </Flex>
          )}

          {/* Bottom Player Overlay Bar */}
          <Box position="absolute" bottom="0" left="0" right="0" p={{ base: 4, sm: 6 }} zIndex="4">
            <Flex align="center" justify="space-between" mb={2}>
              <Box>
                <Text fontSize="0.75rem" fontWeight="700" color="#D4AF37" letterSpacing="0.14em">
                  {videoTitle}
                </Text>
                <Text fontSize="1.1rem" fontWeight="700" color="white">
                  30 Seconds of {coupleTitle}
                </Text>
              </Box>

              <HStack gap={2}>
                <Button
                  size="sm"
                  variant="plain"
                  p={2}
                  color="white"
                  onClick={() => {
                    setProgress(0);
                    setIsPlaying(true);
                  }}
                  aria-label="Replay Video"
                >
                  <FaRedo size={14} />
                </Button>

                <Button
                  size="sm"
                  borderRadius="full"
                  bg="var(--athar-maroon, #6B1D28)"
                  color="white"
                  px={4}
                  py={2}
                  onClick={handleTogglePlay}
                >
                  {isPlaying ? (
                    <>
                      <FaPause style={{ marginRight: "6px" }} size={12} />
                      Pause
                    </>
                  ) : (
                    <>
                      <FaPlay style={{ marginRight: "6px" }} size={12} />
                      Play Highlight
                    </>
                  )}
                </Button>
              </HStack>
            </Flex>

            {/* Video Progress Bar */}
            <Box h="4px" w="100%" bg="rgba(255,255,255,0.25)" borderRadius="full" overflow="hidden">
              <Box
                h="100%"
                w={`${progress}%`}
                bg="#D4AF37"
                transition="width 0.3s linear"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
