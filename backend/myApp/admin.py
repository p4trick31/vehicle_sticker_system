from django.contrib import admin
from .models import Profile
from .models import Application, RenewalForm, SystemReport

class ApplicationAdmin(admin.ModelAdmin):
    # Include all relevant fields in the list_display
    list_display = (
        'id', 
        'user',  # If you want to display the related user
        'date', 
        'name', 
        'address', 
        'contact', 
        'birthday', 
        'age', 
        'vehicle_type', 
        'plate_number', 
        'color', 
        'chassis_no', 
        'model_make', 
        'engine_no', 
        'photos', 
        'picture_id',
        'created_at', 
        'is_approved',
        'is_client2_approved',
        'approved_by', 
        'status',
        'app_status',
        'is_disapproved',
        'disapproved_by',
        'checked_by',
        'sticker_number',
        'is_renewal'

    )
    
    search_fields = ('name', 'address', 'contact')  # Fields you want to be searchable
    list_filter = ('status', 'vehicle_type')  # Fields you want to filter by

admin.site.register(Application, ApplicationAdmin)


@admin.register(SystemReport)
class SystemReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'reason', 'short_message', 'created_at')
    list_filter = ('reason', 'created_at')
    search_fields = ('user__username', 'reason', 'message')
    ordering = ('-created_at',)

    def short_message(self, obj):
        return (obj.message[:50] + '...') if obj.message and len(obj.message) > 50 else obj.message
    short_message.short_description = 'Message'

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_client', 'position', 'is_subscribed')  # Fields to show in list view
    list_filter = ('is_client', 'is_subscribed')  # Add filters in sidebar
    search_fields = ('user__username', 'position')  # Enable search



@admin.register(RenewalForm)
class RenewalFormAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'full_name', 
        'address',
        'contact_number', 
        'vehicle_model',
        'is_renewal',
        'created_at',
        'is_checked',
        'is_disapproved',
        'admin_approve',
        'client2_approved',
        'renewal_status',
        'status',
        'checked_by',
        'approved_by',
        'orcr_file',
        'license_photo'

    )

    readonly_fields = ('created_at',)
    search_fields = ('user__username', 'renewal_status', 'status')
    list_filter = ('is_checked', 'admin_approve', 'client2_approved', 'is_disapproved')