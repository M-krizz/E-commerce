from database.models import db, Log
from datetime import datetime

def log_activity(user_id, action):
    log = Log(
        user_id=user_id,
        action=action,
        timestamp=datetime.utcnow()
    )
    db.session.add(log)
    db.session.commit()
