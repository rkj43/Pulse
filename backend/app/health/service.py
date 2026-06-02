from app.health import repository


def get_metrics(db, user_id, metric_type=None, days=30):
    return repository.get_metrics(db, user_id, metric_type, days)
