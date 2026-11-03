import React, { useState } from "react";
import { Box, Flex, HStack, Text, Button, Image } from "@chakra-ui/react";
import { FaPlay, FaPause, FaTimes, FaVolumeUp, FaVolumeMute, FaUndo, FaRedo } from "react-icons/fa";
import type { VoiceRecord } from "./types";

interface AudioPlayerBarProps {
  currentRecord: VoiceRecord | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onClose: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentRecord,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onClose,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  if (!currentRecord) return null;

  const effectiveDuration = duration || currentRecord.durationSeconds || 42;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * effectiveDuration);
  };

  const handleSkip = (delta: number) => {
    const nextTime = Math.max(0, Math.min(effectiveDuration, currentTime + delta));
    onSeek(nextTime);
  };

  const initials = currentRecord.speakerName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Box
      position="fixed"
      bottom={{ base: "84px", md: "88px" }} // Above the sticky MemoryActionBar
      left="0"
      right="0"
      zIndex="50"
      px={{ base: 3, md: 6 }}
      pointerEvents="none"
    >
      <Box
        maxW="900px"
        mx="auto"
        bg="rgba(251, 247, 242, 0.96)"
        backdropFilter="blur(20px)"
        borderRadius="22px"
        p={{ base: 3, md: 3.5 }}
        border="1px solid rgba(107, 29, 40, 0.14)"
        boxShadow="0 16px 40px -10px rgba(107, 29, 40, 0.25)"
        pointerEvents="auto"
        transition="all 0.3s ease"
      >
        <Flex align="center" justify="space-between" gap={{ base: 2, md: 4 }}>
          {/* Left: Speaker Details */}
          <HStack gap={3} minW={{ base: "130px", sm: "190px" }} flexShrink={0}>
            {currentRecord.avatarUrl ? (
              <Image
                src={currentRecord.avatarUrl}
                alt={currentRecord.speakerName}
                w="38px"
                h="38px"
                borderRadius="full"
                objectFit="cover"
                border="1.5px solid #D4AF37"
              />
            ) : (
              <Flex
                w="38px"
                h="38px"
                borderRadius="full"
                bg="var(--athar-maroon, #6B1D28)"
                color="#F1E5D1"
                align="center"
                justify="center"
                fontSize="0.82rem"
                fontWeight="700"
              >
                {initials}
              </Flex>
            )}

            <Box minW="0">
              <Text
                fontSize={{ base: "0.85rem", sm: "0.92rem" }}
                fontWeight="700"
                color="var(--athar-text-title, #231F20)"
                lineClamp={1}
              >
                {currentRecord.speakerName}
              </Text>
              <Text
                fontSize="0.72rem"
                color="var(--athar-text-muted, #7A6F6D)"
                lineClamp={1}
              >
                {currentRecord.speakerRole}
              </Text>
            </Box>
          </HStack>

          {/* Center: Controls & Scrubber Bar */}
          <Flex direction="column" align="center" flex="1" maxW="480px">
            <HStack gap={2} mb={1}>
              <Button
                variant="plain"
                size="xs"
                p={1}
                color="#7A6F6D"
                onClick={() => handleSkip(-5)}
                aria-label="Rewind 5 seconds"
                _hover={{ color: "var(--athar-maroon, #6B1D28)" }}
              >
                <FaUndo size={11} />
              </Button>

              <Button
                onClick={onPlayPause}
                w="34px"
                h="34px"
                minW="0"
                borderRadius="full"
                bg="var(--athar-maroon, #6B1D28)"
                color="white"
                p={0}
                boxShadow="0 4px 10px rgba(107, 29, 40, 0.25)"
                _hover={{ bg: "var(--athar-maroon-dark, #5B1621)", transform: "scale(1.05)" }}
              >
                {isPlaying ? <FaPause size={12} /> : <FaPlay size={11} style={{ marginLeft: "2px" }} />}
              </Button>

              <Button
                variant="plain"
                size="xs"
                p={1}
                color="#7A6F6D"
                onClick={() => handleSkip(5)}
                aria-label="Fast-forward 5 seconds"
                _hover={{ color: "var(--athar-maroon, #6B1D28)" }}
              >
                <FaRedo size={11} />
              </Button>
            </HStack>

            {/* Scrubber Track */}
            <Flex align="center" w="100%" gap={2}>
              <Text fontSize="0.72rem" fontWeight="600" color="var(--athar-text-muted, #7A6F6D)" w="30px" textAlign="right">
                {formatTime(currentTime)}
              </Text>

              <Box
                flex="1"
                h="6px"
                borderRadius="full"
                bg="rgba(107, 29, 40, 0.12)"
                cursor="pointer"
                position="relative"
                onClick={handleSliderClick}
              >
                <Box
                  h="100%"
                  borderRadius="full"
                  bg="var(--athar-maroon, #6B1D28)"
                  w={`${progressPercent}%`}
                  transition="width 0.1s linear"
                />
              </Box>

              <Text fontSize="0.72rem" fontWeight="600" color="var(--athar-text-muted, #7A6F6D)" w="30px">
                {formatTime(effectiveDuration)}
              </Text>
            </Flex>
          </Flex>

          {/* Right: Mute & Close */}
          <HStack gap={1} flexShrink={0}>
            <Button
              variant="plain"
              size="sm"
              p={1.5}
              minW="28px"
              h="28px"
              borderRadius="full"
              color={isMuted ? "#C53030" : "#7A6F6D"}
              onClick={() => setIsMuted(!isMuted)}
              aria-label="Mute toggle"
              _hover={{ color: "var(--athar-maroon, #6B1D28)" }}
            >
              {isMuted ? <FaVolumeMute size={13} /> : <FaVolumeUp size={13} />}
            </Button>

            <Button
              variant="plain"
              size="sm"
              p={1.5}
              minW="28px"
              h="28px"
              borderRadius="full"
              color="#7A6F6D"
              onClick={onClose}
              aria-label="Close Player Bar"
              _hover={{ color: "var(--athar-maroon, #6B1D28)", bg: "rgba(107, 29, 40, 0.06)" }}
            >
              <FaTimes size={13} />
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};
