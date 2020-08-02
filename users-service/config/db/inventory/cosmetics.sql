CREATE TABLE public.inventory_cosmetics
(
  owner_id integer PRIMARY KEY REFERENCES users(id),
  ct_item integer DEFAULT 1047,
  ter_item integer DEFAULT 1048,
  head_item integer DEFAULT 0,
  glove_item integer DEFAULT 0,
  back_item integer DEFAULT 0,
  steps_item integer DEFAULT 0,
  card_item integer DEFAULT 0,
  spray_item integer DEFAULT 42001
);

CREATE UNIQUE INDEX inventory_cosmetics_ownerid_unique_idx
  ON public.inventory_cosmetics
  USING btree
  (owner_id);
