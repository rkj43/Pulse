from app.goals import repository


def get_goals(db, user_id):
    return repository.get_goals(db, user_id)
