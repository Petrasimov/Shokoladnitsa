ADMIN_IDS = {
    5295815261,
    432913160,
    878302991
}

def is_admin(user_id: int) -> bool:
    return user_id in ADMIN_IDS
