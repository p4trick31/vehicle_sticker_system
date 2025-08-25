from pywebpush import webpush, WebPushException
import json
import os

# Ideally store these in environment variables
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgf9aAFdie7gqdDXPzHasYu8IwgQn8Tno6te4sC4zSoV+hRANCAARihFh7OeZKGIpuPM1PL6TaHrtak8Ongv0C6hGZBMV+4E6Y12cIqqmIiZoEK/SfIVotuufX5UQEETQbPm1Y3W35")
VAPID_EMAIL = os.getenv("VAPID_EMAIL", "mailto:p4trick@gmail.com")

def send_push(subscription, payload):
    try:
        webpush(
            subscription_info={
                "endpoint": subscription.endpoint,
                "keys": {
                    "p256dh": subscription.p256dh,
                    "auth": subscription.auth,
                }
            },
            data=json.dumps(payload),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={"sub": VAPID_EMAIL}
        )
        print(f"Push sent successfully to subscription {subscription.id}")

    except WebPushException as ex:
        # Log the error
        print(f"Web push failed for subscription {subscription.id}: {repr(ex)}")

        # Remove subscription if it’s no longer valid
        if ex.response and ex.response.status_code in [404, 410]:
            print(f"Removing expired subscription {subscription.id}")
            subscription.delete()
        # You can optionally handle 400 Bad Request separately
        elif ex.response and ex.response.status_code == 400:
            print(f"Bad request for subscription {subscription.id}. Consider reviewing subscription data.")
