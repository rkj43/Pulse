from app.reminders import repository


def get_reminders(db, user_id):
    return repository.get_reminders(db, user_id)
