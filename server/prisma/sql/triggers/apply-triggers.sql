\echo 'Applying triggers...'

\set QUIET off

\i prisma/sql/triggers/validate_detection_log_camera_consistency.sql

\echo '[OK] All triggers applied'