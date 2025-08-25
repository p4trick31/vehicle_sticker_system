from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
import random



class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_client = models.BooleanField(default=False)
    position = models.CharField(max_length=100, null=True, blank=True) 
    is_subscribed = models.BooleanField(default=False)
    signature = models.ImageField(upload_to='signatures/', null=True, blank=True)
    verification_code = models.CharField(max_length=6, blank=True, null=True)
    # in your custom User model
    reset_token = models.CharField(max_length=255, blank=True, null=True)



    def __str__(self):
        return self.user.username
    
class SystemReport(models.Model):
    ISSUE_CHOICES = [
        ('Bug', 'Bug'),
        ('System Crash', 'System Crash'),
        ('UI Problem', 'UI Problem'),
        ('Performance Issue', 'Performance Issue'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.CharField(max_length=50, choices=ISSUE_CHOICES)
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reason} - {self.user.username}"


class PushSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    endpoint = models.TextField()
    p256dh = models.TextField()
    auth = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    

    def __str__(self):
        return self.endpoint


class RequestForm(models.Model):
    user_name = models.CharField(max_length=100)
    email = models.EmailField()
    details = models.TextField()
    status = models.CharField(max_length=20, default='pending')  # Status can be 'pending', 'approved', etc.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user_name



class Application(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    date = models.DateField()
    name = models.CharField(max_length=255)
    address = models.TextField()
    contact = models.CharField(max_length=15)

    # New fields
    birthday = models.DateField(null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    vehicle_type = models.CharField(max_length=50, default='motorcycle')  # Set default value
    plate_number = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=30, blank=True)
    chassis_no = models.CharField(max_length=100, blank=True)
    model_make = models.CharField(max_length=100, blank=True)
    engine_no = models.CharField(max_length=100, blank=True)
    or_no = models.CharField(max_length=100, blank=True)
    vehicle_register = models.CharField(max_length=100, blank=True)

    # Timestamp field with default value as current time
    created_at = models.DateTimeField(default=timezone.now)
    is_approved = models.BooleanField(default=False)
    is_client2_approved = models.BooleanField(default=False)
    approved_by = models.CharField(max_length=255, null=True, blank=True)  # New field for approver's name
    status = models.CharField(max_length=50, default='Checking Application')
    app_status = models.CharField(max_length=20, default='Pending')
    is_disapproved = models.BooleanField(default=False)
    disapproved_by = models.CharField(max_length=255, blank=True, null=True)
    checked_by = models.CharField(max_length=255, null=True, blank=True) 
    position = models.CharField(max_length=50, default='Applicant')

    sticker_number = models.CharField(max_length=10, unique=True, blank=True, null=True)
    is_forwarded_to_person2 = models.BooleanField(default=False)
    person2_received_at = models.DateTimeField(null=True, blank=True)
    approved_time = models.DateTimeField(null=True, blank=True)
    client2_approved_time = models.DateTimeField(null=True, blank=True)
    disapproved_time = models.DateTimeField(null=True, blank=True)
    signature = models.ImageField(upload_to='application_signatures/', null=True, blank=True)
    signature2 = models.ImageField(upload_to='application_signatures/', null=True, blank=True)
    photos = models.ImageField(upload_to='photos/', blank=True, null=True)
    picture_id = models.ImageField(upload_to='pictureId/', blank=True, null=True)
    license_photos = models.ImageField(upload_to='licenses/', blank=True, null=True)  # ✅ Only 1 license photo
    vehicle_photos = models.ImageField(upload_to='vehiclePhotos', blank=True, null=True)
    pipe_photos = models.ImageField(upload_to='pipePhotos', blank=True, null=True)
    is_renewal = models.BooleanField(default=False)
    user_status = models.CharField(max_length=50, default="Pending")
    



    class Meta:
        db_table = 'myApp_application'

    def save(self, *args, **kwargs):
        # Sticker number generation logic
        if not self.sticker_number:
            while True:
                potential_sticker_number = str(random.randint(1000, 9999))
                if not Application.objects.filter(sticker_number=potential_sticker_number).exists():
                    self.sticker_number = potential_sticker_number
                    break

        # Photo logic (you had placeholder code here)
        if hasattr(self, 'photo') and self.photo:
            # Example: you might validate or resize photo
            pass

        super().save(*args, **kwargs)

# models.py



class RenewalForm(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    orcr_file = models.ImageField(upload_to='orcr/', null=True, blank=True)
    license_photo = models.ImageField(upload_to='license/', null=True, blank=True)
    full_name = models.CharField(max_length=255, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    contact_number = models.CharField(max_length=50, null=True, blank=True)
    vehicle_model = models.CharField(max_length=100, null=True, blank=True)
    
    plate_number = models.CharField(max_length=50, blank=True)
    engine_no = models.CharField(max_length=100, blank=True)
    chassis_no = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=50, blank=True)
    vehicle_register = models.CharField(max_length=100, blank=True)
    or_no = models.CharField(max_length=100, blank=True)
    vehicle_type = models.CharField(max_length=50, blank=True)
    birthday = models.DateField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)

    # ✅ New field for picture_id
    picture_id = models.ImageField(upload_to='renewal_picture_ids/', blank=True, null=True)
    signature = models.ImageField(upload_to='application_signatures/', null=True, blank=True)
    signature2 = models.ImageField(upload_to='application_signatures/', null=True, blank=True)
    is_renewal = models.BooleanField(default=True)

    # Status tracking for renewals (independent from Application)
    created_at = models.DateTimeField(auto_now_add=True)
    is_checked = models.BooleanField(default=False)  # Renamed from is_approved
    is_disapproved = models.BooleanField(default=False)
    admin_approve = models.BooleanField(default=False)
    client2_approved = models.BooleanField(default=False)
    renewal_status = models.CharField(max_length=50, default="Pending")
    status = models.CharField(max_length=50, default="Checking Renewal")
    user_status = models.CharField(max_length=50, default="Pending")

    # New fields
    checked_by = models.CharField(max_length=255, null=True, blank=True)
    approved_by = models.CharField(max_length=255, null=True, blank=True)
    checked_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Renewal: {self.user.username}"
