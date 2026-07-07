-- WhatsGlazin — migration 003: The Fine Line's Cone 9/10 reduction board.
-- Run in the Supabase SQL editor. Safe to re-run (idempotent updates + upserts).
--
-- Source: photo of the studio's Cone 9/10 combination board (19 glazes,
-- numbered 2–22 with vacant slots at 4 and 7). Swatch hexes were sampled from
-- the board photo (white-balanced against the board paint) — approximations,
-- refinable later in the glaze editor.
--
-- Part 1 merges August's upload-created personal glazes that are actually
-- studio cone 10 glazes (they keep their ids, so existing pieces stay tagged).
-- Part 2 inserts the rest of the board as new Fine Line glazes.

-- ----------------------------------------------------------------------------
-- Part 1 — merge existing personal glazes into the Fine Line cone 10 board
-- ----------------------------------------------------------------------------

-- "Carbon Trap Shino" → Malcolm's Carbon Trap Shino (board #16)
update public.glazes set
  slug = 'malcolms-carbon-trap-shino',
  name = 'Malcolm''s Carbon Trap Shino',
  family = 'Shino', cone = 10, finish = 'satin',
  base_hex = '#ADA08A', shade2_hex = '#674D3E', on_color = '#3D362B',
  chemistry = 'Shino · carbon trap',
  description = 'Malcolm Davis''s carbon trap shino — creams and soft greys that flash orange and trap smoky carbon where the flame finds it. No two firings alike.',
  studio_id = (select id from public.studios where slug = 'fine-line'),
  is_studio_glaze = true
where slug in ('carbon-trap-shino-5553', 'malcolms-carbon-trap-shino');

-- "Emanual Copper Crystal" → Emmanuel Copper Blue Crystal (board #11)
update public.glazes set
  slug = 'emmanuel-copper-blue-crystal',
  name = 'Emmanuel Copper Blue Crystal',
  family = 'Copper', cone = 10, finish = 'glossy',
  base_hex = '#6D7B87', shade2_hex = '#3F4A53', on_color = '#DDE5ED',
  chemistry = 'Cu · crystals',
  description = 'A slate-blue copper glaze that grows small crystals in a slow cool. Frosted, mineral, a little celestial.',
  studio_id = (select id from public.studios where slug = 'fine-line'),
  is_studio_glaze = true
where slug in ('emanual-copper-crystal-126a', 'emmanuel-copper-blue-crystal');

-- "Iron Saturate" → Cornell Iron Saturate (board #18)
update public.glazes set
  slug = 'cornell-iron-saturate',
  name = 'Cornell Iron Saturate',
  family = 'Iron', cone = 10, finish = 'glossy',
  base_hex = '#3A2C26', shade2_hex = '#231914', on_color = '#EDD9D0',
  chemistry = 'Fe saturate',
  description = 'Iron-saturated dark brown that crystallizes metallic where it pools and breaks rust over edges.',
  studio_id = (select id from public.studios where slug = 'fine-line'),
  is_studio_glaze = true
where slug in ('iron-saturate-d097', 'cornell-iron-saturate');

-- "Kaitlin's Red" → Caitlan's Red (board #14 — board spelling)
update public.glazes set
  slug = 'caitlans-red',
  name = 'Caitlan''s Red',
  family = 'Red', cone = 10, finish = 'glossy',
  base_hex = '#552021', shade2_hex = '#340B0C', on_color = '#EDB9BA',
  chemistry = 'Cu red · reduction',
  description = 'A deep oxblood red — nearly black-maroon where the reduction runs heavy, brighter where it thins.',
  studio_id = (select id from public.studios where slug = 'fine-line'),
  is_studio_glaze = true
where slug in ('kaitlin-s-red-16fb', 'caitlans-red');

-- "Rietz Green" → Reitz Green (board #10 — board spelling)
update public.glazes set
  slug = 'reitz-green',
  name = 'Reitz Green',
  family = 'Green', cone = 10, finish = 'glossy',
  base_hex = '#424A4C', shade2_hex = '#272D2F', on_color = '#DEEAED',
  chemistry = 'Deep blue-green',
  description = 'A dark blue-green that reads nearly black in the thick spots and breaks lighter over texture.',
  studio_id = (select id from public.studios where slug = 'fine-line'),
  is_studio_glaze = true
where slug in ('rietz-green-393f', 'reitz-green');

-- "Vigland Blue" (board #12)
update public.glazes set
  slug = 'vigland-blue',
  name = 'Vigland Blue',
  family = 'Blue', cone = 10, finish = 'glossy',
  base_hex = '#374760', shade2_hex = '#1B283B', on_color = '#C9D7ED',
  chemistry = 'Co · mottled indigo',
  description = 'A deep mottled indigo with a lighter frost over the high spots.',
  studio_id = (select id from public.studios where slug = 'fine-line'),
  is_studio_glaze = true
where slug in ('vigland-blue-0460', 'vigland-blue');

-- "Yellow Salt" (board #6)
update public.glazes set
  slug = 'yellow-salt',
  name = 'Yellow Salt',
  family = 'Salt', cone = 10, finish = 'satin',
  base_hex = '#B2AC9D', shade2_hex = '#AC7247', on_color = '#3D3A33',
  chemistry = 'Faux salt · flashes',
  description = 'A buttery salt-glaze look-alike — warm cream that blushes orange where the flame hits it.',
  studio_id = (select id from public.studios where slug = 'fine-line'),
  is_studio_glaze = true
where slug in ('yellow-salt-899d', 'yellow-salt');

-- "Dry Matte" (board #15 — already in the Fine Line library; correct its record)
update public.glazes set
  slug = 'dry-matte',
  family = 'Matte', cone = 10, finish = 'dry matte',
  base_hex = '#908674', shade2_hex = '#595143', on_color = '#3B372E',
  chemistry = 'Dry stone matte',
  description = 'A bone-dry stone-grey matte. All surface, no shine — made to be handled.',
  studio_id = (select id from public.studios where slug = 'fine-line'),
  is_studio_glaze = true
where slug in ('dry-matte-8ab3', 'dry-matte');

-- ----------------------------------------------------------------------------
-- Part 2 — the rest of the Cone 9/10 board, new to the library
-- ----------------------------------------------------------------------------

insert into public.glazes
  (slug, name, family, cone, finish, base_hex, shade2_hex, on_color, chemistry, description, is_studio_glaze, studio_id)
select v.slug, v.name, v.family, 10, v.finish, v.base_hex, v.shade2_hex, v.on_color, v.chemistry, v.description, true,
       (select id from public.studios where slug = 'fine-line')
from (values
  ('snow-white', 'Snow White', 'White', 'glossy',
   '#B3ABA0', '#6E6860', '#3D3934', 'Opaque white · reduction',
   'A soft pearl white that goes warm grey where it thins over the clay. Board #2.'),
  ('rhodes-magnesium', 'Rhodes Magnesium', 'White', 'satin',
   '#BDC3C0', '#747876', '#3A3D3B', 'Mg · satin white',
   'A magnesium white with a cool blue cast — silky, and breaks soft over texture. Board #3.'),
  ('lau-lustre', 'Lau Lustre', 'Shino', 'satin',
   '#D0CDCB', '#B18C69', '#3D3B3B', 'Shino · lustre',
   'A quiet white shino with a soft lustre that flashes peach and rust at the edges. Board #5.'),
  ('po-wen-celadon', 'Po Wen Celadon', 'Celadon', 'glossy',
   '#DCE3DA', '#9FAE9C', '#333B34', 'Fe celadon · pale',
   'A pale grey-green celadon that pools glassy in carving and stays nearly white on the flats. Board #8.'),
  ('oribe-green', 'Oribe Green', 'Green', 'glossy',
   '#5C6353', '#39402F', '#E9EDE3', 'Cu · reduction green',
   'Deep mossy green in reduction — mottled and quiet rather than bright. Board #9.'),
  ('seacrest-blue', 'Seacrest Blue', 'Blue', 'glossy',
   '#46545A', '#2A3438', '#D9E5EA', 'Blue over iron',
   'A weathered blue-teal banded with iron browns — a bit of shoreline in it. Board #13.'),
  ('baileys-red', 'Bailey''s Red', 'Red', 'glossy',
   '#59392B', '#371F15', '#EDD8CC', 'Fe red · rust',
   'An iron red that leans brown, with rust streaks where it runs thin. Board #17.'),
  ('marks-tenmoku', 'Mark''s Tenmoku', 'Tenmoku', 'glossy',
   '#201D1C', '#131110', '#EDE2DE', 'Fe · tenmoku',
   'Classic tenmoku — black-brown glass that breaks amber on rims and ridges. Board #19.'),
  ('p-ash', 'P. Ash', 'Ash', 'runny',
   '#705C42', '#453521', '#EDDECB', 'Ash · runs',
   'An ash glaze that runs olive-gold rivulets wherever gravity gets a say. Board #20.'),
  ('toshico-black', 'Toshico Black', 'Black', 'glossy',
   '#3E4041', '#252728', '#DEE8ED', 'Blue-black',
   'A blue-black that reads midnight rather than jet. Board #21.'),
  ('weathered-bronze-10', 'Weathered Bronze', 'Bronze', 'satin',
   '#555845', '#343627', '#EAEDDB', 'Patina green · stony',
   'The cone 10 sibling of the cone 6 board''s bronze — a stony, mottled patina green. Board #22.')
) as v(slug, name, family, finish, base_hex, shade2_hex, on_color, chemistry, description)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Checks (run after): expect 8 merged rows at cone 10 + 11 inserts = 30 studio
-- glazes for fine-line (13 cone 6 + Dry Matte + 7 merged + 11 new — Dry Matte
-- now cone 10), and 2 remaining personal glazes (Orange Street, Turquoise).
-- ----------------------------------------------------------------------------
-- select cone, count(*) from public.glazes
--   where studio_id = (select id from public.studios where slug='fine-line')
--   group by cone;
-- select name, slug from public.glazes where studio_id is null and created_by is not null;
