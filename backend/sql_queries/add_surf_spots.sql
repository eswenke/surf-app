-- SQL query to add surf spots to the surf_spots table

-- Shell Beach
INSERT INTO surf_spots (id, name, longitude, latitude, description, difficulty_rating)
VALUES (
  gen_random_uuid(), -- Generates a random UUID
  'Shell Beach',
  -120.6724, -- Longitude
  35.1553,   -- Latitude
  'A scenic beach located between Pismo Beach and Avila Beach, known for its tide pools and moderate waves.',
  3          -- Difficulty rating (1-5)
);

-- Pismo Beach
INSERT INTO surf_spots (id, name, longitude, latitude, description, difficulty_rating)
VALUES (
  gen_random_uuid(),
  'Pismo Beach',
  -120.6412, -- Longitude
  35.1428,   -- Latitude
  'Popular surfing destination with a long pier and consistent waves, suitable for surfers of all levels.',
  2          -- Difficulty rating (1-5)
);

-- Morro Bay
INSERT INTO surf_spots (id, name, longitude, latitude, description, difficulty_rating)
VALUES (
  gen_random_uuid(),
  'Morro Bay',
  -120.8522, -- Longitude
  35.3658,   -- Latitude
  'Protected bay with Morro Rock landmark, offering more gentle waves ideal for beginners and longboarders.',
  1          -- Difficulty rating (1-5)
);
