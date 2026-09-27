-- Pencapaian Pingat Kontinjen: jadual pingat semua kontinjen bagi sukan,
-- disimpan pada laporan post-mortem sukan tersebut.
-- Jalankan sekali di Supabase -> SQL Editor.
alter table public.postmortem_reports
  add column if not exists contingent_medals jsonb;
