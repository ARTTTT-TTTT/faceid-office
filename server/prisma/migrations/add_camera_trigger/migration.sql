CREATE OR REPLACE FUNCTION sync_camera_id() 
RETURNS trigger AS $$
BEGIN
    SELECT camera_id INTO NEW.camera_id
    FROM "DetectionSession"
    WHERE id = NEW.session_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that runs before insert or update on DetectionLog
CREATE TRIGGER auto_set_camera_id
BEFORE INSERT OR UPDATE ON "DetectionLog"
FOR EACH ROW
EXECUTE FUNCTION sync_camera_id();