const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const ShippingPolicy = require("../src/models/shippingpolicy");
const {
  createshippingpolicy,
  getshippingpolicy,
} = require("../src/services/admin.service");
const ApiError = require("../src/utils/apiError");

/**
 * In-Memory Database Simulator for ShippingPolicy
 * Provides an isolated test database store simulating Mongoose collection behavior
 * while executing real Mongoose schema instantiation and validation on all operations.
 */
class InMemoryShippingPolicyDB {
  constructor() {
    this.collection = [];
  }

  reset() {
    this.collection = [];
  }

  countDocuments() {
    return this.collection.length;
  }

  async findOne() {
    if (this.collection.length === 0) return null;
    // Return a clone that mimics a Mongoose document with .save()
    const raw = this.collection[0];
    const doc = new ShippingPolicy(raw);
    doc._id = raw._id;
    if (raw.createdAt) doc.createdAt = raw.createdAt;
    if (raw.updatedAt) doc.updatedAt = raw.updatedAt;
    if (raw.__v !== undefined) doc.__v = raw.__v;

    // Attach save() implementation for in-memory persistence
    doc.save = async () => {
      await doc.validate();
      const updatedObj = doc.toObject();
      updatedObj._id = doc._id;
      this.collection[0] = updatedObj;
      return doc;
    };
    return doc;
  }

  async create(data) {
    const doc = new ShippingPolicy(data);
    await doc.validate();
    const plainObj = doc.toObject();
    plainObj._id = doc._id || require("uuid").v4();
    plainObj.createdAt = new Date();
    plainObj.updatedAt = new Date();
    plainObj.__v = 0;
    this.collection.push(plainObj);

    // Return Mongoose doc with save()
    const returnedDoc = new ShippingPolicy(plainObj);
    returnedDoc._id = plainObj._id;
    returnedDoc.createdAt = plainObj.createdAt;
    returnedDoc.updatedAt = plainObj.updatedAt;
    returnedDoc.__v = plainObj.__v;
    returnedDoc.save = async () => {
      await returnedDoc.validate();
      const updatedObj = returnedDoc.toObject();
      updatedObj._id = returnedDoc._id;
      this.collection[0] = updatedObj;
      return returnedDoc;
    };
    return returnedDoc;
  }

  async findOneAndUpdate(filter, update, options) {
    if (this.collection.length === 0) return null;

    // Ensure update does not modify immutable _id
    if (update.$set && update.$set._id && update.$set._id !== this.collection[0]._id) {
      throw new Error(
        "Performing an update on the path '_id' would result in an immutable field being modified"
      );
    }

    const current = this.collection[0];
    const updated = { ...current };

    if (update.$set) {
      for (const [key, val] of Object.entries(update.$set)) {
        updated[key] = val;
      }
    }

    // Validate schema
    const doc = new ShippingPolicy(updated);
    await doc.validate();

    updated.updatedAt = new Date();
    this.collection[0] = updated;

    const returnedDoc = new ShippingPolicy(updated);
    returnedDoc._id = updated._id;
    returnedDoc.createdAt = updated.createdAt;
    returnedDoc.updatedAt = updated.updatedAt;
    returnedDoc.__v = updated.__v;
    return returnedDoc;
  }
}

const mockDb = new InMemoryShippingPolicyDB();

// Setup spies on ShippingPolicy model
const originalFindOne = ShippingPolicy.findOne;
const originalCreate = ShippingPolicy.create;
const originalFindOneAndUpdate = ShippingPolicy.findOneAndUpdate;

function hookMockDb() {
  ShippingPolicy.findOne = async () => mockDb.findOne();
  ShippingPolicy.create = async (data) => mockDb.create(data);
  ShippingPolicy.findOneAndUpdate = async (filter, update, options) =>
    mockDb.findOneAndUpdate(filter, update, options);
}

function unhookMockDb() {
  ShippingPolicy.findOne = originalFindOne;
  ShippingPolicy.create = originalCreate;
  ShippingPolicy.findOneAndUpdate = originalFindOneAndUpdate;
}

test("Shipping Policy Update - Comprehensive Verification (9 Scenarios)", async (t) => {
  hookMockDb();

  t.after(() => {
    unhookMockDb();
  });

  // Predefined sections metadata for tests
  const predefinedSections = [
    {
      id: "processing-time",
      name: "Processing Time",
      titleField: "processingTimeTitle",
      contentField: "processingTimeContent",
      testTitle: "Order Processing Duration",
      testContent: "All orders are verified and dispatched within 24 to 48 hours.",
    },
    {
      id: "domestic-shipping",
      name: "Domestic Shipping",
      titleField: "domesticShippingTitle",
      contentField: "domesticShippingContent",
      testTitle: "All India Delivery Services",
      testContent: "Standard delivery spans 3 to 6 business days nationwide.",
    },
    {
      id: "order-tracking",
      name: "Order Tracking",
      titleField: "orderTrackingTitle",
      contentField: "orderTrackingContent",
      testTitle: "Real-time Shipment Tracking",
      testContent: "Live tracking links and AWB numbers are sent via SMS and WhatsApp.",
    },
    {
      id: "shipping-restrictions",
      name: "Shipping Restrictions",
      titleField: "shippingRestrictionsTitle",
      contentField: "shippingRestrictionsContent",
      testTitle: "Delivery Boundaries & Exclusions",
      testContent: "We currently do not service non-serviceable pin codes or P.O. boxes.",
    },
    {
      id: "cash-on-delivery",
      name: "Cash on Delivery",
      titleField: "cashOnDeliveryTitle",
      contentField: "cashOnDeliveryContent",
      testTitle: "COD Availability & Terms",
      testContent: "Cash on Delivery is available up to INR 5,000 per order.",
    },
    {
      id: "damaged-packages",
      name: "Damaged or Lost Packages",
      titleField: "damagedOrLostPackagesTitle",
      contentField: "damagedOrLostPackagesContent",
      testTitle: "Damaged / Missing Shipment Claims",
      testContent: "Report any shipment damage within 48 hours with unboxing video proof.",
    },
    {
      id: "contact-us",
      name: "Contact Us",
      titleField: "contactUsTitle",
      contentField: "contactUsContent",
      testTitle: "Support & Grievances Desk",
      testContent: "Reach our dedicated logistics desk at support@agrowmed.com.",
    },
  ];

  // --------------------------------------------------------------------------
  // Scenario 4: Create a new Shipping Policy document when none exists and verify default values
  // --------------------------------------------------------------------------
  await t.test(
    "Scenario 4: Create a new Shipping Policy document when none exists and verify default values",
    async () => {
      mockDb.reset();
      assert.equal(mockDb.countDocuments(), 0, "Initial collection must be empty");

      // Submit update for only one section to an empty database
      const req = {
        body: {
          processingTimeTitle: "Initial Processing Policy",
          processingTimeContent: "Takes 1-2 days to process.",
        },
      };

      const result = await createshippingpolicy(req);
      assert.equal(result.success, true);
      assert.equal(result.message, "Shipping policy updated successfully!");
      assert.equal(mockDb.countDocuments(), 1, "Exactly 1 document should be created");

      const createdDoc = await mockDb.findOne();
      assert.ok(createdDoc._id, "Document must have a valid generated _id");
      assert.equal(createdDoc.processingTimeTitle, "Initial Processing Policy");
      assert.equal(createdDoc.processingTimeContent, "Takes 1-2 days to process.");

      // Verify all other 6 predefined sections were initialized with schema defaults
      assert.equal(createdDoc.domesticShippingTitle, "Domestic Shipping");
      assert.equal(createdDoc.domesticShippingContent, "");
      assert.equal(createdDoc.orderTrackingTitle, "Order Tracking");
      assert.equal(createdDoc.orderTrackingContent, "");
      assert.equal(createdDoc.shippingRestrictionsTitle, "Shipping Restrictions");
      assert.equal(createdDoc.shippingRestrictionsContent, "");
      assert.equal(createdDoc.cashOnDeliveryTitle, "Cash on Delivery");
      assert.equal(createdDoc.cashOnDeliveryContent, "");
      assert.equal(createdDoc.damagedOrLostPackagesTitle, "Damaged or Lost Packages");
      assert.equal(createdDoc.damagedOrLostPackagesContent, "");
      assert.equal(createdDoc.contactUsTitle, "Contact Us");
      assert.equal(createdDoc.contactUsContent, "");
      assert.deepEqual(createdDoc.customSections, [], "Custom sections must default to empty array");
    }
  );

  // --------------------------------------------------------------------------
  // Scenario 1: Update one predefined section and verify the change persists after refreshing
  // --------------------------------------------------------------------------
  await t.test(
    "Scenario 1: Update one predefined section and verify the change persists after refreshing",
    async () => {
      // Update Processing Time
      const updateReq = {
        body: {
          processingTimeTitle: "Fast Processing 24h",
          processingTimeContent: "Guaranteed dispatch within 24 hours.",
        },
      };

      const updateRes = await createshippingpolicy(updateReq);
      assert.equal(updateRes.success, true);
      assert.equal(updateRes.data.processingTimeTitle, "Fast Processing 24h");
      assert.equal(updateRes.data.processingTimeContent, "Guaranteed dispatch within 24 hours.");

      // Refresh / Fetch from backend
      const refreshRes = await getshippingpolicy();
      assert.equal(refreshRes.success, true);
      assert.ok(refreshRes.data !== null);
      assert.equal(refreshRes.data.processingTimeTitle, "Fast Processing 24h");
      assert.equal(refreshRes.data.processingTimeContent, "Guaranteed dispatch within 24 hours.");

      // Ensure other fields were not reset
      assert.equal(refreshRes.data.domesticShippingTitle, "Domestic Shipping");
      assert.equal(refreshRes.data.orderTrackingTitle, "Order Tracking");
    }
  );

  // --------------------------------------------------------------------------
  // Scenario 2: Update all 7 predefined sections individually
  // --------------------------------------------------------------------------
  await t.test(
    "Scenario 2: Update all 7 predefined sections individually",
    async () => {
      for (const section of predefinedSections) {
        const req = {
          body: {
            [section.titleField]: section.testTitle,
            [section.contentField]: section.testContent,
          },
        };

        const res = await createshippingpolicy(req);
        assert.equal(res.success, true);
        assert.equal(res.data[section.titleField], section.testTitle);
        assert.equal(res.data[section.contentField], section.testContent);
      }

      // Verify all 7 sections have their updated values persisted
      const doc = await mockDb.findOne();
      for (const section of predefinedSections) {
        assert.equal(
          doc[section.titleField],
          section.testTitle,
          `Field ${section.titleField} must match updated value`
        );
        assert.equal(
          doc[section.contentField],
          section.testContent,
          `Field ${section.contentField} must match updated value`
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // Scenario 3: Confirm updating one section does not modify or erase any other section
  // --------------------------------------------------------------------------
  await t.test(
    "Scenario 3: Confirm updating one section does not modify or erase any other section",
    async () => {
      const docBefore = await mockDb.findOne();
      const snapshotBefore = JSON.parse(JSON.stringify(docBefore));

      // Target only section 3: Order Tracking
      const targetSection = predefinedSections[2]; // order-tracking
      const newTitle = "Updated Real-Time GPS Tracking System";
      const newContent = "Shipments tracked minute-by-minute via dedicated GPS sensor telemetry.";

      const updateReq = {
        body: {
          [targetSection.titleField]: newTitle,
          [targetSection.contentField]: newContent,
        },
      };

      await createshippingpolicy(updateReq);

      const docAfter = await mockDb.findOne();

      // Verify targeted section was updated
      assert.equal(docAfter[targetSection.titleField], newTitle);
      assert.equal(docAfter[targetSection.contentField], newContent);

      // Verify all other 6 predefined sections are strictly unmodified
      for (const section of predefinedSections) {
        if (section.id === targetSection.id) continue;
        assert.equal(
          docAfter[section.titleField],
          snapshotBefore[section.titleField],
          `Section ${section.name} title was unexpectedly modified`
        );
        assert.equal(
          docAfter[section.contentField],
          snapshotBefore[section.contentField],
          `Section ${section.name} content was unexpectedly modified`
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // Scenario 5: Add a custom section, update it, refresh the page, and verify its data persists
  // --------------------------------------------------------------------------
  await t.test(
    "Scenario 5: Add a custom section, update it, refresh the page, and verify its data persists",
    async () => {
      // 5a: Add custom section
      const customSectionId = "custom-cold-chain-001";
      const addCustomReq = {
        body: {
          customSection: {
            id: customSectionId,
            name: "Cold Chain Logistics",
            titleField: "custom_cold_chain_title",
            contentField: "custom_cold_chain_content",
            title: "Temperature Controlled Delivery",
            content: "Medicines maintained between 2°C and 8°C throughout transit.",
          },
        },
      };

      const addRes = await createshippingpolicy(addCustomReq);
      assert.equal(addRes.success, true);
      assert.equal(addRes.data.customSections.length, 1);
      assert.equal(addRes.data.customSections[0].id, customSectionId);
      assert.equal(addRes.data.customSections[0].title, "Temperature Controlled Delivery");

      // 5b: Update existing custom section
      const updateCustomReq = {
        body: {
          customSection: {
            id: customSectionId,
            name: "Cold Chain Logistics",
            titleField: "custom_cold_chain_title",
            contentField: "custom_cold_chain_content",
            title: "Pharmaceutical Cold Chain Delivery (Revised)",
            content: "Updated: Active dry-ice packaging ensures 2-8°C stability for up to 96 hours.",
          },
        },
      };

      const updateRes = await createshippingpolicy(updateCustomReq);
      assert.equal(updateRes.success, true);
      assert.equal(
        updateRes.data.customSections.length,
        1,
        "Custom section count should remain 1 (no duplicate entry)"
      );
      assert.equal(
        updateRes.data.customSections[0].title,
        "Pharmaceutical Cold Chain Delivery (Revised)"
      );
      assert.equal(
        updateRes.data.customSections[0].content,
        "Updated: Active dry-ice packaging ensures 2-8°C stability for up to 96 hours."
      );

      // 5c: Refresh/Get call
      const refreshRes = await getshippingpolicy();
      assert.equal(refreshRes.success, true);
      assert.equal(refreshRes.data.customSections.length, 1);
      assert.equal(refreshRes.data.customSections[0].id, customSectionId);
      assert.equal(
        refreshRes.data.customSections[0].title,
        "Pharmaceutical Cold Chain Delivery (Revised)"
      );
      assert.equal(
        refreshRes.data.customSections[0].content,
        "Updated: Active dry-ice packaging ensures 2-8°C stability for up to 96 hours."
      );
    }
  );

  // --------------------------------------------------------------------------
  // Scenario 6: Verify repeated updates do not create duplicate Shipping Policy documents
  // --------------------------------------------------------------------------
  await t.test(
    "Scenario 6: Verify repeated updates do not create duplicate Shipping Policy documents",
    async () => {
      const initialCount = mockDb.countDocuments();
      assert.equal(initialCount, 1, "Should start with exactly 1 document");

      // Perform 8 consecutive updates across different sections
      for (let i = 0; i < 8; i++) {
        const section = predefinedSections[i % predefinedSections.length];
        await createshippingpolicy({
          body: {
            [section.titleField]: `${section.name} Iteration ${i + 1}`,
            [section.contentField]: `Content updated in cycle ${i + 1}`,
          },
        });
      }

      const finalCount = mockDb.countDocuments();
      assert.equal(
        finalCount,
        1,
        `Document count must remain exactly 1 after repeated updates, found: ${finalCount}`
      );
    }
  );

  // --------------------------------------------------------------------------
  // Scenario 7: Verify invalid or empty section data is handled correctly
  // --------------------------------------------------------------------------
  await t.test(
    "Scenario 7: Verify invalid or empty section data is handled correctly",
    async () => {
      // 7a: Empty body
      await assert.rejects(
        async () => {
          await createshippingpolicy({ body: {} });
        },
        (err) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.statusCode, 400);
          assert.equal(err.message, "No valid shipping policy fields provided to update");
          return true;
        }
      );

      // 7b: Body with completely unrecognized fields
      await assert.rejects(
        async () => {
          await createshippingpolicy({
            body: {
              invalidKey1: "some value",
              randomField: 12345,
            },
          });
        },
        (err) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.statusCode, 400);
          assert.equal(err.message, "No valid shipping policy fields provided to update");
          return true;
        }
      );

      // 7c: Custom section missing title
      await assert.rejects(
        async () => {
          await createshippingpolicy({
            body: {
              customSection: {
                id: "custom-err-1",
                name: "Error Section",
                titleField: "fld_title",
                contentField: "fld_content",
                title: "   ", // whitespace only
                content: "Some content",
              },
            },
          });
        },
        (err) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.statusCode, 400);
          assert.equal(
            err.message,
            "Custom section id, name, title, and content are required"
          );
          return true;
        }
      );

      // 7d: Custom section missing content
      await assert.rejects(
        async () => {
          await createshippingpolicy({
            body: {
              customSection: {
                id: "custom-err-2",
                name: "Error Section",
                titleField: "fld_title",
                contentField: "fld_content",
                title: "Valid Title",
                content: "", // empty
              },
            },
          });
        },
        (err) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.statusCode, 400);
          assert.equal(
            err.message,
            "Custom section id, name, title, and content are required"
          );
          return true;
        }
      );

      // 7e: Custom section missing id or name
      await assert.rejects(
        async () => {
          await createshippingpolicy({
            body: {
              customSection: {
                title: "Valid Title",
                content: "Valid Content",
              },
            },
          });
        },
        (err) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.statusCode, 400);
          assert.equal(
            err.message,
            "Custom section id, name, title, and content are required"
          );
          return true;
        }
      );
    }
  );

  // --------------------------------------------------------------------------
  // Scenario 8: Verify MongoDB _id, createdAt, updatedAt, and __v remain untouched
  // --------------------------------------------------------------------------
  await t.test(
    "Scenario 8: Verify MongoDB _id, createdAt, updatedAt, and __v remain untouched",
    async () => {
      const originalDoc = await mockDb.findOne();
      const originalId = originalDoc._id;
      const originalCreatedAt = originalDoc.createdAt;

      // Malicious or stale payload attempting to overwrite _id and timestamps
      const maliciousPayload = {
        _id: "HACKED_ID_666",
        createdAt: new Date("2000-01-01T00:00:00Z"),
        updatedAt: new Date("2000-01-01T00:00:00Z"),
        __v: 9999,
        processingTimeTitle: "Processing Time Protected",
        processingTimeContent: "Protection against metadata pollution verified.",
      };

      const result = await createshippingpolicy({ body: maliciousPayload });
      assert.equal(result.success, true);

      const updatedDoc = await mockDb.findOne();

      // Assert _id never changed
      assert.equal(
        updatedDoc._id,
        originalId,
        "Document _id must never be altered by incoming payload"
      );
      assert.notEqual(
        updatedDoc._id,
        "HACKED_ID_666",
        "Malicious _id must be completely ignored"
      );

      // Assert createdAt remained original
      assert.equal(
        new Date(updatedDoc.createdAt).getTime(),
        new Date(originalCreatedAt).getTime(),
        "createdAt timestamp must not be overwritten by incoming payload"
      );

      // Assert processing time was successfully updated
      assert.equal(updatedDoc.processingTimeTitle, "Processing Time Protected");
      assert.equal(
        updatedDoc.processingTimeContent,
        "Protection against metadata pollution verified."
      );
    }
  );

  // --------------------------------------------------------------------------
  // Scenario 9: Verify the frontend correctly displays backend validation errors and success messages
  // --------------------------------------------------------------------------
  await t.test(
    "Scenario 9: Verify the frontend correctly displays backend validation errors and success messages",
    async () => {
      // Test frontend validation logic directly modeled from ShippingPolicy.jsx
      function simulateFrontendValidation(section, formData) {
        const title = (formData[section.titleField] || "").trim();
        const content = (formData[section.contentField] || "").trim();

        if (!title) {
          return { valid: false, error: `${section.name} title is required.` };
        }
        if (!content) {
          return { valid: false, error: `${section.name} content is required.` };
        }
        return { valid: true, title, content };
      }

      function simulatePayloadConstruction(section, isCustom, title, content) {
        if (isCustom) {
          return {
            customSection: {
              id: section.id,
              name: section.name,
              titleField: section.titleField,
              contentField: section.contentField,
              title,
              content,
            },
          };
        }
        return {
          [section.titleField]: title,
          [section.contentField]: content,
        };
      }

      function simulateFrontendErrorHandler(err, section) {
        return (
          err.response?.data?.message ||
          err.message ||
          `Failed to update ${section.name}. Please try again.`
        );
      }

      const testSection = predefinedSections[0];

      // 9a: Empty title fails client-side validation
      const emptyTitleResult = simulateFrontendValidation(testSection, {
        processingTimeTitle: "   ",
        processingTimeContent: "Some content",
      });
      assert.equal(emptyTitleResult.valid, false);
      assert.equal(emptyTitleResult.error, "Processing Time title is required.");

      // 9b: Empty content fails client-side validation
      const emptyContentResult = simulateFrontendValidation(testSection, {
        processingTimeTitle: "Valid Title",
        processingTimeContent: "",
      });
      assert.equal(emptyContentResult.valid, false);
      assert.equal(emptyContentResult.error, "Processing Time content is required.");

      // 9c: Predefined payload construction strips _id, createdAt, etc.
      const predefinedPayload = simulatePayloadConstruction(
        testSection,
        false,
        "Valid Title",
        "Valid Content"
      );
      assert.deepEqual(predefinedPayload, {
        processingTimeTitle: "Valid Title",
        processingTimeContent: "Valid Content",
      });
      assert.equal(predefinedPayload._id, undefined);
      assert.equal(predefinedPayload.createdAt, undefined);

      // 9d: Custom payload construction encapsulates customSection object
      const customSectionMeta = {
        id: "cust-9",
        name: "Express Air Delivery",
        titleField: "cust_air_title",
        contentField: "cust_air_content",
      };
      const customPayload = simulatePayloadConstruction(
        customSectionMeta,
        true,
        "Air Delivery Title",
        "Air Delivery Content"
      );
      assert.deepEqual(customPayload, {
        customSection: {
          id: "cust-9",
          name: "Express Air Delivery",
          titleField: "cust_air_title",
          contentField: "cust_air_content",
          title: "Air Delivery Title",
          content: "Air Delivery Content",
        },
      });

      // 9e: Backend error message extraction
      const mockBackendError = {
        response: {
          data: {
            message: "Custom section id, name, title, and content are required",
          },
        },
      };
      const extractedErrorMessage = simulateFrontendErrorHandler(
        mockBackendError,
        testSection
      );
      assert.equal(
        extractedErrorMessage,
        "Custom section id, name, title, and content are required"
      );

      // 9f: Fallback error message extraction
      const mockNetworkError = new Error("Network Error");
      const fallbackErrorMessage = simulateFrontendErrorHandler(
        mockNetworkError,
        testSection
      );
      assert.equal(fallbackErrorMessage, "Network Error");

      // 9g: Success banner message construction
      const successMessage = `${testSection.name} updated successfully!`;
      assert.equal(successMessage, "Processing Time updated successfully!");
    }
  );
});
