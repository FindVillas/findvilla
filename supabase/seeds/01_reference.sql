insert into public.partner_organizations(id, name, status, commission_bps, application) values
  ('10000000-0000-0000-0000-000000000001', 'FindVillas Managed', 'approved', 0, '{"type":"managed"}'),
  ('20000000-0000-0000-0000-000000000001', 'Saan Collection', 'approved', 1500, '{"type":"Manager","contact":"Pimchanok S.","villas":2}'),
  ('20000000-0000-0000-0000-000000000002', 'Siam Shores Co.', 'pending', 1500, '{"type":"Agency","contact":"Mali Rattan","villas":3}'),
  ('20000000-0000-0000-0000-000000000003', 'Napas Villas', 'pending', 1500, '{"type":"Owner","contact":"Tanawat K.","villas":1}')
on conflict (id) do update set name = excluded.name, status = excluded.status;

insert into public.destinations(id, slug, name, tagline, hero_image_url, published, sort_order) values
  ('a0000000-0000-0000-0000-000000000001', 'phuket', '{"en":"Phuket","th":"ภูเก็ต"}', '{"en":"Dramatic coastlines and effortless island living","th":"แนวชายฝั่งสวยงามและชีวิตบนเกาะที่แสนสบาย"}', 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1400&q=85', true, 1),
  ('a0000000-0000-0000-0000-000000000002', 'koh-samui', '{"en":"Koh Samui","th":"เกาะสมุย"}', '{"en":"Palm-fringed bays and serene private retreats","th":"อ่าวเรียงรายด้วยต้นปาล์มและที่พักส่วนตัวอันเงียบสงบ"}', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=85', true, 2),
  ('a0000000-0000-0000-0000-000000000003', 'krabi', '{"en":"Krabi","th":"กระบี่"}', '{"en":"Limestone cliffs, clear water, unhurried days","th":"หน้าผาหินปูน น้ำใส และวันพักผ่อนที่ไม่เร่งรีบ"}', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1400&q=85', true, 3),
  ('a0000000-0000-0000-0000-000000000004', 'hua-hin', '{"en":"Hua Hin","th":"หัวหิน"}', '{"en":"A refined seaside escape close to Bangkok","th":"สถานที่พักผ่อนริมทะเลใกล้กรุงเทพฯ"}', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85', true, 4)
on conflict (id) do update set name = excluded.name, tagline = excluded.tagline, hero_image_url = excluded.hero_image_url, published = true;

insert into public.villas(id, partner_id, destination_id, slug, name, status, managed, featured, bedrooms, bathrooms, max_guests, base_rate_thb, latitude, longitude) values
  ('b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'villa-amanzi', 'Villa Amanzi', 'published', true, true, 6, 7, 12, 58500, 7.824, 98.296),
  ('b0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'villa-saan', 'Villa Saan', 'published', false, true, 5, 5, 10, 47200, 7.952, 98.267),
  ('b0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'baan-suriya', 'Baan Suriya', 'published', false, true, 6, 6, 14, 53900, 9.488, 99.927),
  ('b0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'krabi-sky-house', 'Krabi Sky House', 'published', true, false, 4, 4, 8, 28500, 8.045, 98.810),
  ('b0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'the-hua-hin-house', 'The Hua Hin House', 'published', false, false, 5, 5, 10, 32600, 12.525, 99.976)
on conflict (id) do update set status = excluded.status, base_rate_thb = excluded.base_rate_thb;

insert into public.villa_revisions(id, villa_id, status, content) values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'published', '{"area":{"en":"Cape Sol, Phuket","th":"แหลมโซล ภูเก็ต"},"description":{"en":"A sculptural cliffside villa where every room opens toward the Andaman Sea. A private chef and villa host make group stays feel completely effortless.","th":"วิลล่าริมหน้าผาดีไซน์โดดเด่น ทุกห้องเปิดรับวิวทะเลอันดามัน พร้อมเชฟส่วนตัวและผู้ดูแลวิลล่า"},"amenities":["Infinity pool","Private chef","Ocean view","Daily housekeeping","Cinema room","Airport transfer"],"tags":{"en":["Oceanfront","Private chef"],"th":["ติดทะเล","เชฟส่วนตัว"]},"rating":4.96,"reviews":28}'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'published', '{"area":{"en":"Kamala, Phuket","th":"กมลา ภูเก็ต"},"description":{"en":"Contemporary Thai architecture, sunset terraces, and generous spaces designed for families to reconnect.","th":"สถาปัตยกรรมไทยร่วมสมัย ระเบียงชมพระอาทิตย์ตก และพื้นที่กว้างขวางสำหรับครอบครัว"},"amenities":["Infinity pool","Villa host","Gym","Ocean view","Breakfast included"],"tags":{"en":["Sunset view"],"th":["วิวพระอาทิตย์ตก"]},"rating":4.92,"reviews":19}'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'published', '{"area":{"en":"Lipa Noi, Koh Samui","th":"ลิปะน้อย เกาะสมุย"},"description":{"en":"An easygoing beachfront home with a broad lawn, calm swimming water, and room for every generation.","th":"บ้านริมชายหาดบรรยากาศสบาย สนามหญ้ากว้าง น้ำทะเลสงบ เหมาะกับทุกวัย"},"amenities":["Beachfront","Private chef","Kayaks","Kids room","Massage sala"],"tags":{"en":["Beachfront","Family favourite"],"th":["ริมชายหาด","เหมาะกับครอบครัว"]},"rating":4.98,"reviews":34}'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'published', '{"area":{"en":"Ao Nang, Krabi","th":"อ่าวนาง กระบี่"},"description":{"en":"A quiet hillside hideaway framing Krabi''s limestone peaks, with breezy indoor-outdoor living.","th":"ที่พักเงียบสงบบนเนินเขา มองเห็นยอดเขาหินปูน พร้อมพื้นที่เชื่อมต่อภายในและภายนอก"},"amenities":["Private pool","Mountain view","Breakfast included","Villa host"],"tags":{"en":["Mountain view"],"th":["วิวภูเขา"]},"rating":4.89,"reviews":16}'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'published', '{"area":{"en":"Khao Takiab, Hua Hin","th":"เขาตะเกียบ หัวหิน"},"description":{"en":"A serene garden residence steps from the beach, made for long lunches and relaxed weekends.","th":"บ้านสวนสงบร่มรื่นใกล้ชายหาด เหมาะสำหรับมื้อกลางวันยาว ๆ และวันหยุดสุดสบาย"},"amenities":["Near beach","Saltwater pool","Garden","BBQ","Housekeeping"],"tags":{"en":["Weekend escape"],"th":["พักผ่อนสุดสัปดาห์"]},"rating":4.90,"reviews":22}')
on conflict (id) do update set content = excluded.content, status = 'published';

update public.villas set current_revision_id = ('c0000000-0000-0000-0000-' || right(id::text, 12))::uuid where id::text like 'b0000000-%';

insert into public.villa_media(villa_id, external_url, alt_text, sort_order) values
  ('b0000000-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1800&q=85','{"en":"Villa Amanzi infinity pool","th":"สระว่ายน้ำวิลล่าอามันซี"}',1),
  ('b0000000-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85','{"en":"Ocean view","th":"วิวทะเล"}',2),
  ('b0000000-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=85','{"en":"Villa bedroom","th":"ห้องนอนวิลล่า"}',3),
  ('b0000000-0000-0000-0000-000000000002','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85','{"en":"Villa Saan","th":"วิลล่าซาน"}',1),
  ('b0000000-0000-0000-0000-000000000003','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1800&q=85','{"en":"Baan Suriya beachfront","th":"บ้านสุริยาริมทะเล"}',1),
  ('b0000000-0000-0000-0000-000000000004','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85','{"en":"Krabi Sky House","th":"กระบี่สกายเฮาส์"}',1),
  ('b0000000-0000-0000-0000-000000000005','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=85','{"en":"Hua Hin House","th":"เดอะหัวหินเฮาส์"}',1)
on conflict do nothing;

insert into public.seasonal_rates(villa_id, name, period, nightly_thb, minimum_nights) values
  ('b0000000-0000-0000-0000-000000000001','{"en":"High season","th":"ฤดูท่องเที่ยว"}',daterange('2026-11-01','2027-05-01','[)'),68000,3)
on conflict do nothing;
