import React, { useState, useRef } from "react";
import { Box, Flex, HStack, Text, Button } from "@chakra-ui/react";
import { FaLock, FaKey, FaArrowRight } from "react-icons/fa";

interface MemoryPinLockGateProps {
  coupleTitle: string;
  expectedPin?: string;
  onUnlock: () => void;
  onBackToLanding?: () => void;
}

export const MemoryPinLockGate: React.FC<MemoryPinLockGateProps> = ({
  coupleTitle,
  expectedPin = "1234",
  onUnlock,
  onBackToLanding,
}) => {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const char = val.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError(false);

    // Auto-advance
    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-check on 4 digits
    if (char && index === 3) {
      const entered = newDigits.join("");
      if (entered === expectedPin) {
        onUnlock();
      } else {
        setError(true);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleUseDemoPin = () => {
    const demoArray = expectedPin.split("").slice(0, 4);
    setDigits(demoArray);
    onUnlock();
  };

  return (
    <Box
      minH="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        maxW="440px"
        w="100%"
        bg="#FBF7F2"
        borderRadius="30px"
        p={{ base: 6, sm: 8 }}
        border="1px solid rgba(107, 29, 40, 0.12)"
        boxShadow="0 20px 48px -12px rgba(107, 29, 40, 0.18)"
        textAlign="center"
      >
        {/* Padlock Icon */}
        <Flex
          w="64px"
          h="64px"
          borderRadius="full"
          bg="var(--athar-maroon, #6B1D28)"
          color="#F1E5D1"
          align="center"
          justify="center"
          mx="auto"
          mb={4}
          boxShadow="0 8px 24px rgba(107, 29, 40, 0.25)"
        >
          <FaLock size={26} />
        </Flex>

        <Text
          fontSize="1.4rem"
          fontFamily="'Playfair Display', 'Amiri', serif"
          fontWeight="700"
          color="var(--athar-text-title, #231F20)"
          mb={1}
        >
          A Private Memory Vault
        </Text>
        <Text fontSize="0.88rem" color="var(--athar-text-muted, #7A6F6D)" mb={6}>
          Please enter the 4-digit PIN provided by {coupleTitle} to view their audio memories.
        </Text>

        {/* 4-Digit Input Boxes */}
        <HStack gap={3} justify="center" mb={4}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              style={{
                width: "56px",
                height: "64px",
                textAlign: "center",
                fontSize: "1.8rem",
                fontWeight: "700",
                borderRadius: "16px",
                border: error
                  ? "2px solid #C53030"
                  : "2px solid rgba(107, 29, 40, 0.2)",
                backgroundColor: "#FFFFFF",
                outline: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                color: "#6B1D28",
              }}
            />
          ))}
        </HStack>

        {error && (
          <Text fontSize="0.82rem" color="#C53030" fontWeight="600" mb={3}>
            Incorrect PIN. Please try again.
          </Text>
        )}

        {/* Demo Shortcut */}
        <Button
          onClick={handleUseDemoPin}
          variant="plain"
          size="sm"
          color="var(--athar-maroon, #6B1D28)"
          fontSize="0.82rem"
          fontWeight="600"
          mb={4}
          _hover={{ textDecoration: "underline" }}
        >
          <FaKey style={{ marginRight: "6px" }} />
          Auto-fill Demo PIN ({expectedPin})
        </Button>

        {/* Back Link */}
        {onBackToLanding && (
          <Button
            onClick={onBackToLanding}
            variant="outline"
            w="100%"
            borderRadius="full"
            borderColor="rgba(107, 29, 40, 0.15)"
            color="var(--athar-text-body, #4A4240)"
            size="sm"
            py={3}
            _hover={{ bg: "white" }}
          >
            Return to Homepage
            <FaArrowRight style={{ marginLeft: "6px" }} />
          </Button>
        )}
      </Box>
    </Box>
  );
};
