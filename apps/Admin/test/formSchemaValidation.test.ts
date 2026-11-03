import { describe, it } from "node:test";
import assert from "node:assert";
import {
  MANDATORY_SYSTEM_FIELDS,
  validateFormSchema,
  enforceMandatoryEmailConstraint,
  generateFieldsFromClientRequests,
  type DynamicFormField,
} from "../src/components/invitation-studio/DynamicFormSchemaBuilder.tsx";

describe("Dynamic RSVP Form Schema Builder & Locked Email Enforcement", () => {
  it("enforces default mandatory system fields contain guestEmail and guestName with locked state", () => {
    const emailField = MANDATORY_SYSTEM_FIELDS.find((f) => f.id === "guestEmail");
    const nameField = MANDATORY_SYSTEM_FIELDS.find((f) => f.id === "guestName");

    assert.ok(emailField, "guestEmail must exist in mandatory system fields");
    assert.strictEqual(emailField.type, "email");
    assert.strictEqual(emailField.required, true);
    assert.strictEqual(emailField.isSystemLocked, true);

    assert.ok(nameField, "guestName must exist in mandatory system fields");
    assert.strictEqual(nameField.type, "text");
    assert.strictEqual(nameField.required, true);
    assert.strictEqual(nameField.isSystemLocked, true);
  });

  it("validates a complete schema with system fields and custom fields successfully", () => {
    const validSchema: DynamicFormField[] = [
      ...MANDATORY_SYSTEM_FIELDS,
      {
        id: "companionsCount",
        label: "Number of Companions",
        type: "select",
        required: true,
        options: ["Just Me", "+1 Guest", "+2 Guests"],
      },
      {
        id: "guestPhone",
        label: "WhatsApp Phone Number",
        type: "tel",
        required: false,
      },
      {
        id: "dietaryPreferences",
        label: "Dietary Restrictions",
        type: "checkbox",
        required: false,
        options: ["Vegetarian", "Gluten-Free", "Nut Allergy"],
      },
      {
        id: "wishesNote",
        label: "Leave a Blessing",
        type: "textarea",
        required: false,
      },
    ];

    const result = validateFormSchema(validSchema);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  it("rejects schema if guestEmail is missing", () => {
    const invalidSchema: DynamicFormField[] = [
      MANDATORY_SYSTEM_FIELDS[0], // guestName only
      {
        id: "guestPhone",
        label: "Phone Number",
        type: "tel",
        required: false,
      },
    ];

    const result = validateFormSchema(invalidSchema);
    assert.strictEqual(result.isValid, false);
    assert.ok(
      result.errors.some((err) => err.includes("guestEmail")),
      "Validation error should specifically mention missing guestEmail"
    );
  });

  it("rejects schema if guestEmail is marked optional (required: false)", () => {
    const tamperedSchema: DynamicFormField[] = [
      MANDATORY_SYSTEM_FIELDS[0],
      {
        id: "guestEmail",
        label: "Email Address",
        type: "email",
        required: false, // Tampered to false
        isSystemLocked: false,
      },
    ];

    const result = validateFormSchema(tamperedSchema);
    assert.strictEqual(result.isValid, false);
    assert.ok(
      result.errors.some((err) => err.includes("must be marked as required")),
      "Validation should reject non-required guestEmail"
    );
  });

  it("rejects schema if guestEmail has incorrect type", () => {
    const tamperedSchema: DynamicFormField[] = [
      MANDATORY_SYSTEM_FIELDS[0],
      {
        id: "guestEmail",
        label: "Email Address",
        type: "text", // Invalid type
        required: true,
        isSystemLocked: true,
      },
    ];

    const result = validateFormSchema(tamperedSchema);
    assert.strictEqual(result.isValid, false);
    assert.ok(
      result.errors.some((err) => err.includes("must have type 'email'")),
      "Validation should reject non-email type for guestEmail"
    );
  });

  it("rejects schema if select, radio, or checkbox fields lack options", () => {
    const invalidSchema: DynamicFormField[] = [
      ...MANDATORY_SYSTEM_FIELDS,
      {
        id: "companionsSelect",
        label: "Number of Companions",
        type: "select",
        required: true,
        options: [], // Empty options array
      },
    ];

    const result = validateFormSchema(invalidSchema);
    assert.strictEqual(result.isValid, false);
    assert.ok(
      result.errors.some((err) => err.includes("must have at least one option")),
      "Validation should require at least one option for select fields"
    );
  });

  it("rejects schema with duplicate field IDs", () => {
    const duplicateSchema: DynamicFormField[] = [
      ...MANDATORY_SYSTEM_FIELDS,
      {
        id: "custom_note",
        label: "Note 1",
        type: "text",
        required: false,
      },
      {
        id: "custom_note",
        label: "Note 2",
        type: "text",
        required: false,
      },
    ];

    const result = validateFormSchema(duplicateSchema);
    assert.strictEqual(result.isValid, false);
    assert.ok(
      result.errors.some((err) => err.includes("Duplicate field ID")),
      "Validation should detect duplicate field IDs"
    );
  });

  it("enforces mandatory email constraint by re-injecting or re-locking guestEmail and guestName", () => {
    // Schema without guestEmail
    const rawSchema: DynamicFormField[] = [
      {
        id: "phone",
        label: "Phone",
        type: "tel",
        required: true,
      },
    ];

    const enforced = enforceMandatoryEmailConstraint(rawSchema);

    const emailField = enforced.find((f) => f.id === "guestEmail");
    const nameField = enforced.find((f) => f.id === "guestName");

    assert.ok(emailField, "enforceMandatoryEmailConstraint must re-insert guestEmail");
    assert.strictEqual(emailField.required, true);
    assert.strictEqual(emailField.isSystemLocked, true);
    assert.strictEqual(emailField.type, "email");

    assert.ok(nameField, "enforceMandatoryEmailConstraint must re-insert guestName");
    assert.strictEqual(nameField.required, true);
    assert.strictEqual(nameField.isSystemLocked, true);
  });

  it("generates correct dynamic fields from client order request strings", () => {
    const requested = [
      "WhatsApp Phone Number",
      "Number of Companions",
      "Attending Side of Family",
      "Dietary Preferences / Food Allergies",
      "Leave a Blessing or Song Request",
    ];

    const fields = generateFieldsFromClientRequests(requested);

    assert.strictEqual(fields.length, 5);

    const phone = fields.find((f) => f.id === "guestPhone");
    assert.ok(phone);
    assert.strictEqual(phone.type, "tel");
    assert.strictEqual(phone.required, true);

    const companions = fields.find((f) => f.id === "companionsCount");
    assert.ok(companions);
    assert.strictEqual(companions.type, "select");
    assert.ok(companions.options && companions.options.length > 0);

    const side = fields.find((f) => f.id === "attendingSide");
    assert.ok(side);
    assert.strictEqual(side.type, "radio");

    const diet = fields.find((f) => f.id === "dietaryPreferences");
    assert.ok(diet);
    assert.strictEqual(diet.type, "checkbox");

    const blessing = fields.find((f) => f.id === "guestBlessing");
    assert.ok(blessing);
    assert.strictEqual(blessing.type, "textarea");
  });

  it("survives serialization and deserialization without losing lock state or data", () => {
    const originalSchema: DynamicFormField[] = [
      ...MANDATORY_SYSTEM_FIELDS,
      {
        id: "custom_vip",
        label: "VIP Code",
        placeholder: "Enter VIP Passcode",
        type: "text",
        required: true,
      },
    ];

    const json = JSON.stringify(originalSchema);
    const parsed: DynamicFormField[] = JSON.parse(json);

    const validation = validateFormSchema(parsed);
    assert.strictEqual(validation.isValid, true);

    const email = parsed.find((f) => f.id === "guestEmail");
    assert.ok(email);
    assert.strictEqual(email.isSystemLocked, true);
    assert.strictEqual(email.required, true);
  });
});
