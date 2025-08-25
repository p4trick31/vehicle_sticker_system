from rest_framework import serializers
from .models import Application, RenewalForm, RequestForm, SystemReport
from django.contrib.auth.models import User

class AppSerializer(serializers.ModelSerializer):
    photos = serializers.ImageField(required=False)
    picture_id = serializers.ImageField(required=False)
    license_photos = serializers.ImageField(required=False)
    vehicle_photos = serializers.ImageField(required=False)
    pipe_photos = serializers.ImageField(required=False)
    photos_url = serializers.SerializerMethodField()
    picture_id_url = serializers.SerializerMethodField()
    license_photo_url = serializers.SerializerMethodField()
    vehicle_photo_url = serializers.SerializerMethodField()
    pipe_photo_url = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)


    is_renewal = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'

    def get_photos_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.photos.url) if obj.photos and request else None

    def get_picture_id_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.picture_id.url) if obj.picture_id and request else None

    def get_license_photo_url(self, obj):
        request = self.context.get('request')
  
        return request.build_absolute_uri(obj.license_photos.url) if obj.license_photos and request else None
    def get_vehicle_photo_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.vehicle_photos.url) if obj.vehicle_photos and request else None
    def get_pipe_photo_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.pipe_photos.url) if obj.pipe_photos and request else None


    def get_is_renewal(self, obj):
        request = self.context.get('request')
        if request:
            renewal = RenewalForm.objects.filter(user=request.user).first()
            return renewal.is_renewal if renewal else False
        return False
    
    def get_username(self, obj):
        return obj.user.username if obj.user else None

class SystemReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemReport
        fields = ['id', 'reason', 'message', 'created_at', 'username']

    username = serializers.SerializerMethodField()

    def get_username(self, obj):
        return obj.user.username if obj.user else None


class UserSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    position = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'status', 'position', 'is_staff', 'first_name', 'last_name']

    def get_status(self, obj):
        application = Application.objects.filter(user=obj).first()
        return application.status if application else 'N/A'

    def get_position(self, obj):
        application = Application.objects.filter(user=obj).first()
        return application.position if application else 'N/A'

class RenewalApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            'birthday', 'age', 'vehicle_type', 'plate_number',
            'color', 'chassis_no',
            'engine_no', 'or_no', 'vehicle_register', 'picture_id'
        ]

class RenewalFormSerializer(serializers.ModelSerializer):
    orcr_file = serializers.FileField(required=False)
    license_photo = serializers.FileField(required=False)
    orcr_file_url = serializers.SerializerMethodField()
    license_photo_url = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    application = serializers.SerializerMethodField()

    class Meta:
        model = RenewalForm
        fields = [
            'id', 'user', 'full_name', 'address', 'contact_number',
            'vehicle_model', 'orcr_file', 'license_photo',
            'orcr_file_url', 'license_photo_url',
            'renewal_status', 'created_at', 'status', 'user_email',
             'is_renewal', 'is_checked', 'checked_at', 'application',
             'plate_number', 'engine_no', 'chassis_no',
            'color', 'vehicle_register', 'or_no',
            'vehicle_type', 'birthday', 'age', 'picture_id','client2_approved',
            'signature', 'checked_by', 'approved_at', 'approved_by', 'signature2', 'user_status'
        ]
        read_only_fields = ['user', 'created_at']

    def get_orcr_file_url(self, obj):
        request = self.context.get('request')
        if obj.orcr_file and request:
            return request.build_absolute_uri(obj.orcr_file.url)
        return None

    def get_license_photo_url(self, obj):
        request = self.context.get('request')
        if obj.license_photo and request:
            return request.build_absolute_uri(obj.license_photo.url)
        return None
    
    def get_application(self, obj):
        from .models import Application  # Import if not already
        app = Application.objects.filter(user=obj.user).first()
        return RenewalApplicationSerializer(app).data if app else None