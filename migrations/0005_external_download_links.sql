-- File binaries are hosted externally (MediaFire). The site stores metadata + URL only.
alter table files add column if not exists external_url text;

-- Existing local file rows are intentionally not assigned an external URL.
-- New file records must use external_url.
alter table files alter column storage_key drop not null;
