const test = require("node:test");
const assert = require("node:assert/strict");

const { User } = require("../src/models/users.model");
const accountAddressService = require("../src/services/user Services/myAccounts/address");

const createMockUser = (initial = {}) => {
  const user = {
    _id: "user-123",
    sameAsDelivery: false,
    primaryDeliveryAddressId: null,
    address: [],
    saveCalls: 0,
    async save() {
      this.saveCalls += 1;
      return this;
    },
    ...initial,
  };
  return user;
};

test("Same as Delivery Address Service Tests", async (t) => {
  const origFindById = User.findById;
  const origFindOne = User.findOne;
  const origFindByIdAndUpdate = User.findByIdAndUpdate;

  t.afterEach(() => {
    User.findById = origFindById;
    User.findOne = origFindOne;
    User.findByIdAndUpdate = origFindByIdAndUpdate;
  });

  await t.test("rejects unauthenticated requests", async () => {
    await assert.rejects(
      () => accountAddressService.syncSameAsDelivery({ user: {}, body: { enabled: true } }),
      (err) => err.statusCode === 401
    );
  });

  await t.test("fails when no delivery address is available", async () => {
    const mockUser = createMockUser({ address: [] });
    User.findById = async () => mockUser;

    await assert.rejects(
      () =>
        accountAddressService.syncSameAsDelivery({
          user: { _id: "user-123" },
          body: { enabled: true },
        }),
      (err) => err.statusCode === 400 && err.message.includes("No delivery address")
    );
  });

  await t.test("enables Same as Delivery Address and copies all fields without duplicates", async () => {
    const delivery1 = {
      _id: "del-1",
      fullName: "Asha Rao",
      addressLine1: "12 Green St",
      landMark: "Near Park",
      city: "Bengaluru",
      state: "KA",
      zipCode: "560001",
      country: "India",
      phone: "9876543210",
      email: "asha@example.com",
      addressType: "home",
      checkoutAddress: "deliveryAddress",
    };

    const mockUser = createMockUser({ address: [delivery1] });
    User.findById = async (id) => (id === "user-123" ? mockUser : null);

    const res1 = await accountAddressService.syncSameAsDelivery({
      user: { _id: "user-123" },
      body: { enabled: true, deliveryAddressId: "del-1" },
    });

    assert.equal(res1.success, true);
    assert.equal(res1.sameAsDelivery, true);
    assert.equal(res1.primaryDeliveryAddressId, "del-1");

    const billingList1 = res1.address.filter((a) => a.checkoutAddress === "billingAddress");
    assert.equal(billingList1.length, 1);
    assert.equal(billingList1[0].fullName, "Asha Rao");
    assert.equal(billingList1[0].landMark, "Near Park");
    assert.equal(billingList1[0].email, "asha@example.com");
    assert.equal(billingList1[0].isSameAsDelivery, true);
    assert.equal(billingList1[0].sourceDeliveryAddressId, "del-1");

    // Assign an _id as Mongoose would, then enable again -> should NOT create duplicate
    billingList1[0]._id = "bill-1";
    const res2 = await accountAddressService.syncSameAsDelivery({
      user: { _id: "user-123" },
      body: { enabled: true, deliveryAddressId: "del-1" },
    });

    const billingList2 = res2.address.filter((a) => a.checkoutAddress === "billingAddress");
    assert.equal(billingList2.length, 1);
    assert.equal(billingList2[0]._id, "bill-1");
  });

  await t.test("switches primary delivery address and updates synced billing address in-place", async () => {
    const delivery1 = {
      _id: "del-1",
      fullName: "Asha Rao",
      addressLine1: "12 Green St",
      landMark: "Near Park",
      city: "Bengaluru",
      state: "KA",
      zipCode: "560001",
      country: "India",
      phone: "9876543210",
      email: "asha@example.com",
      addressType: "home",
      checkoutAddress: "deliveryAddress",
    };
    const delivery2 = {
      _id: "del-2",
      fullName: "Ravi Kumar",
      addressLine1: "99 Lake Rd",
      landMark: "Opp Mall",
      city: "Mysuru",
      state: "KA",
      zipCode: "570001",
      country: "India",
      phone: "9123456789",
      email: "ravi@example.com",
      addressType: "work",
      checkoutAddress: "deliveryAddress",
    };
    const syncedBilling = {
      ...delivery1,
      _id: "bill-1",
      checkoutAddress: "billingAddress",
      isSameAsDelivery: true,
      sourceDeliveryAddressId: "del-1",
    };

    const mockUser = createMockUser({
      sameAsDelivery: true,
      primaryDeliveryAddressId: "del-1",
      address: [syncedBilling, delivery1, delivery2],
    });
    User.findById = async () => mockUser;

    const res = await accountAddressService.syncSameAsDelivery({
      user: { _id: "user-123" },
      body: { enabled: true, deliveryAddressId: "del-2" },
    });

    const billing = res.address.filter((a) => a.checkoutAddress === "billingAddress");
    assert.equal(billing.length, 1);
    assert.equal(billing[0]._id, "bill-1");
    assert.equal(billing[0].fullName, "Ravi Kumar");
    assert.equal(billing[0].city, "Mysuru");
    assert.equal(billing[0].sourceDeliveryAddressId, "del-2");
    assert.equal(res.primaryDeliveryAddressId, "del-2");
  });

  await t.test("disabling preserves existing billing address without deleting or overwriting", async () => {
    const syncedBilling = {
      _id: "bill-1",
      fullName: "Asha Rao",
      addressLine1: "12 Green St",
      landMark: "Near Park",
      city: "Bengaluru",
      state: "KA",
      zipCode: "560001",
      country: "India",
      phone: "9876543210",
      email: "asha@example.com",
      addressType: "home",
      checkoutAddress: "billingAddress",
      isSameAsDelivery: true,
      sourceDeliveryAddressId: "del-1",
    };
    const mockUser = createMockUser({
      sameAsDelivery: true,
      primaryDeliveryAddressId: "del-1",
      address: [syncedBilling],
    });
    User.findById = async () => mockUser;

    const res = await accountAddressService.syncSameAsDelivery({
      user: { _id: "user-123" },
      body: { enabled: false },
    });

    assert.equal(res.sameAsDelivery, false);
    assert.equal(res.address.length, 1);
    assert.equal(res.address[0]._id, "bill-1");
    assert.equal(res.address[0].fullName, "Asha Rao");
    assert.equal(res.address[0].isSameAsDelivery, false);
  });

  await t.test("editing synced delivery address automatically updates billing address", async () => {
    const delivery1 = {
      _id: "del-1",
      fullName: "Asha Rao",
      addressLine1: "12 Green St",
      landMark: "Near Park",
      city: "Bengaluru",
      state: "KA",
      zipCode: "560001",
      country: "India",
      phone: "9876543210",
      email: "asha@example.com",
      addressType: "home",
      checkoutAddress: "deliveryAddress",
    };
    const syncedBilling = {
      ...delivery1,
      _id: "bill-1",
      checkoutAddress: "billingAddress",
      isSameAsDelivery: true,
      sourceDeliveryAddressId: "del-1",
    };
    const mockUser = createMockUser({
      sameAsDelivery: true,
      primaryDeliveryAddressId: "del-1",
      address: [syncedBilling, delivery1],
    });
    User.findById = async () => mockUser;

    const res = await accountAddressService.editAddress({
      user: { _id: "user-123" },
      params: { addressId: "del-1" },
      body: {
        city: "Chennai",
        zipCode: "600001",
      },
    });

    const billing = res.address.find((a) => a._id === "bill-1");
    assert.equal(billing.city, "Chennai");
    assert.equal(billing.zipCode, "600001");
  });

  await t.test("deleting linked delivery address clears references safely", async () => {
    const delivery1 = {
      _id: "del-1",
      fullName: "Asha Rao",
      checkoutAddress: "deliveryAddress",
    };
    const syncedBilling = {
      _id: "bill-1",
      fullName: "Asha Rao",
      checkoutAddress: "billingAddress",
      isSameAsDelivery: true,
      sourceDeliveryAddressId: "del-1",
    };
    const mockUser = createMockUser({
      sameAsDelivery: true,
      primaryDeliveryAddressId: "del-1",
      address: [syncedBilling, delivery1],
    });
    User.findById = async () => mockUser;

    const res = await accountAddressService.deleteAddress({
      user: { _id: "user-123" },
      params: { addressId: "del-1" },
    });

    assert.equal(res.sameAsDelivery, false);
    assert.equal(res.primaryDeliveryAddressId, null);
    assert.equal(res.address.length, 1);
    assert.equal(res.address[0]._id, "bill-1");
    assert.equal(res.address[0].isSameAsDelivery, false);
    assert.equal(res.address[0].sourceDeliveryAddressId, null);
  });
});
