ADMIN_IDS = {
    5295815261
}

def is_admin(user_id: int) -> bool:
    return user_id in ADMIN_IDS
