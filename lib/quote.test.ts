import { describe, expect, it } from "vitest";
import { calculateQuote } from "./quote";
import type { Villa } from "./types";

describe("calculateQuote",()=>{
  const villa:Villa={id:"test",slug:"test",name:"Test Villa",destination:"phuket",area:{en:"",th:""},description:{en:"",th:""},images:[],bedrooms:6,bathrooms:6,maxGuests:12,baseRateThb:58500,rating:5,reviews:0,amenities:[],tags:[],lat:0,lng:0,featured:false,managed:true,rates:[{name:{en:"High season",th:""},start:"2026-11-01",end:"2027-04-30",nightlyThb:68000,minimumNights:3}]};
  it("calculates base nightly rates, service fee, and VAT",()=>{const quote=calculateQuote(villa,"2026-08-10","2026-08-12");expect(quote.nights).toBe(2);expect(quote.nightlySubtotal).toBe(117000);expect(quote.serviceFee).toBe(9360);expect(quote.tax).toBe(8845);expect(quote.total).toBe(135205);});
  it("uses seasonal rates for every covered night",()=>{const quote=calculateQuote(villa,"2026-12-10","2026-12-13");expect(quote.nights).toBe(3);expect(quote.nightlySubtotal).toBe(204000);});
  it("rejects zero and negative stays",()=>{expect(()=>calculateQuote(villa,"2026-08-10","2026-08-10")).toThrow();expect(()=>calculateQuote(villa,"2026-08-11","2026-08-10")).toThrow();});
});
