import React, { useState } from "react";
import { Box, Flex, HStack, Text, Button, Image } from "@chakra-ui/react";
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaEllipsisV, FaDownload, FaShareAlt, FaCopy, FaCheck } from "react-icons/fa";
import type { VoiceRecord } from "./types";

interface VoiceCardProps {
  record: VoiceRecord;
  isPlaying: boolean;
  currentTime: number;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onToggleLike?: (id: string) => void;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({
  record,
  isPlaying,
  currentTime,
  onPlayPause,
  onSeek,
  onToggleLike,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const duration = record.durationSeconds || 42;
  const progressPercent = isPlaying ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const activeBarIndex = Math.floor((progressPercent / 100) * (record.waveformPeaks.length || 48));

  // Format current seconds as mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`"${record.quoteSnippet}" — ${record.speakerName} (${record.speakerRole})`);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
    setShowMenu(false);
  };

  const handleShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?memory=mina-and-maryam&voice=${record.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    setShowMenu(false);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate/trigger voice audio download
    const link = document.createElement("a");
    link.href = record.audioUrl || "#";
    link.download = `${record.speakerName}_${record.speakerRole}_athar_memory.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  // Monogram initials fallback
  const initials = record.speakerName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Box
      position="relative"
      bg="rgba(255, 255, 255, 0.94)"
      borderRadius="20px"
      p={{ base: 3.5, sm: 4, md: 5 }}
      border="1px solid"
      borderColor={isPlaying ? "var(--athar-maroon, #6B1D28)" : "rgba(107, 29, 40, 0.08)"}
      boxShadow={
        isPlaying
          ? "0 12px 32px -8px rgba(107, 29, 40, 0.18)"
          : "0 4px 16px -4px rgba(107, 29, 40, 0.03)"
      }
      transition="all 0.25s ease"
      _hover={{
        borderColor: "rgba(212, 175, 55, 0.45)",
        boxShadow: "0 8px 24px -6px rgba(107, 29, 40, 0.08)",
      }}
    >
      <Flex
        direction={{ base: "column", lg: "row" }}
        align={{ base: "stretch", lg: "center" }}
        justify="space-between"
        gap={{ base: 3, md: 4 }}
      >
        {/* Left Side: Avatar + Play Button + Speaker Details */}
        <Flex align="center" gap={{ base: 3, sm: 3.5 }} flex="1" minW="0">
          {/* Avatar Container */}
          <Box position="relative" flexShrink={0}>
            {record.avatarUrl ? (
              <Image
                src={record.avatarUrl}
                alt={record.speakerName}
                w={{ base: "44px", sm: "48px" }}
                h={{ base: "44px", sm: "48px" }}
                borderRadius="full"
                objectFit="cover"
                border="2px solid #D4AF37"
              />
            ) : (
              <Flex
                w={{ base: "44px", sm: "48px" }}
                h={{ base: "44px", sm: "48px" }}
                borderRadius="full"
                bg="var(--athar-maroon, #6B1D28)"
                color="#F1E5D1"
                align="center"
                justify="center"
                fontWeight="700"
                fontSize="0.9rem"
                border="2px solid #D4AF37"
              >
                {initials}
              </Flex>
            )}
          </Box>

          {/* 36px Royal Maroon Play/Pause Button */}
          <Button
            onClick={onPlayPause}
            aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
            w={{ base: "36px", sm: "40px" }}
            h={{ base: "36px", sm: "40px" }}
            minW="0"
            borderRadius="full"
            bg="var(--athar-maroon, #6B1D28)"
            color="white"
            flexShrink={0}
            p={0}
            boxShadow="0 4px 12px rgba(107, 29, 40, 0.25)"
            _hover={{
              bg: "var(--athar-maroon-dark, #5B1621)",
              transform: "scale(1.06)",
            }}
            transition="all 0.2s ease"
          >
            {isPlaying ? (
              <FaPause size={13} />
            ) : (
              <FaPlay size={12} style={{ marginLeft: "2px" }} />
            )}
          </Button>

          {/* Speaker Info & Quote Snippet */}
          <Box flex="1" minW="0">
            <HStack gap={2} align="baseline" flexWrap="wrap">
              <Text
                fontSize={{ base: "0.92rem", sm: "0.98rem" }}
                fontWeight="700"
                color="var(--athar-text-title, #231F20)"
                whiteSpace="nowrap"
              >
                {record.speakerName}
              </Text>
              <Text
                fontSize={{ base: "0.75rem", sm: "0.8rem" }}
                fontWeight="500"
                color="var(--athar-text-muted, #7A6F6D)"
              >
                {record.speakerRole}
              </Text>
            </HStack>

            <Text
              fontSize={{ base: "0.82rem", sm: "0.86rem" }}
              fontStyle="italic"
              color="var(--athar-text-body, #4A4240)"
              mt={0.5}
              lineClamp={1}
              dir="auto"
            >
              “{record.quoteSnippet}”
            </Text>
          </Box>
        </Flex>

        {/* Center-Right: 48-Bar Waveform Scrubber & Duration */}
        <Flex
          align="center"
          gap={3}
          flex={{ base: "1", lg: "0 0 340px" }}
          w="100%"
          justify={{ base: "space-between", lg: "flex-end" }}
        >
          {/* Interactive 48-Bar Waveform */}
          <Box
            flex="1"
            h="36px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            cursor="pointer"
            onClick={handleWaveformClick}
            px={1}
            borderRadius="8px"
            _hover={{ bg: "rgba(107, 29, 40, 0.03)" }}
            title="Click along waveform to scrub audio"
          >
            {record.waveformPeaks.map((peak, index) => {
              const isPassed = isPlaying && index <= activeBarIndex;
              const barHeight = Math.max(4, Math.round(peak * 26));

              return (
                <Box
                  key={index}
                  w="2.5px"
                  h={`${barHeight}px`}
                  borderRadius="full"
                  bg={isPassed ? "var(--athar-maroon, #6B1D28)" : "#D5CDC5"}
                  transition="background-color 0.15s ease, height 0.15s ease"
                />
              );
            })}
          </Box>

          {/* Duration Indicator */}
          <Text
            fontSize="0.82rem"
            fontWeight="600"
            color={isPlaying ? "var(--athar-maroon, #6B1D28)" : "var(--athar-text-muted, #7A6F6D)"}
            w="38px"
            textAlign="right"
            fontVariantNumeric="tabular-nums"
          >
            {isPlaying ? formatTime(currentTime) : record.durationFormatted}
          </Text>

          {/* Right Action Icons: Favorite & 3-Dots */}
          <HStack gap={1}>
            {/* Heart Toggle Button */}
            <Button
              variant="plain"
              size="sm"
              p={1.5}
              minW="32px"
              h="32px"
              borderRadius="full"
              color={record.isLiked ? "#C53030" : "#A09895"}
              onClick={() => onToggleLike && onToggleLike(record.id)}
              aria-label={record.isLiked ? "Unlike message" : "Like message"}
              _hover={{ color: "#C53030", transform: "scale(1.15)" }}
              transition="all 0.2s ease"
            >
              {record.isLiked ? <FaHeart size={15} /> : <FaRegHeart size={15} />}
            </Button>

            {/* Three-dots menu button */}
            <Box position="relative">
              <Button
                variant="plain"
                size="sm"
                p={1.5}
                minW="32px"
                h="32px"
                borderRadius="full"
                color="#7A6F6D"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="More Options"
                _hover={{ bg: "rgba(107, 29, 40, 0.06)", color: "var(--athar-maroon, #6B1D28)" }}
              >
                <FaEllipsisV size={13} />
              </Button>

              {/* Compact Floating Popover Menu */}
              {showMenu && (
                <Box
                  position="absolute"
                  top="100%"
                  right="0"
                  mt={1}
                  zIndex="30"
                  bg="white"
                  borderRadius="14px"
                  boxShadow="0 10px 25px -5px rgba(0,0,0,0.15)"
                  border="1px solid rgba(107, 29, 40, 0.1)"
                  py={1.5}
                  minW="180px"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="plain"
                    w="100%"
                    justifyContent="flex-start"
                    px={3.5}
                    py={2}
                    fontSize="0.82rem"
                    color="var(--athar-text-body, #4A4240)"
                    onClick={handleDownload}
                    _hover={{ bg: "rgba(107, 29, 40, 0.05)" }}
                  >
                    <FaDownload style={{ marginRight: "8px", color: "#6B1D28" }} size={12} />
                    Download Voice (.mp3)
                  </Button>

                  <Button
                    variant="plain"
                    w="100%"
                    justifyContent="flex-start"
                    px={3.5}
                    py={2}
                    fontSize="0.82rem"
                    color="var(--athar-text-body, #4A4240)"
                    onClick={handleShareLink}
                    _hover={{ bg: "rgba(107, 29, 40, 0.05)" }}
                  >
                    {copiedLink ? (
                      <FaCheck style={{ marginRight: "8px", color: "#2E7D32" }} size={12} />
                    ) : (
                      <FaShareAlt style={{ marginRight: "8px", color: "#6B1D28" }} size={12} />
                    )}
                    {copiedLink ? "Link Copied!" : "Share Voice Link"}
                  </Button>

                  <Button
                    variant="plain"
                    w="100%"
                    justifyContent="flex-start"
                    px={3.5}
                    py={2}
                    fontSize="0.82rem"
                    color="var(--athar-text-body, #4A4240)"
                    onClick={handleCopyQuote}
                    _hover={{ bg: "rgba(107, 29, 40, 0.05)" }}
                  >
                    {copiedQuote ? (
                      <FaCheck style={{ marginRight: "8px", color: "#2E7D32" }} size={12} />
                    ) : (
                      <FaCopy style={{ marginRight: "8px", color: "#6B1D28" }} size={12} />
                    )}
                    {copiedQuote ? "Quote Copied!" : "Copy Quote"}
                  </Button>
                </Box>
              )}
            </Box>
          </HStack>
        </Flex>
      </Flex>
    </Box>
  );
};
