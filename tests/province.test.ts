import { describe, expect, it, spyOn } from "bun:test";
import request from "supertest";
import app from "../src/app";
import { provinceService } from "../src/services/province.service";

describe("ProvinceController GET /", () => {
  it("should return all provinces", async () => {
    const mockProvinces = [
      { id: "1", name: "Province A", createdAt: new Date(), updatedAt: new Date() },
      { id: "2", name: "Province B", createdAt: new Date(), updatedAt: new Date() },
    ];

    const getAllProvincesSpy = spyOn(provinceService, "getAllProvinces").mockImplementation(async () => {
      return {
        data: mockProvinces,
        meta: { total: 2, page: 1, limit: 10, totalPages: 1 }
      } as any;
    });

    const response = await request(app).get("/api/provinces");

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBe(2);
    expect(response.body.data[0].name).toBe("Province A");
    expect(response.body.data[1].name).toBe("Province B");

    getAllProvincesSpy.mockRestore();
  });

  it("should return an empty array if no provinces exist", async () => {
    const getAllProvincesSpy = spyOn(provinceService, "getAllProvinces").mockImplementation(async () => {
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 }
      } as any;
    });

    const response = await request(app).get("/api/provinces");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);

    getAllProvincesSpy.mockRestore();
  });
});
