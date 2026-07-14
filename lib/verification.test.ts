import { describe, expect, it } from "vitest";
import { applicationRequirements, complianceRequirements } from "./verification";

describe("partner verification requirements", () => {
  it("keeps the individual owner application minimal", () => {
    expect(applicationRequirements({
      applicantType: "individual",
      relationship: "owner_operator",
      vatRegistered: false,
      hasForeignInvolvement: false,
    }).map(row => row.code)).toEqual(["IDENTITY"]);
  });

  it("adds entity, agency, tax, and foreign-authority evidence conditionally", () => {
    expect(applicationRequirements({
      applicantType: "legal_entity",
      relationship: "manager_agent",
      vatRegistered: true,
      hasForeignInvolvement: true,
    }).map(row => row.code)).toEqual([
      "IDENTITY",
      "DBD_CERTIFICATE",
      "AUTHORIZED_SIGNATORY_ID",
      "SHAREHOLDER_LIST",
      "MANAGEMENT_AUTHORITY",
      "VAT_CERTIFICATE",
      "FOREIGN_BUSINESS_AUTHORITY",
    ]);
  });
});

describe("property compliance requirements", () => {
  it("requires hotel licence and building-use authorization for the hotel path", () => {
    const codes = complianceRequirements("hotel_license").map(row => row.code);
    expect(codes).toContain("HOTEL_LICENSE");
    expect(codes).toContain("BUILDING_HOTEL_USE");
    expect(codes).toContain("LIABILITY_INSURANCE");
    expect(codes).not.toContain("NON_HOTEL_NOTIFICATION");
  });

  it("requires DOPA notification and supplementary-income evidence for the non-hotel path", () => {
    const codes = complianceRequirements("non_hotel_notification").map(row => row.code);
    expect(codes).toContain("NON_HOTEL_NOTIFICATION");
    expect(codes).toContain("MAIN_INCOME_EVIDENCE");
    expect(codes).toContain("LIABILITY_INSURANCE");
    expect(codes).not.toContain("HOTEL_LICENSE");
  });
});
