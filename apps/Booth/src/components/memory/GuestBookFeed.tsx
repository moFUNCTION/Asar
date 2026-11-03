import React from "react";
import { Box, Flex, HStack, Text, Button } from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaPenNib } from "react-icons/fa";
import type { GuestBookNote } from "./types";

interface GuestBookFeedProps {
  notes: GuestBookNote[];
  onOpenLeaveModal: () => void;
  onToggleLikeNote?: (id: string) => void;
}

export const GuestBookFeed: React.FC<GuestBookFeedProps> = ({
  notes,
  onOpenLeaveModal,
  onToggleLikeNote,
}) => {
  return (
    <Box w="100%" maxW="900px" mx="auto" px={{ base: 3, sm: 6 }} py={4}>
      {/* Feed Header & Action */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
        gap={4}
        mb={6}
        p={5}
        bg="white"
        borderRadius="22px"
        border="1px solid rgba(107, 29, 40, 0.08)"
        boxShadow="0 4px 14px rgba(107, 29, 40, 0.04)"
      >
        <Box>
          <Text
            fontSize={{ base: "1.2rem", sm: "1.4rem" }}
            fontFamily="'Playfair Display', 'Amiri', serif"
            fontWeight="700"
            color="var(--athar-text-title, #231F20)"
          >
            Guest Book & Written Blessings
          </Text>
          <Text fontSize="0.85rem" color="var(--athar-text-muted, #7A6F6D)">
            Cherished written prayers and words of love from family and friends.
          </Text>
        </Box>

        <Button
          bg="var(--athar-maroon, #6B1D28)"
          color="white"
          borderRadius="full"
          px={6}
          py={3}
          fontSize="0.9rem"
          fontWeight="700"
          boxShadow="0 4px 14px rgba(107, 29, 40, 0.2)"
          onClick={onOpenLeaveModal}
          _hover={{
            bg: "var(--athar-maroon-dark, #5B1621)",
            transform: "translateY(-2px)",
          }}
          transition="all 0.2s ease"
        >
          <FaPenNib style={{ marginRight: "8px" }} />
          Leave a Blessing
        </Button>
      </Flex>

      {/* Notes Stream */}
      <Flex direction="column" gap={4}>
        {notes.length === 0 ? (
          <Box
            p={8}
            textAlign="center"
            bg="white"
            borderRadius="20px"
            border="1px dashed rgba(107, 29, 40, 0.2)"
          >
            <Text color="var(--athar-text-muted, #7A6F6D)">
              No written notes left yet. Be the first to leave a blessing for the couple!
            </Text>
          </Box>
        ) : (
          notes.map((note) => (
            <Box
              key={note.id}
              p={{ base: 4, sm: 5 }}
              bg="rgba(255, 255, 255, 0.94)"
              borderRadius="20px"
              border="1px solid rgba(107, 29, 40, 0.08)"
              boxShadow="0 4px 14px -4px rgba(107, 29, 40, 0.03)"
              transition="all 0.2s ease"
              _hover={{
                borderColor: "rgba(212, 175, 55, 0.4)",
                transform: "translateY(-2px)",
              }}
            >
              <Flex justify="space-between" align="flex-start" mb={2}>
                <HStack gap={2.5}>
                  <Flex
                    w="36px"
                    h="36px"
                    borderRadius="full"
                    bg="rgba(107, 29, 40, 0.08)"
                    color="var(--athar-maroon, #6B1D28)"
                    align="center"
                    justify="center"
                    fontWeight="700"
                    fontSize="0.82rem"
                  >
                    {note.authorName[0]}
                  </Flex>
                  <Box>
                    <Text fontSize="0.95rem" fontWeight="700" color="var(--athar-text-title, #231F20)">
                      {note.authorName}
                    </Text>
                    <Text fontSize="0.75rem" color="var(--athar-text-muted, #7A6F6D)">
                      {note.authorRole} · {note.date}
                    </Text>
                  </Box>
                </HStack>

                <Button
                  variant="plain"
                  size="xs"
                  p={1}
                  color={note.isLiked ? "#C53030" : "#A09895"}
                  onClick={() => onToggleLikeNote && onToggleLikeNote(note.id)}
                  aria-label="Like note"
                  _hover={{ color: "#C53030" }}
                >
                  <HStack gap={1}>
                    {note.isLiked ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
                    <Text fontSize="0.75rem">{note.likes}</Text>
                  </HStack>
                </Button>
              </Flex>

              <Text
                fontSize="0.92rem"
                color="var(--athar-text-body, #4A4240)"
                lineHeight="1.6"
                pl={{ sm: 11 }}
                dir="auto"
              >
                {note.message}
              </Text>
            </Box>
          ))
        )}
      </Flex>
    </Box>
  );
};
