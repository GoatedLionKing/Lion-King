-- Production storage limit: 15 GiB per uploaded file.
update site_settings
set max_upload_bytes = 16106127360, updated_at = now()
where id = 1 and max_upload_bytes < 16106127360;

-- The old preview database-blob backend is no longer used.
drop table if exists file_blobs;

