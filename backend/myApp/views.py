from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Profile  # Import the Profile model
from .models import Application
from .serializers import AppSerializer
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.shortcuts import get_object_or_404
from .serializers import UserSerializer, RenewalFormSerializer
from rest_framework.views import APIView
from django.utils import timezone
from django.http import JsonResponse
from .notifications.utils import send_push
from django.core.mail import send_mail
from .models import PushSubscription
from django.http import HttpResponse
from .models import  RenewalForm
from django.conf import settings
from rest_framework import status as http_status
from django.utils.timezone import now
import base64
import os, uuid
from rest_framework.parsers import MultiPartParser
from datetime import datetime
from rest_framework.decorators import parser_classes
from django.views.decorators.csrf import csrf_exempt
from .models import SystemReport
from .serializers import SystemReportSerializer
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required








import random, pytz, json


import logging

logger = logging.getLogger(__name__)

stored_request = {}






@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_send_email(request):
    try:
        user_email = request.user.email  # Send to logged-in user

        subject = "Test Email from Vehicle Sticker System"
        message = (
            f"Hello {request.user.username},\n\n"
            "This is a test email to confirm that email notifications are working properly!\n\n"
            "🚀✨"
        )

        send_mail(
            subject,
            message,
            'Vehicle Sticker System <jpdelacruz717@gmail.com>',  # Replace with your actual Gmail configured in settings.py
            [user_email],
            fail_silently=False,
        )

        return Response({"message": f"Test email sent to {user_email}!"}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

def vapid_public_key(request):
    return HttpResponse(settings.WEBPUSH_SETTINGS["VAPID_PUBLIC_KEY"])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    user = request.user
    profile = getattr(user, 'profile', None)  # safely get profile if exists

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile": {
            "position": profile.position if profile else None,
            "signature": profile.signature.url if (profile and profile.signature) else None
        }
    })



@api_view(['PUT'])
def update_user_view(request):
    data = request.data
    user_id = data.get("id")  # Require client to send user ID

    if not user_id:
        return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # ✅ Update fields
    username = data.get("username", user.username)
    email = data.get("email", user.email)

    user.username = username
    user.email = email
    user.save()

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "message": "User updated successfully!"
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def submit_report(request):
    if request.method == 'POST':
        serializer = SystemReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                {'success': True, 'message': 'Report submitted successfully'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        # Only allow staff to view reports
        if not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )

        reports = SystemReport.objects.all().order_by('-created_at')
        serializer = SystemReportSerializer(reports, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
    if not request.user.is_staff:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Only admins can access this view
    users = User.objects.all()
    user_data = [{"id": user.id, "username": user.username} for user in users]
    return Response(user_data, status=status.HTTP_200_OK)


@csrf_exempt
def manage_users(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            action = data.get('action')
            user_data = data.get('user')

            if action == 'create':
                new_user = User.objects.create_user(
                    username=user_data['username'],
                    email=user_data['email'],
                    password=user_data['password'],
                    first_name=user_data.get('first_name', ''),
                    last_name=user_data.get('last_name', ''),
                    is_staff = True
                

                )
                return JsonResponse({'success': True, 'message': 'User created successfully', 'user_id': new_user.id})

            elif action == 'edit':
                user = User.objects.get(id=user_data['id'])
                user.username = user_data['username']
                user.email = user_data['email']
                user.first_name = user_data.get('first_name', '')
                user.last_name = user_data.get('last_name', '')
                if user_data.get('password'):
                    user.set_password(user_data['password'])
                user.save()
                return JsonResponse({'success': True, 'message': 'User updated successfully'})

            elif action == 'delete':
                user = User.objects.get(id=user_data['id'])
                user.delete()
                return JsonResponse({'success': True, 'message': 'User deleted successfully'})

            else:
                return JsonResponse({'success': False, 'message': 'Invalid action'}, status=400)

        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)

    return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_view(request, user_id):
    if not request.user.is_staff:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({'message': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    print(f"User authenticated: {user}, is_staff: {user.is_staff if user else 'N/A'}")

    if user is not None and user.is_staff:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials or not an admin.'}, status=status.HTTP_401_UNAUTHORIZED)
@api_view(['POST'])
def login_view(request):
    """
    Handles user login. Authenticates the user and returns a JWT token if successful.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    # Authenticate the user
    user = authenticate(username=username, password=password)

    if user is not None:
        # Check if user is a client
        if hasattr(user, 'profile') and user.profile.is_client:
            return Response({"error": "Client accounts cannot log in here."}, status=status.HTTP_403_FORBIDDEN)

        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "message": "Login successful"
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
def signup_view(request):
    logger.info("Signup request data: %s", request.data)
    """
    Handles user signup. Validates input, creates a new user and a related profile if valid.
    """

    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')# optional extra field for profile
    is_client = request.data.get('is_client', False)  # optional boolean

    # Validate required fields
    if not username or not password or not email:
        return Response(
            {"error": "Username, password, and email are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if username or email already exists
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create User
        user = User.objects.create_user(username=username, password=password, email=email)
        user.full_clean()
        user.save()

        # Create associated Profile
        profile = Profile.objects.create(
            user=user,
            is_client=is_client,
            is_subscribed=False,  # default
        )
        profile.save()

        return Response({"message": "User and profile created successfully"}, status=status.HTTP_201_CREATED)

    except ValidationError as e:
        logger.error("Validation error: %s", e)
        return Response({"error": e.message_dict}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error("Unexpected error: %s", e)
        return Response({"error": "Something went wrong."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def login_client(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)

    if user is not None:
        # Check if user is a client
        if not hasattr(user, 'profile') or not user.profile.is_client:
            return Response({"error": "This account is not a client account."}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            "message": "Client login successful"
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid credentials or not a client"}, status=status.HTTP_400_BAD_REQUEST)






@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_signature(request):
    signature_data = request.data.get('signature')

    if not signature_data:
        return Response({"error": "Signature is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        if "base64," in signature_data:
            header, base64_data = signature_data.split(";base64,")
        else:
            return Response({"error": "Invalid image format"}, status=status.HTTP_400_BAD_REQUEST)

        img_bytes = base64.b64decode(base64_data)

        # Prepare file path
        filename = f"{request.user.username}_signature_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        relative_path = os.path.join("signatures", filename)
        full_path = os.path.join(settings.MEDIA_ROOT, relative_path)

        # Ensure directory exists
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        # Get profile (keep old signature files)
        profile = request.user.profile

        # Save new image
        with open(full_path, 'wb') as f:
            f.write(img_bytes)

        # Update profile (store latest signature in the ImageField)
        profile.signature.name = relative_path
        profile.save()

        return Response({
            "message": "New signature saved successfully",
            "signature_url": profile.signature.url
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def all_applications_view(request):
    applications = Application.objects.all()
    renewals = RenewalForm.objects.all()

    serialized_applications = AppSerializer(applications, many=True).data
    serialized_renewals = RenewalFormSerializer(renewals, many=True).data

    # Add type field to distinguish
    for item in serialized_applications:
        item['type'] = 'application'
    for item in serialized_renewals:
        item['type'] = 'renewal'

    combined = serialized_applications + serialized_renewals

    return Response(combined)

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Ensure only authenticated users can access this endpoint
def add_client(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)

    # Create a profile for the user and set is_client to True
    Profile.objects.create(user=user, is_client=True)  # Ensure is_client is set to True

    return Response({"message": "Client added successfully"}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser])
@permission_classes([IsAuthenticated])
def create_application(request):
    if request.method == 'GET':
        applications = Application.objects.filter(user=request.user)
        serializer = AppSerializer(applications, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        try:
            required_files = ['license_photos', 'picture_id', 'photos', 'vehicle_photos', 'pipe_photos']
            missing = [field for field in required_files if not request.FILES.get(field)]

            # Handle vehicle photos (no categories now)

            print("📝 request.POST keys:", request.POST.keys())
            print("🗂️ request.FILES keys:", request.FILES.keys())

            for key, file in request.FILES.items():
                print(f"📥 {key}: {file.name}, {file.content_type}, size={file.size}")


            print('📥 Incoming FILES:')
            for key, file in request.FILES.items():
                print(f"  - {key}: {file.name}")


          


            if missing:
                print(f"❌ Missing files: {missing}")
                return Response({"error": f"Missing required file(s): {', '.join(missing)}"}, status=400)

            # Serialize and save Application
            data = request.data.copy()
            data['license_photos'] = request.FILES['license_photos']
            data['picture_id'] = request.FILES['picture_id']
            data['photos'] = request.FILES['photos']
            data['vehicle_photos'] = request.FILES['vehicle_photos']
            data['pipe_photos'] = request.FILES['pipe_photos']

           

            serializer = AppSerializer(data=data, context={'request': request})
            if serializer.is_valid():
                application = serializer.save(user=request.user)
                print("✅ Application saved:", application)

                return Response(AppSerializer(application, context={'request': request}).data, status=201)

            print("❌ Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=400)

        except Exception as e:
            print("🔥 Exception occurred:", str(e))
            return Response({"error": str(e)}, status=500)



    
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def create_renewal(request):
    if request.method == 'GET':
        if request.user.is_staff:
            renewals = RenewalForm.objects.all()
            app = Application.objects.filter(user=request.user)  # ✅ correct for logged-in user
        else:
            renewals = RenewalForm.objects.filter(user=request.user)

        serializer = RenewalFormSerializer(renewals, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        data = request.data.copy()

        # Match Application from ANY user with 3 fields and app_status='Done'
        matched_app = Application.objects.filter(
            status='Application Done',
            name=data.get('full_name'),
            address=data.get('address'),
            model_make=data.get('vehicle_model')
        ).order_by('-created_at').first()

        if not matched_app:
            return Response({
                'error': 'Renewal rejected: No matching approved application found with the same Full Name, Address, and Vehicle Model.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Link to the matched application
        data['is_renewal'] = True

        data['plate_number'] = matched_app.plate_number
        data['engine_no'] = matched_app.engine_no
        data['chassis_no'] = matched_app.chassis_no
        data['color'] = matched_app.color
        data['vehicle_register'] = matched_app.vehicle_register
        data['or_no'] = matched_app.or_no
        data['vehicle_type'] = matched_app.vehicle_type
        data['birthday'] = matched_app.birthday
        data['age'] = matched_app.age
        # ✅ If matched_app has picture_id
        if matched_app.picture_id:
            data['picture_id'] = matched_app.picture_id

        # Proceed with saving renewal
        serializer = RenewalFormSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            renewal = serializer.save(user=request.user)
            return Response({'id': renewal.id}, status=status.HTTP_201_CREATED)
        else:
            print('Validation Errors:', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_renewal_picture(request, pk):
    try:
        renewal = RenewalForm.objects.get(pk=pk, user=request.user)
    except RenewalForm.DoesNotExist:
        return Response({'error': 'Renewal not found.'}, status=status.HTTP_404_NOT_FOUND)

    if 'picture_id' in request.FILES:
        renewal.picture_id = request.FILES['picture_id']
        renewal.save()
        return Response({'success': 'Picture ID updated successfully.'}, status=status.HTTP_200_OK)

    return Response({'error': 'No picture provided.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def approve_renewal(request, pk):

    try:
        profile = request.user.profile

        if not profile.signature:
            return Response({'error': 'You must have a signature saved before approving.'}, status=status.HTTP_400_BAD_REQUEST)

        client_name = f"{request.user.first_name} {request.user.last_name}"

        renewal = RenewalForm.objects.get(pk=pk)
        renewal.is_checked = True
        renewal.status = "Waiting Approval"
        renewal.checked_by = client_name
        renewal.checked_at = now()
        renewal.signature = profile.signature 
        renewal.save()

        push_payload = {
            "head": "Your Renewal Form Was Checked!",
            "body": (
                f"Good news, Mr./Ms. {renewal.full_name}! "
                f"Your renewal form has been checked by {client_name}. "
                "Please log in to your dashboard to see the details and next steps."
            ),
            "icon": "/DEBES.jpg",
            "url": "/dashboard"
        }

        subscriptions = PushSubscription.objects.filter(user=renewal.user)

        for sub in subscriptions:
                try:
                    send_push(sub, push_payload)
                except Exception as e:
                    # Catch unexpected errors (send_push already handles WebPushException)
                    print(f"Unexpected error sending push to subscription {sub.id}: {e}")

        user_email = renewal.user.email # Send to logged-in user

        subject = "Vehicle Sticker System"
        message = (
            f"Dear {renewal.full_name},\n\n"
            f"We are pleased to inform you that your vehicle sticker renewal form has been checked and reviewed by {client_name}.\n\n"
            "You may now log in to your dashboard to view the details and the next steps of your application.\n\n"
            "👉 Access your dashboard here: http://localhost:3000/dashboard\n\n"
            "Thank you for using the Vehicle Sticker System.\n\n"
            "Best regards,\n"
            "Vehicle Sticker System Team"
        )

        send_mail(
            subject,
            message,
            'Vehicle Sticker System <jpdelacruz717@gmail.com>',  # Replace with your actual Gmail configured in settings.py
            [user_email],
            fail_silently=False,
        )
        

        
        return Response({"message": "Renewal approved",'signature': renewal.signature.url if renewal.signature else None, }, status=http_status.HTTP_200_OK)
    except RenewalForm.DoesNotExist:
        return Response({"error": "Renewal not found."}, status=http_status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def client2_approve_renewal(request, pk):

    try:
        profile = request.user.profile

        if not profile.signature:
            return Response({'error': 'You must have a signature saved before approving.'}, status=status.HTTP_400_BAD_REQUEST)

        client_name = f"{request.user.first_name} {request.user.last_name}"

        renewal = RenewalForm.objects.get(pk=pk)
        renewal.client2_approved = True
        renewal.user_status = 'User Done'
        renewal.status = "Renewal Done"
        renewal.approved_by= client_name
        renewal.approved_at = now()
        renewal.signature2 = profile.signature 
        renewal.save()

        push_payload = {
            "head": "Renewal Approved",
            "body": f"Good news, Mr./Ms. {renewal.full_name}! Your renewal has been approved by {client_name}. Check your dashboard for details.",
            "icon": "/DEBES.jpg",
            "url": "/dashboard"
        }

        subscriptions = PushSubscription.objects.filter(user=renewal.user)

        for sub in subscriptions:
                try:
                    send_push(sub, push_payload)
                except Exception as e:
                    # Catch unexpected errors (send_push already handles WebPushException)
                    print(f"Unexpected error sending push to subscription {sub.id}: {e}")

        user_email = renewal.user.email # Send to logged-in user

        subject = "Vehicle Sticker System"
        message = (
            f"Dear {renewal.full_name},\n\n"
            f"We are pleased to inform you that your vehicle sticker renewal form has been approved and validated by {client_name}.\n\n"
            "You may now log in to your dashboard to view the details and the next steps of your application.\n\n"
            "👉 Access your dashboard here: http://localhost:3000/dashboard\n\n"
            "Thank you for using the Vehicle Sticker System.\n\n"
            "Best regards,\n"
            "Vehicle Sticker System Team"
        )

        send_mail(
            subject,
            message,
            'Vehicle Sticker System <jpdelacruz717@gmail.com>',  # Replace with your actual Gmail configured in settings.py
            [user_email],
            fail_silently=False,
        )

        return Response({"message": "Renewal approved",'signature2': renewal.signature2.url if renewal.signature2 else None, }, status=http_status.HTTP_200_OK)
    except RenewalForm.DoesNotExist:
        return Response({"error": "Renewal not found."}, status=http_status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_application(request, pk):
    try:
        application = Application.objects.get(pk=pk)

        # Check if the logged-in user owns this application
        if application.user != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'GET':
            serializer = AppSerializer(application)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # If PUT or PATCH, set status back to "checking application"
        data = request.data.copy()  # Make a mutable copy of the data
        data['status'] = 'Checking Application'
        data['app_status'] = 'Pending'
        data['is_disapproved'] = False
        data['disapproved_by'] = None

        # Allow partial update with PATCH or full update with PUT
        serializer = AppSerializer(application, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print('Validation Errors:', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Application.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print('Error:', str(e))
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_applications(request):
    try:
        if request.user.is_staff:
            applications = Application.objects.all()
        else:
            applications = Application.objects.filter(user=request.user)
        serializer = AppSerializer(applications, many=True)
        return Response(serializer.data)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=500)



@api_view(['GET'])
def get_application_detail(request, id):
    try:
        application = Application.objects.get(id=id)
        serializer = AppSerializer(application)
        return Response(serializer.data)
    except Application.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def approve_application(request, pk):
    try:
        application = Application.objects.get(pk=pk)

        if not request.user:
            return Response({'error': 'You are not authorized to approve applications.'}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'GET':
            approval_status = {
                'id': application.id,
                'is_approved': application.is_approved,
                'checked_by': application.checked_by,
                'user_name': application.user.username,
                'client_name': f"{application.user.first_name} {application.user.last_name}"
            }
            return Response(approval_status, status=status.HTTP_200_OK)

        elif request.method == 'POST':
            client_name = f"{request.user.first_name} {request.user.last_name}"

            profile = request.user.profile
            if not profile.signature:
                return Response({'error': 'You must have a signature saved before approving.'}, status=status.HTTP_400_BAD_REQUEST)

            # Approve application
            application.is_approved = True
            application.checked_by = client_name
            application.status = "Waiting Approval"
            application.signature = profile.signature 

            # Forward to Person 2 automatically
            application.is_forwarded_to_person2 = True
            application.person2_received_at = timezone.now()

            application.save()

            push_payload = {
                "head": "Your Vehicle Sticker Application Was Checked!",
                "body": (
                    f"Good news! Mr./Ms. {application.name}! Your submitted application has been carefully reviewed "
                    f"and checked by {client_name}. Please log in to your dashboard to see the details and next steps."
                ),
                "icon": "/DEBES.jpg",
                "url": "/dashboard"
            }

            # Fetch all subscriptions for the user
            subscriptions = PushSubscription.objects.filter(user=application.user)

            for sub in subscriptions:
                try:
                    send_push(sub, push_payload)
                except Exception as e:
                    # Catch unexpected errors (send_push already handles WebPushException)
                    print(f"Unexpected error sending push to subscription {sub.id}: {e}")

            user_email = application.user.email # Send to logged-in user

            subject = "Vehicle Sticker System"
            message = (
                f"Dear {application.name},\n\n"
                f"We are writing to let you know that your vehicle sticker application has been successfully checked and reviewed by {client_name}.\n\n"
                "Please log in to your dashboard to view the review details and follow the next steps for your application.\n\n"
                "👉 Access your dashboard here: http://localhost:3000/dashboard\n\n"
                "We appreciate your cooperation and thank you for using the Vehicle Sticker System.\n\n"
                "Best regards,\n"
                "Vehicle Sticker System Team"
            )

            send_mail(
                subject,
                message,
                'Vehicle Sticker System <jpdelacruz717@gmail.com>',  # Replace with your actual Gmail configured in settings.py
                [user_email],
                fail_silently=False,
            )


            return Response({
                'id': application.id,
                'is_approved': application.is_approved,
                'checked_by': application.checked_by,
                'signature': application.signature.url if application.signature else None,
                'is_forwarded_to_person2': application.is_forwarded_to_person2,
                'person2_received_at': application.person2_received_at,
                'client_name': client_name,
                'status': application.status,
            }, status=status.HTTP_200_OK)

    except Application.DoesNotExist:
        return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
def check_username(request, username):
    try:
        profile = Profile.objects.get(user__username=username)  # 👈 use user__username to access related User
        return JsonResponse({
            'exists': True,
            'email': profile.user.email  # 👈 get email from related User
        })
    except Profile.DoesNotExist:  # 👈 correct exception
        return JsonResponse({'exists': False})
    

def send_verification_code(request, username):
    try:
        profile = Profile.objects.get(user__username=username)
        email = profile.user.email  

        # Generate 6-digit code
        code = str(random.randint(100000, 999999))

        # Save the code in Profile
        profile.verification_code = code
        profile.save()

        # Send email
        send_mail(
            'Your Verification Code',
            f'Hello {username},\n\nYour verification code is: {code}\n\nIf you did not request this, please ignore.',
            'no-reply@yourdomain.com',  
            [email],
            fail_silently=False,
        )

        return JsonResponse({'success': True, 'email': email})

    except Profile.DoesNotExist:
     
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)


@csrf_exempt
@require_POST
def verify_code(request):
    data = json.loads(request.body)
    username = data.get('username')
    input_code = data.get('code')

    try:
        profile = Profile.objects.get(user__username=username)

        if profile.verification_code == input_code:
            # Generate a one-time reset token
            reset_token = str(uuid.uuid4())
            profile.reset_token = reset_token
            profile.verification_code = None
            profile.save()

            return JsonResponse({
                'success': True,
                'email': profile.user.email,
                'token': reset_token
            })
        else:
            return JsonResponse({'success': False, 'error': 'Invalid code'}, status=400)

    except Profile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)


@csrf_exempt
@require_POST
def reset_password(request):
    try:
        data = json.loads(request.body)
        username = data.get("username") 
        token = data.get("token")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if not all([username, token, new_password, confirm_password]):
            return JsonResponse({"success": False, "error": "All fields are required."}, status=400)

        if new_password != confirm_password:
            return JsonResponse({"success": False, "error": "Passwords do not match."}, status=400)

        try:
            user = User.objects.get(username=username)
            profile = Profile.objects.get(user=user)
        except (User.DoesNotExist, Profile.DoesNotExist):
            return JsonResponse({"success": False, "error": "User not found."}, status=404)

        # Check token validity
        if profile.reset_token != token:
            return JsonResponse({"success": False, "error": "Invalid or expired token."}, status=400)

        # Reset password
        user.set_password(new_password)
        user.save()

        # Clear reset token
        profile.reset_token = None
        profile.save()

        return JsonResponse({"success": True, "message": "Password successfully reset!"})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def disapprove_application(request, pk):
    try:
        application = Application.objects.get(pk=pk)

        if request.method == 'GET':
            approval_status = {
                'id': application.id,
                'is_disapproved': application.is_disapproved,
                'disapproved_by': application.disapproved_by,
                'user_name': application.user.username,
                'client_name': f"{application.user.first_name} {application.user.last_name}"
            }
            return Response(approval_status, status=status.HTTP_200_OK)

        elif request.method == 'POST':
            # Assuming client_name is the name of the user disapproving the application
            client_name = f"{request.user.first_name} {request.user.last_name}"
            application.is_disapproved = True
            application.disapproved_by = client_name
            application.app_status = 'Pending'
            application.status = 'Disapproved'
            application.disapproved_time = timezone.now()
            application.save()

            push_payload = {
                "head": "Vehicle Sticker Application Disapproved",
                "body": (
                    f"Unfortunately, Mr./Ms. {application.name}! your application submitted was disapproved "
                    f"by {client_name}. Please log in to your dashboard to review the reason and possible next steps."
                ),
                "icon": "/DEBES.jpg",
                "url": "/dashboard"
            }

            subscriptions = PushSubscription.objects.filter(user=application.user)

            for sub in subscriptions:
                try:
                    send_push(sub, push_payload)
                except Exception as e:
                    # Catch any unexpected errors just in case
                    print(f"Unexpected error sending push to subscription {sub.id}: {e}")

            user_email = application.user.email # Send to logged-in user

            subject = "Vehicle Sticker System"
            message = (
                f"Dear {application.name},\n\n"
                f"We regret to inform you that your vehicle sticker application has not been approved after being reviewed by {client_name}.\n\n"
                "You may log in to your dashboard to review the details and the reason for this decision.\n\n"
                "👉 Access your dashboard here: http://localhost:3000/dashboard\n\n"
                "If you believe this was made in error or wish to reapply, please follow the instructions provided in your dashboard.\n\n"
                "Thank you for your understanding.\n\n"
                "Best regards,\n"
                "Vehicle Sticker System Team"
            )

            send_mail(
                subject,
                message,
                'Vehicle Sticker System <jpdelacruz717@gmail.com>',  # Replace with your actual Gmail configured in settings.py
                [user_email],
                fail_silently=False,
            )




            return Response({
                'id': application.id,
                'is_disapproved': application.is_disapproved,
                'disapproved_by': application.disapproved_by,
                'client_name': client_name,
                'app_status': application.app_status,
                'status': application.status,
                'disapproved_time' : application.disapproved_time
            }, status=status.HTTP_200_OK)

    except Application.DoesNotExist:
        return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def client2_approve_application(request, pk):
    try:
        application = Application.objects.get(pk=pk)
        if not request.user:
            return Response({'error': 'You are not authorized to approve applications.'}, status=status.HTTP_403_FORBIDDEN)


        if request.method == 'GET':
            approval_status = {
                'id': application.id,
                'is_client2_approved': application.is_client2_approved,
                'approved_by': application.approved_by,
                'user_name': application.user.username,
                'client_name': f"{application.user.first_name} {application.user.last_name}"
            }
            return Response(approval_status, status=status.HTTP_200_OK)

        elif request.method == 'POST':
            client_name = f"{request.user.first_name} {request.user.last_name}"

            profile = request.user.profile
            if not profile.signature:
                return Response({'error': 'You must have a signature saved before approving.'}, status=status.HTTP_400_BAD_REQUEST)

            # Mark the application as approved and set the person who approved it
            application.is_client2_approved = True
            application.approved_by = client_name
            application.status = "Application Done"
            application.client2_approved_time = timezone.now()
            application.signature2 = profile.signature 
            application.user_status = 'User Done'
          

            application.save()

            push_payload = {
                "head": "✅ Vehicle Sticker Application Validated",
                "body": (
                    f"Success! Mr./Ms. {application.name}! Your application has been validated by {client_name}. and is now fully completed. "
                    "Check your dashboard for instructions!"
                ),
                "icon": "/DEBES.jpg",
                "url": "/dashboard"
            }

            subscriptions = PushSubscription.objects.filter(user=application.user)

            for sub in subscriptions:
                try:
                    send_push(sub, push_payload)
                except Exception as e:
                    # Catch any unexpected errors just in case
                    print(f"Unexpected error sending push to subscription {sub.id}: {e}")
           
            user_email = application.user.email

            subject = "Vehicle Sticker System"
            message = (
                f"Dear {application.name},\n\n"
                f"Congratulations! Your vehicle sticker application has been approved and validated by {client_name}.\n\n"
                "You can now log in to your dashboard to view the approval details and the next steps regarding your vehicle sticker.\n\n"
                "👉 Access your dashboard here: http://localhost:3000/dashboard\n\n"
                "Thank you for your trust and cooperation. We’re glad to assist you through the Vehicle Sticker System.\n\n"
                "Best regards,\n"
                "Vehicle Sticker System Team"
            )


            send_mail(
                subject,
                message,
                'Vehicle Sticker System <jpdelacruz717@gmail.com>',  # Replace with your actual Gmail configured in settings.py
                [user_email],
                fail_silently=False,
            )


            return Response({
                'id': application.id,
                'is_client2_approved': application.is_client2_approved,
                'approved_by': application.approved_by,
                'client_name': client_name,
                'status': application.status,
                'client2_approved_time': application.client2_approved_time,
                'signature': application.signature2.url if application.signature2 else None,

                
                
            }, status=status.HTTP_200_OK)  # Return the updated approval status
    except Application.DoesNotExist:
        return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_to_person2(request, application_id):
    try:
        # Find the application by ID
        application = Application.objects.get(id=application_id, user=request.user)
        
        # Update the application's status to mark it as submitted
        if application.status != 'Checking Application':
            return Response({'error': 'Application can only be submitted if it is in pending status.'},status=status.HTTP_400_BAD_REQUEST)

            # Update application status to indicate it’s been submitted to Person 2
        application.status = 'Waiting Approval'
        application.save()
        
        # Optionally, you can serialize the updated application data to send back
        serializer = AppSerializer(application)
        return Response({
            'message': 'Application successfully submitted to Person 2.',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Application.DoesNotExist:
        return Response({
            'error': 'Application not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    
@api_view(['GET'])
def get_submitted_applications(request):
    print(f"Authenticated User: {request.user}")  # Log the current user
    applications = Application.objects.all()
    
    print(f"Applications Found: {applications}")  # Log the query result
    if not applications:
        print("No applications found.")  # Log if no applications match the filter

    serializer = AppSerializer(applications, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_submitted(request):
    applications = Application.objects.filter(user = request.user)
    serializer = AppSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_application_by_id(request, application_id):
    try:
        application = get_object_or_404(Application, id=application_id, user=request.user)
        serializer = AppSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





@api_view(['POST'])
def reject_application(request, application_id):
    try:
        # Fetch the application by ID
        application = Application.objects.get(id=application_id)

        # Mark the payment status as rejected
        application.payment_status = 'unpaid'
        application.status = 'Proceed to Payment'
        application.rejected_at = timezone.now()  # You can add a `rejected_at` field if needed.
        application.save()

        return Response({'message': 'Payment rejected successfully.'}, status=status.HTTP_200_OK)

    except Application.DoesNotExist:
        return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_pending_application(request):
    # Filter for pending applications by the logged-in user
    has_pending = Application.objects.filter(user=request.user, app_status='Pending', status= 'Disapproved' ).exists()

    return Response({'pending': has_pending})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_done_application(request, application_id):
     try:
        # Fetch application by ID and ensure the status is 'Payment Done'
        application = Application.objects.get(id=application_id, status='Application Done')

        # Get the admin name from the logged-in user
        admin_name = request.user.get_full_name() or request.user.username

        data = {
            "applicationNo": application.id,  # Assuming `id` serves as the application number
            "name": application.name,
            "orNoDate": application.or_no,
            "stickerNo": application.sticker_number,
            "adminName": admin_name,
        }
        serializer = AppSerializer(application)
        data.update(serializer.data)  # Add serialized data to the response
        
        return Response(data)
    
     except Application.DoesNotExist:
        return Response({'error': 'Application not found or status not done.'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client2_approved(request):
    get_application = Application.objects.filter(is_client2_approved=True, user=request.user)
    serializer = AppSerializer(get_application, many=True)
    approved_ids = [app['id'] for app in serializer.data]  # Extract only IDs
    print("Approved Application IDs:", approved_ids)  # Print for debugging
    return Response({"approved_ids": approved_ids})


class GetUsers(APIView):
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_id(request):
    try:
        # Get applications for the authenticated user
        applications = Application.objects.filter(user=request.user)  # Filter applications by user
        app_data = [
            {
                'id': app.id,
                'status': app.status,
                'is_approved': app.is_approved,
                'is_client2_approved': app.is_client2_approved
                # Include other fields as needed
            }
            for app in applications
        ]
        return Response(app_data, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    user = request.user
    applications = Application.objects.filter(user=user)
    renewal = RenewalForm.objects.filter(user=user)

    notifications = []
    manila_tz = pytz.timezone('Asia/Manila')

    for app in applications:
        if app.is_approved and app.checked_by and app.person2_received_at:
            local_dt = app.person2_received_at.astimezone(manila_tz)
            message = (
                f"Congratulations! Your Application APP-{app.id}-25 has been reviewed "
                f"and checked by {app.checked_by} on {local_dt.strftime('%B %d, %Y, %#I:%M %p')}."
            )
            notifications.append(message)
            

        if app.is_client2_approved and app.approved_by and app.approved_time:
            local_dt = app.approved_time.astimezone(manila_tz)
            message = (
                f" Congratulations! Your Application APP-{app.id}-25 has been approved by "
                f"{app.approved_by} on {local_dt.strftime('%B %d, %Y at %I:%M %p')}."
            )
            notifications.append(message)
            

        if app.status == "Application Done":
            message = (
                " Success! Application Done — You can now claim your temporary sticker "
                "and print the form with the validator's signature."
            )
            notifications.append(message)
            

        if app.is_disapproved and app.disapproved_by and app.disapproved_time:
            local_dt = app.disapproved_time.astimezone(manila_tz)
            message = (
                f"Unfortunately, your Application APP-{app.id}-25 was disapproved by "
                f"{app.disapproved_by} on {local_dt.strftime('%B %d, %Y at %I:%M %p')}."
            )
            notifications.append(message)

    for renew in renewal:
        if renew.is_checked and renew.checked_by and renew.checked_at:
            local_dt = renew.checked_at.astimezone(manila_tz)
            message = (
                f"Congratulations! Your Renewal APP-{renew.id}-25 has been reviewed "
                f"and checked by {renew.checked_by} on {local_dt.strftime('%B %d, %Y, %#I:%M %p')}."
            )
            notifications.append(message)
        if renew.client2_approved and renew.approved_by and renew.approved_at:
            local_dt = renew.approved_at.astimezone(manila_tz)
            message = (
                f" Congratulations! Your Renewal Application APP-{renew.id}-25 has been approved by "
                f"{renew.approved_by} on {local_dt.strftime('%B %d, %Y at %I:%M %p')}."
            )
            notifications.append(message)

        if renew.status == "Renewal Done":
            message = (
                " Success! Renewal Application Done — You can now claim your temporary sticker "
                "and print the form with the validator's signature."
            )
            notifications.append(message)

            

    # ❌ Removed push sending
    # Subscriptions and send_push logic have been completely removed

    return Response({"notifications": notifications})




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_information(request):
    print("save_information view entered")
    try:
        body_data = json.loads(request.body.decode('utf-8'))
        subscription = body_data.get('subscription')

        if not subscription:
            return JsonResponse({'error': 'Subscription data missing'}, status=400)

        endpoint = subscription.get('endpoint')
        keys = subscription.get('keys', {})
        p256dh = keys.get('p256dh')
        auth = keys.get('auth')

        if not endpoint or not p256dh or not auth:
            return JsonResponse({'error': 'Incomplete subscription data'}, status=400)

        # Save subscription (supports multiple devices)
        PushSubscription.objects.update_or_create(
            user=request.user,
            endpoint=endpoint,
            defaults={'p256dh': p256dh, 'auth': auth}
        )

        # Mark profile as subscribed
        Profile.objects.update_or_create(
            user=request.user,
            defaults={'is_subscribed': True}
        )

        return JsonResponse({'message': 'Subscription saved successfully!'}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        print("Exception:", e)
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_subscription_status(request):
    user = request.user
    try:
        profile = Profile.objects.get(user=user)
        return JsonResponse({'is_subscribed': profile.is_subscribed})
    except Profile.DoesNotExist:
        return JsonResponse({'is_subscribed': False})



@api_view(['POST'])
def custom_token_refresh(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token is required'}, status=400)

    try:
        token = RefreshToken(refresh_token)
        access_token = str(token.access_token)
        return Response({'access': access_token})
    except TokenError:
        return Response({'error': 'Invalid or expired refresh token'}, status=401)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_form_by_id(request, id):
    try:
        # Try Renewal first
        renewal = RenewalForm.objects.get(id=id)
        return Response({
            'is_renewal': True,
            'data': RenewalFormSerializer(renewal, context={'request': request}).data
        }, status=200)
    except RenewalForm.DoesNotExist:
        try:
            # Then try Application
            app = Application.objects.get(id=id)
            return Response({
                'is_renewal': False,
                'data': AppSerializer(app, context={'request': request}).data
            }, status=200)
        except Application.DoesNotExist:
            return Response({'error': 'Form not found.'}, status=404)


@csrf_exempt
@api_view(["POST"])  # accept JWT
@permission_classes([IsAuthenticated])          # require logged in
def respond_report(request, report_id):
    """
    Receives a response from admin and sends it via email to the report owner.
    """
    try:
        report = SystemReport.objects.get(id=report_id)
    except SystemReport.DoesNotExist:
        return JsonResponse({"error": "Report not found"}, status=404)

    try:
        data = request.data   # DRF parses JSON for you
        reason = data.get("reason")
        message = data.get("message")

        user_email = report.user.email

        subject = f"Response to your report: {reason}"
        full_message = (
            f"Hello {report.user.username},\n\n"
            f"{message}\n\n"
            "📌 This is an automated message from Vehicle Sticker System."
        )

        send_mail(
            subject,
            full_message,
            'Vehicle Sticker System <jpdelacruz717@gmail.com>',
            [user_email],
            fail_silently=False,
        )
        print("sucess")

        return JsonResponse({"success": "Response sent successfully!"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)