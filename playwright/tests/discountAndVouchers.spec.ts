import { AVAILABILITY } from "@data/copy";
import { VOUCHERS_AND_DISCOUNTS } from "@data/e2eTestData";
import { VouchersPage } from "@pages/vouchersPage";
import { expect, test } from "@playwright/test";

test.use({ storageState: "playwright/.auth/admin.json" });

let vouchersPage: VouchersPage;

test.beforeEach(({ page }) => {
  vouchersPage = new VouchersPage(page);
});

test("TC: SALEOR_40 Create voucher with auto-generated codes and fixed amount discount @vouchers @e2e", async () => {
  const codesQuantity = 5;
  const codesPrefix = "auto";

  await vouchersPage.gotoVouchersListPage();
  await vouchersPage.clickCreateVoucherButton();
  await vouchersPage.typeVoucherName();
  await vouchersPage.clickAddCodeButton();
  await vouchersPage.clickAutoGeneratedCodesItem();
  await vouchersPage.addVoucherCodeDialog.typeCodesQuantity(
    codesQuantity.toString(),
  );
  await vouchersPage.addVoucherCodeDialog.typeCodesPrefix(codesPrefix);
  await vouchersPage.addVoucherCodeDialog.clickConfirmButton();
  await vouchersPage.waitForGrid();

  const generatedCodesRows = await vouchersPage.getNumberOfGridRowsWithText(
    codesPrefix,
  );

  await expect(
    generatedCodesRows,
    `Auto-generated number of codes: ${codesQuantity} should be visible on grid`,
  ).toEqual(codesQuantity);

  await vouchersPage.typeDiscountValueInChannel();
  await vouchersPage.clickSaveButton();
  await vouchersPage.expectSuccessBanner();
  await vouchersPage.waitForGrid();
  const activeCodesRows = await vouchersPage.getNumberOfGridRowsWithText(
    "Active",
  );
  await expect(
    activeCodesRows,
    `Given codes quantity: ${codesQuantity} should have status Active displayed on grid`,
  ).toEqual(codesQuantity);
});

test("TC: SALEOR_85 Create voucher with manual code and percentage discount @vouchers @e2e", async () => {
  const code = `code-TC: SALEOR_85 ${new Date().toISOString()}`;

  await vouchersPage.gotoVoucherAddPage();
  await vouchersPage.typeVoucherName();
  await vouchersPage.clickAddCodeButton();
  await vouchersPage.clickManualGeneratedCodesItem();
  await vouchersPage.addVoucherCodeDialog.typeCode(code);
  await vouchersPage.addVoucherCodeDialog.clickConfirmButton();
  await vouchersPage.waitForGrid();

  const manualCodesRows = await vouchersPage.getNumberOfGridRowsWithText(code);

  await expect(
    manualCodesRows,
    `Manually added code: ${code} should be visible on grid`,
  ).toEqual(1);

  await vouchersPage.clickPercentDiscountTypeButton();
  await vouchersPage.rightSideDetailsPage.selectOneChannelAsAvailableWhenMoreSelected();
  await vouchersPage.typeDiscountValueInChannel("Channel-PLN", "50");

  await vouchersPage.clickSaveButton();

  await vouchersPage.expectSuccessBanner();
  await vouchersPage.waitForGrid();
  const manualActiveCodesRows = await vouchersPage.getNumberOfGridRowsWithText(
    "Active",
  );

  await expect(
    manualActiveCodesRows,
    `Given codes: ${code} should have status Active displayed on grid`,
  ).toEqual(1);
  await vouchersPage.page
    .getByText(AVAILABILITY.in1OutOf7Channels)
    .waitFor({ state: "visible" });
});

test("TC: SALEOR_86 Edit voucher to have free shipping discount @vouchers @e2e", async () => {
  await vouchersPage.gotoExistingVoucherPage(
    VOUCHERS_AND_DISCOUNTS.vouchers.voucherToBeEditedWithFreeShipping.id,
  );
  await vouchersPage.waitForGrid();
  const codesRows = await vouchersPage.getNumberOfGridRows();

  await vouchersPage.clickFreeShippingDiscountTypeButton();

  await expect(
    vouchersPage.discountValueInput,
    "No discount value input should be visible with free shipping type active ",
  ).not.toBeVisible();

  await vouchersPage.clickSaveButton();
  await vouchersPage.waitForGrid();

  await vouchersPage.expectSuccessBanner();
  const codesRowsAfterSave = await vouchersPage.getNumberOfGridRows();

  await expect(
    codesRows,
    `Same amount of codes should have status Active displayed on grid after switching to free shipping`,
  ).toEqual(codesRowsAfterSave);
});
test("TC: SALEOR_87 Edit voucher Usage Limits: used in total, per customer, staff only, code used once @vouchers @e2e", async () => {
  await vouchersPage.gotoExistingVoucherPage(
    VOUCHERS_AND_DISCOUNTS.vouchers.voucherToBeEditedUsageLimits.id,
  );
  await vouchersPage.waitForGrid();

  await vouchersPage.clickUsageTotalLimitCheckbox();
  await vouchersPage.typeUsageLimit("100000");
  await vouchersPage.clickOncePerCustomerLimitCheckbox();
  await vouchersPage.clickOnlyForStaffLimitCheckbox();
  await vouchersPage.clickSingleUseLimitCheckbox();
  await vouchersPage.clickSaveButton();
  await vouchersPage.waitForGrid();

  await vouchersPage.expectSuccessBanner();
  expect(
    await vouchersPage.usageLimitSection
      .locator('[class*="Mui-checked"]')
      .count(),
    "All usage limit checkboxes should be checked",
  ).toEqual(4);
});

test("TC: SALEOR_89 Create voucher with minimum value of order @vouchers @e2e", async () => {
  const code = `code-TC: SALEOR_89 ${new Date().toISOString()}`;

  await vouchersPage.gotoVoucherAddPage();
  await vouchersPage.typeVoucherName();
  await vouchersPage.clickAddCodeButton();
  await vouchersPage.clickManualGeneratedCodesItem();
  await vouchersPage.addVoucherCodeDialog.typeCode(code);
  await vouchersPage.addVoucherCodeDialog.clickConfirmButton();
  await vouchersPage.waitForGrid();
  const manualCodesRows = await vouchersPage.getNumberOfGridRowsWithText(code);
  await expect(
    manualCodesRows,
    `Manually added code: ${code} should be visible on grid`,
  ).toEqual(1);

  await vouchersPage.clickMinimalOrderValueButton();
  await vouchersPage.typeMinimumOrderValue("Channel-PLN", "50");
  await vouchersPage.clickSaveButton();

  await vouchersPage.expectSuccessBanner();
  await vouchersPage.waitForGrid();
  const manualActiveCodesRows = await vouchersPage.getNumberOfGridRowsWithText(
    "Active",
  );

  await expect(
    manualActiveCodesRows,
    `Given codes: ${code} should have status Active displayed on grid`,
  ).toEqual(1);
});
test("TC: SALEOR_90 Edit voucher minimum quantity of items @vouchers @e2e", async () => {
  await vouchersPage.gotoExistingVoucherPage(
    VOUCHERS_AND_DISCOUNTS.vouchers.voucherToBeEditedMinimumQuantity.id,
  );
  await vouchersPage.clickMinimumQuantityOfItemsButton();
  await vouchersPage.typeMinimumQuantityOfItems("4");
  await vouchersPage.clickSaveButton();
  await vouchersPage.expectSuccessBanner();
  await vouchersPage.waitForGrid();
});

test("TC: SALEOR_92 Delete voucher @vouchers @e2e", async () => {
  await vouchersPage.gotoExistingVoucherPage(
    VOUCHERS_AND_DISCOUNTS.vouchers.voucherToBeDeleted.id,
  );

  await vouchersPage.clickDeleteSingleVoucherButton();
  await vouchersPage.deleteVoucherDialog.clickDeleteButton();
  await vouchersPage.expectSuccessBanner();
  await vouchersPage.createVoucherButton.waitFor({ state: "visible" });
  await vouchersPage.waitForGrid();
  await expect(
    await vouchersPage.findRowIndexBasedOnText([
      VOUCHERS_AND_DISCOUNTS.vouchers.voucherToBeDeleted.name,
    ]),
    `Given vouchers: ${VOUCHERS_AND_DISCOUNTS.vouchers.voucherToBeBulkDeleted.names} should be deleted from the list`,
  ).toEqual([]);
});
test("TC: SALEOR_93 Bulk delete voucher @vouchers @e2e", async () => {
  await vouchersPage.gotoVouchersListPage();
  await vouchersPage.checkListRowsBasedOnContainingText(
    VOUCHERS_AND_DISCOUNTS.vouchers.voucherToBeBulkDeleted.names,
  );

  await vouchersPage.clickBulkDeleteButton();
  await vouchersPage.deleteVouchersDialog.clickDeleteButton();
  await vouchersPage.expectSuccessBanner();
  await vouchersPage.waitForGrid();
  await expect(
    await vouchersPage.findRowIndexBasedOnText(
      VOUCHERS_AND_DISCOUNTS.vouchers.voucherToBeBulkDeleted.names,
    ),
    `Given vouchers: ${VOUCHERS_AND_DISCOUNTS.vouchers.voucherToBeBulkDeleted.names} should be deleted from the list`,
  ).toEqual([]);
});

test("TC: SALEOR_94 Edit voucher - assign voucher to specific category @vouchers @e2e", async () => {
  const categoryToBeAssigned = "Accessories";

  await vouchersPage.gotoExistingVoucherPage(
    VOUCHERS_AND_DISCOUNTS.vouchers
      .voucherToBeEditedAssignCategoryProductCollection.id,
  );
  await vouchersPage.clickSpecificProductsButton();
  await vouchersPage.clickAssignCategoryButton();
  await vouchersPage.assignSpecificProductsDialog.assignSpecificProductsByNameAndSave(
    categoryToBeAssigned,
  );

  await vouchersPage.expectSuccessBanner();
  await expect(
    vouchersPage.assignedSpecificProductRow,
    `Assigned category: ${categoryToBeAssigned} should be visible`,
  ).toContainText(categoryToBeAssigned);
  expect(
    await vouchersPage.assignedSpecificProductRow.count(),
    `Only 1 category should be visible in table`,
  ).toEqual(1);
});
test("TC:SALEOR_95  Edit voucher - assign voucher to specific collection @vouchers @e2e", async () => {
  const collectionToBeAssigned = "Featured Products";

  await vouchersPage.gotoExistingVoucherPage(
    VOUCHERS_AND_DISCOUNTS.vouchers
      .voucherToBeEditedAssignCategoryProductCollection.id,
  );
  await vouchersPage.clickSpecificProductsButton();
  await vouchersPage.clickCollectionsTab();
  await vouchersPage.clickAssignCollectionButton();
  await vouchersPage.assignSpecificProductsDialog.assignSpecificProductsByNameAndSave(
    collectionToBeAssigned,
  );

  await vouchersPage.expectSuccessBanner();
  await expect(
    vouchersPage.assignedSpecificProductRow,
    `Assigned collection: ${collectionToBeAssigned} should be visible`,
  ).toContainText(collectionToBeAssigned);
  expect(
    await vouchersPage.assignedSpecificProductRow.count(),
    `Only 1 collection should be visible in table`,
  ).toEqual(1);
});
test("TC: SALEOR_96 Edit voucher - assign voucher to specific product @vouchers @e2e", async () => {
  const productToBeAssigned = "Bean Juice";

  await vouchersPage.gotoExistingVoucherPage(
    VOUCHERS_AND_DISCOUNTS.vouchers
      .voucherToBeEditedAssignCategoryProductCollection.id,
  );
  await vouchersPage.clickSpecificProductsButton();
  await vouchersPage.clickProductsTab();
  await vouchersPage.clickAssignProductButton();
  await vouchersPage.assignSpecificProductsDialog.assignSpecificProductsByNameAndSave(
    productToBeAssigned,
  );
  await vouchersPage.expectSuccessBanner();
  await expect(
    vouchersPage.assignedSpecificProductRow,
    `Assigned collection: ${productToBeAssigned} should be visible`,
  ).toContainText(productToBeAssigned);
  expect(
    await vouchersPage.assignedSpecificProductRow.count(),
    `Only 1 product should be visible in table`,
  ).toEqual(1);
});
