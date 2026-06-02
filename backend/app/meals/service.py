from app.meals import repository


def get_templates(db, user_id):
    return repository.get_templates(db, user_id)
