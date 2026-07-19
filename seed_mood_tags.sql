-- ============================================================
-- Seed: mood_tags — canonical mood slugs
-- Run after api_migration.sql.
-- ============================================================

INSERT INTO public.mood_tags (slug, label) VALUES
    ('anxious',        'Anxious'),
    ('sad',            'Sad'),
    ('hopeful',        'Hopeful'),
    ('grateful',       'Grateful'),
    ('happy',          'Happy'),
    ('fearful',        'Fearful'),
    ('angry',          'Angry'),
    ('lonely',         'Lonely'),
    ('confused',       'Confused'),
    ('peaceful',       'Peaceful'),
    ('motivated',      'Motivated'),
    ('guilty',         'Guilty'),
    ('doubtful',       'Doubtful'),
    ('overwhelmed',    'Overwhelmed'),
    ('heartbroken',    'Heartbroken'),
    ('stressed',       'Stressed'),
    ('tired',          'Tired'),
    ('joyful',         'Joyful'),
    ('loved',          'Loved'),
    ('patient',        'Patient'),
    ('repentant',      'Repentant'),
    ('general',        'General')
ON CONFLICT (slug) DO NOTHING;
