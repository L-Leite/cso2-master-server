CREATE TABLE public.inventory_buymenues
(
  owner_id integer PRIMARY KEY REFERENCES users(id),
  pistols integer[] DEFAULT '{2, 15, 1, 24, 10, 9, 0, 0, 0}',
  shotguns integer[] DEFAULT '{19, 5, 0, 0, 0, 0, 0, 0, 0}',
  smgs integer[] DEFAULT '{21, 6, 17, 11, 28, 0, 0, 0, 0}',
  rifles integer[] DEFAULT '{14, 13, 20, 26, 7, 25, 0, 0, 0}',
  snipers integer[] DEFAULT '{3, 16, 12, 22, 0, 0, 0, 0, 0}',
  machineguns integer[] DEFAULT '{18, 0, 0, 0, 0, 0, 0, 0, 0}',
  melees integer[] DEFAULT '{27, 0, 0, 0, 0, 0, 0, 0, 0}',
  equipment integer[] DEFAULT '{36, 37, 23, 4, 8, 34, 35, 0, 0}'
);

GRANT ALL ON TABLE public.inventory_buymenues TO cso2_user;

CREATE UNIQUE INDEX inventory_buymenues_ownerid_unique_idx
  ON public.inventory_buymenues
  USING btree
  (owner_id);
 