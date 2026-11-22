import { describe, expect, it } from "vitest";
import { homeFor, safeNextPath } from "./redirects";

describe("safeNextPath", () => {
  it("keeps same-site paths", () => expect(safeNextPath("/cards?x=1", "/overview")).toBe("/cards?x=1"));
  it("rejects other sites", () => {
    expect(safeNextPath("https://evil.example", "/overview")).toBe("/overview");
    expect(safeNextPath("//evil.example", "/overview")).toBe("/overview");
    expect(safeNextPath("/\\evil.example", "/overview")).toBe("/overview");
  });
});

describe("homeFor", () => {
  it("sends admins to the admin", () => expect(homeFor("admin", "/overview")).toBe("/admin"));
  it("keeps an admin's admin page", () => expect(homeFor("admin", "/admin/customers/1")).toBe("/admin/customers/1"));
  it("never sends customers into the admin", () => expect(homeFor("customer", "/admin")).toBe("/overview"));
  it("returns customers to the page they asked for", () => expect(homeFor("customer", "/cards")).toBe("/cards"));
});
