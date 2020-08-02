CREATE TABLE public.inventory_loadouts
(
  owner_id integer REFERENCES users(id),
  loadout_num integer,
  primary_weapon integer DEFAULT 20,
  secondary_weapon integer DEFAULT 24,
  melee integer DEFAULT 27,
  hegrenade integer DEFAULT 4,
  flash integer DEFAULT 23,
  smoke integer DEFAULT 8,

  PRIMARY KEY(owner_id, loadout_num)
);

CREATE UNIQUE INDEX inventory_loadouts_ownerid_unique_idx
  ON public.inventory_loadouts
  USING btree
  (owner_id, loadout_num);
