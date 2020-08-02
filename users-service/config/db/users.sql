CREATE TABLE public.users
(
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
    username text UNIQUE NOT NULL,
    playername text UNIQUE NOT NULL,

    password_hash text NOT NULL,

    gm boolean DEFAULT FALSE,

    points integer DEFAULT 10000,
    cash integer DEFAULT 5000,
    mpoints integer DEFAULT 30000,

    level integer DEFAULT 1,
    cur_xp bigint DEFAULT 0,
    max_xp bigint DEFAULT 1000,
    vip_level integer DEFAULT 0,
    vip_xp integer DEFAULT 0,

    rank integer DEFAULT 0,
    rank_frame integer DEFAULT 0,

    played_matches integer DEFAULT 0,
    wins integer DEFAULT 0,
    seconds_played integer DEFAULT 0,

    kills integer DEFAULT 0,
    deaths integer DEFAULT 0,
    assists integer DEFAULT 0,
    headshots integer DEFAULT 0,
    accuracy integer DEFAULT 100,

    avatar integer DEFAULT 1001,
    unlocked_avatars integer[] DEFAULT '{255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255}',

    title integer DEFAULT 0,
    unlocked_titles integer[] DEFAULT '{255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255}',

    signature text DEFAULT '',

    unlocked_achievements integer[] DEFAULT '{0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0}',

    campaign_flags integer DEFAULT 0,

    netcafe_name text DEFAULT '',

    clan_name text DEFAULT '',
    clan_mark integer DEFAULT 0,

    world_rank integer DEFAULT 0,

    best_gamemode integer DEFAULT 0,
    best_map integer DEFAULT 0,

    skill_human_curxp bigint DEFAULT 0,
    skill_human_maxxp bigint DEFAULT 0,
    skill_human_points integer DEFAULT 0,
    skill_zombie_curxp bigint DEFAULT 0,
    skill_zombie_maxxp bigint DEFAULT 0,
    skill_zombie_points integer DEFAULT 0
);

GRANT ALL ON TABLE public.users TO cso2_user;

CREATE UNIQUE INDEX users_id_unique_idx
  ON public.users
  USING btree
  (id);

CREATE UNIQUE INDEX users_username_unique_idx
  ON public.users
  USING btree
  (lower(username));
