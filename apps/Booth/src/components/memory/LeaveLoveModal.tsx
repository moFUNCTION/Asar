import React, { useState } from "react";
import { Box, Flex, HStack, Text, Button } from "@chakra-ui/react";
import { FaTimes, FaHeart, FaPenNib } from "react-icons/fa";
import type { GuestBookNote } from "./types";

interface LeaveLoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupleTitle: string;
  onAddNote: (note: GuestBookNote) => void;
}

export const LeaveLoveModal: React.FC<LeaveLoveModalProps> = ({
  isOpen,
  onClose,
  coupleTitle,
  onAddNote,
}) => {
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("Friend");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) return;

    const newNote: GuestBookNote = {
      id: `gb-${Date.now()}`,
      authorName: authorName.trim(),
      authorRole: authorRole.trim() || "Guest",
      message: message.trim(),
      date: "Today",
      likes: 1,
      isLiked: true,
    };

    onAddNote(newNote);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setAuthorName("");
      setMessage("");
      onClose();
    }, 1500);
  };

  return (
    <Box
      position="fixed"
      inset="0"
      zIndex="120"
      bg="rgba(15, 10, 12, 0.75)"
      backdropFilter="blur(14px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={onClose}
    >
      <Box
        maxW="520px"
        w="100%"
        bg="#FBF7F2"
        borderRadius="28px"
        p={{ base: 6, sm: 8 }}
        boxShadow="0 25px 60px rgba(0,0,0,0.3)"
        border="1px solid rgba(107, 29, 40, 0.12)"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={4}>
          <HStack gap={2.5}>
            <Box
              w="36px"
              h="36px"
              borderRadius="full"
              bg="rgba(107, 29, 40, 0.08)"
              color="var(--athar-maroon, #6B1D28)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaPenNib size={15} />
            </Box>
            <Box>
              <Text fontSize="1.15rem" fontWeight="700" color="var(--athar-text-title, #231F20)">
                Leave a Blessing
              </Text>
              <Text fontSize="0.78rem" color="var(--athar-text-muted, #7A6F6D)">
                For {coupleTitle}
              </Text>
            </Box>
          </HStack>

          <Button
            variant="plain"
            size="sm"
            p={1}
            color="#7A6F6D"
            onClick={onClose}
            aria-label="Close Modal"
          >
            <FaTimes size={16} />
          </Button>
        </Flex>

        {isSuccess ? (
          <Flex direction="column" align="center" justify="center" py={8} textAlign="center">
            <Box color="#D4AF37" mb={3}>
              <FaHeart size={42} />
            </Box>
            <Text fontSize="1.2rem" fontWeight="700" color="var(--athar-maroon, #6B1D28)">
              Thank You!
            </Text>
            <Text fontSize="0.9rem" color="var(--athar-text-body, #4A4240)" mt={1}>
              Your love note has been added to {coupleTitle}&apos;s memory vault.
            </Text>
          </Flex>
        ) : (
          <form onSubmit={handleSubmit}>
            <Box mb={4}>
              <Text fontSize="0.85rem" fontWeight="600" mb={1.5} color="var(--athar-text-title, #231F20)">
                Your Name
              </Text>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Mansour"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(107, 29, 40, 0.18)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </Box>

            <Box mb={4}>
              <Text fontSize="0.85rem" fontWeight="600" mb={1.5} color="var(--athar-text-title, #231F20)">
                Your Relationship / Role
              </Text>
              <select
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(107, 29, 40, 0.18)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              >
                <option value="Best Friend">Best Friend</option>
                <option value="Friend">Friend</option>
                <option value="Family">Family</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Cousin">Cousin</option>
                <option value="Colleague">Colleague</option>
                <option value="Special Guest">Special Guest</option>
              </select>
            </Box>

            <Box mb={5}>
              <Text fontSize="0.85rem" fontWeight="600" mb={1.5} color="var(--athar-text-title, #231F20)">
                Your Message & Blessing
              </Text>
              <textarea
                required
                rows={4}
                dir="auto"
                placeholder="Write your prayers, warm memories, or heartfelt wishes..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(107, 29, 40, 0.18)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "0.95rem",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </Box>

            <Button
              type="submit"
              w="100%"
              py={4}
              bg="var(--athar-maroon, #6B1D28)"
              color="white"
              borderRadius="full"
              fontWeight="700"
              fontSize="0.95rem"
              boxShadow="0 4px 14px rgba(107, 29, 40, 0.25)"
              _hover={{
                bg: "var(--athar-maroon-dark, #5B1621)",
                transform: "translateY(-1px)",
              }}
            >
              Post Love Note
            </Button>
          </form>
        )}
      </Box>
    </Box>
  );
};
