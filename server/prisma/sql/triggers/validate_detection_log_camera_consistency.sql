-- Function
CREATE OR REPLACE FUNCTION validate_log_camera_id()
RETURNS TRIGGER AS $$
DECLARE
    session_camera_id TEXT;
BEGIN
    SELECT "cameraId" INTO session_camera_id
    FROM "DetectionSession"
    WHERE id = NEW."sessionId";

    IF session_camera_id IS NULL THEN
        RAISE EXCEPTION 'Session % does not exist', NEW."sessionId";
    END IF;

    IF NEW."cameraId" IS DISTINCT FROM session_camera_id THEN
        RAISE EXCEPTION 'cameraId in DetectionLog must match cameraId of the session';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER enforce_session_camera_consistency
BEFORE INSERT OR UPDATE ON "DetectionLog"
FOR EACH ROW
EXECUTE FUNCTION validate_log_camera_id();