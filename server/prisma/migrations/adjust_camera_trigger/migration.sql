DROP TRIGGER IF EXISTS auto_set_camera_id ON "DetectionLog";
DROP FUNCTION IF EXISTS sync_camera_id;

-- ✅ Updated trigger function
CREATE OR REPLACE FUNCTION sync_camera_id()
RETURNS trigger AS $$
BEGIN
    -- Lookup camera_id from the associated session
    SELECT "cameraId" INTO NEW."cameraId"
    FROM "DetectionSession"
    WHERE id = NEW."sessionId";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ✅ Create the trigger
CREATE TRIGGER auto_set_camera_id
BEFORE INSERT OR UPDATE ON "DetectionLog"
FOR EACH ROW
EXECUTE FUNCTION sync_camera_id();